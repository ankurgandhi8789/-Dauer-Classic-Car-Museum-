const { v4: uuidv4 } = require("uuid");
const { TICKET_TYPES, MUSEUM_CONFIG } = require("../config/ticketConfig");
const { payments } = require("../config/store"); // payments are not connected yet, kept in memory
const Booking = require("../models/Booking");

// ─── REFERENCE GENERATION ─────────────────────────────────────────────────────

function generateBookingReference() {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DCA-${year}-${rand}`;
}

// ─── DATE VALIDATION ──────────────────────────────────────────────────────────

function isMuseumOpen(dateStr) {
  const day = new Date(dateStr + "T12:00:00").getDay(); // 0=Sun … 6=Sat
  return MUSEUM_CONFIG.openDays.includes(day);
}

function isDateInPast(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr + "T00:00:00") < today;
}

// ─── PRICE CALCULATION (server-side, never trust frontend) ────────────────────

function calculateOrderTotal(items) {
  let subtotal = 0;
  const lineItems = [];

  for (const item of items) {
    const ticketType = TICKET_TYPES.find((t) => t.id === item.ticketTypeId && t.isActive);
    if (!ticketType) throw new Error(`Unknown ticket type: ${item.ticketTypeId}`);

    const qty = parseInt(item.quantity, 10);
    if (!Number.isInteger(qty) || qty < 0) throw new Error(`Invalid quantity for ${item.ticketTypeId}`);
    if (qty === 0) continue;

    if (ticketType.minimumQuantity > 0 && qty < ticketType.minimumQuantity) {
      throw new Error(`${ticketType.name} requires a minimum of ${ticketType.minimumQuantity} tickets.`);
    }
    if (qty > ticketType.maximumQuantity) {
      throw new Error(`${ticketType.name} maximum is ${ticketType.maximumQuantity} tickets.`);
    }

    const lineSubtotal = ticketType.price * qty;
    subtotal += lineSubtotal;

    lineItems.push({
      ticketTypeId: ticketType.id,
      ticketName: ticketType.name,
      tourType: ticketType.tourType,
      quantity: qty,
      unitPrice: ticketType.price,
      subtotal: lineSubtotal,
      requiresId: ticketType.requiresId || false,
    });
  }

  return { lineItems, subtotal, total: subtotal };
}

// ─── BOOKING CREATION ─────────────────────────────────────────────────────────
// Payment is not connected yet: a new booking is saved as "confirmed" with
// paymentStatus "pending". When payment is added, create it as bookingStatus "pending"
// and let confirmBookingPayment() confirm it.

async function createBooking({ customer, visitDate, visitTime, items }) {
  if (isDateInPast(visitDate)) throw new Error("Visit date cannot be in the past.");
  if (!isMuseumOpen(visitDate)) throw new Error("The museum is closed on that day. We are open Monday–Saturday.");
  if (!MUSEUM_CONFIG.timeSlots.includes(visitTime)) throw new Error("Invalid visit time slot.");

  const nonZero = items.filter((i) => parseInt(i.quantity, 10) > 0);
  if (nonZero.length === 0) throw new Error("Please select at least one ticket.");

  const { lineItems, subtotal, total } = calculateOrderTotal(items);
  if (lineItems.length === 0) throw new Error("Please select at least one ticket.");

  const data = {
    qrToken: uuidv4(),
    firstName: customer.firstName.trim(),
    lastName: customer.lastName.trim(),
    email: customer.email.trim().toLowerCase(),
    phone: customer.phone.trim(),
    notes: String(customer.notes || "").trim().slice(0, 500),
    visitDate,
    visitTime,
    items: lineItems,
    subtotal,
    total,
    currency: "USD",
    paymentStatus: "pending",
    bookingStatus: "confirmed",
  };

  // Retry if the random reference happens to already exist.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const doc = await Booking.create({ ...data, bookingReference: generateBookingReference() });
      return doc.toObject();
    } catch (err) {
      if (err.code === 11000 && err.keyPattern && err.keyPattern.bookingReference) continue;
      throw err;
    }
  }
  throw new Error("Could not create a booking reference. Please try again.");
}

// ─── PAYMENT CONFIRMATION (not used by the frontend yet) ──────────────────────

async function confirmBookingPayment(bookingReference, transactionId, paymentProvider) {
  const booking = await Booking.findOne({ bookingReference });
  if (!booking) throw new Error("Booking not found.");
  if (booking.paymentStatus === "paid") throw new Error("Booking already paid — duplicate payment prevented.");

  payments.set(bookingReference, {
    bookingId: String(booking._id),
    bookingReference,
    provider: paymentProvider || "mock",
    transactionId,
    amount: booking.total,
    currency: "USD",
    status: "paid",
    createdAt: new Date().toISOString(),
  });

  booking.paymentStatus = "paid";
  booking.bookingStatus = "confirmed";
  await booking.save();
  return booking.toObject();
}

async function failBookingPayment(bookingReference) {
  await Booking.updateOne({ bookingReference }, { $set: { paymentStatus: "failed" } });
}

// ─── LOOKUP ───────────────────────────────────────────────────────────────────

async function getBookingByReference(ref) {
  return Booking.findOne({ bookingReference: String(ref) }).lean();
}

async function getBookingByToken(token) {
  return Booking.findOne({ qrToken: String(token) }).lean();
}

// ─── CHECK-IN / TICKET VALIDATION ────────────────────────────────────────────

async function validateAndCheckin(token) {
  const booking = await getBookingByToken(token);

  if (!booking) return { valid: false, code: "INVALID_TICKET", message: "INVALID TICKET" };
  if (booking.paymentStatus !== "paid") return { valid: false, code: "PAYMENT_PENDING", message: "PAYMENT NOT CONFIRMED" };
  if (booking.bookingStatus === "used") return { valid: false, code: "ALREADY_USED", message: "ALREADY USED" };
  if (booking.bookingStatus === "cancelled") return { valid: false, code: "CANCELLED", message: "BOOKING CANCELLED" };

  const today = new Date().toISOString().split("T")[0];
  if (booking.visitDate !== today) {
    return { valid: false, code: "WRONG_DATE", message: `TICKET NOT VALID FOR TODAY — Valid for ${booking.visitDate}` };
  }

  // Atomic update so two scans at the same time cannot both succeed.
  const res = await Booking.updateOne({ _id: booking._id, bookingStatus: { $ne: "used" } }, { $set: { bookingStatus: "used" } });
  if (!res.modifiedCount) return { valid: false, code: "ALREADY_USED", message: "ALREADY USED" };

  return {
    valid: true,
    code: "VALID",
    message: "VALID — BOOKING CONFIRMED",
    booking: {
      bookingReference: booking.bookingReference,
      customerName: `${booking.firstName} ${booking.lastName}`,
      visitDate: booking.visitDate,
      visitTime: booking.visitTime,
      items: booking.items,
      total: booking.total,
    },
  };
}

module.exports = {
  createBooking,
  confirmBookingPayment,
  failBookingPayment,
  getBookingByReference,
  getBookingByToken,
  validateAndCheckin,
  isMuseumOpen,
  MUSEUM_CONFIG,
};
