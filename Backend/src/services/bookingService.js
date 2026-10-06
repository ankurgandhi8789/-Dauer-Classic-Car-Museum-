const { v4: uuidv4 } = require("uuid");
const { TICKET_TYPES, MUSEUM_CONFIG } = require("../config/ticketConfig");
const { bookings, bookingsByToken, payments } = require("../config/store");

// ─── REFERENCE GENERATION ─────────────────────────────────────────────────────

function generateBookingReference() {
  const year = new Date().getFullYear();
  // Random 6-char alphanumeric — not sequential, does not expose record count
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DCA-${year}-${rand}`;
}

function generateQrToken() {
  // Secure UUID — only this token goes in the QR code, never customer PII
  return uuidv4();
}

// ─── DATE VALIDATION ──────────────────────────────────────────────────────────

function isMuseumOpen(dateStr) {
  const date = new Date(dateStr + "T12:00:00");
  const day = date.getDay(); // 0=Sun … 6=Sat
  return MUSEUM_CONFIG.openDays.includes(day);
}

function isDateInPast(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const visit = new Date(dateStr + "T00:00:00");
  return visit < today;
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
      id: uuidv4(),
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

function createBooking({ customer, visitDate, visitTime, items }) {
  // Validate date
  if (isDateInPast(visitDate)) throw new Error("Visit date cannot be in the past.");
  if (!isMuseumOpen(visitDate)) throw new Error("The museum is closed on that day. We are open Monday–Saturday.");
  if (!MUSEUM_CONFIG.timeSlots.includes(visitTime)) throw new Error("Invalid visit time slot.");

  // Validate at least one ticket
  const nonZero = items.filter((i) => parseInt(i.quantity, 10) > 0);
  if (nonZero.length === 0) throw new Error("Please select at least one ticket.");

  // Server-side price calculation
  const { lineItems, subtotal, total } = calculateOrderTotal(items);
  if (lineItems.length === 0) throw new Error("Please select at least one ticket.");

  const bookingReference = generateBookingReference();
  const qrToken = generateQrToken();
  const now = new Date().toISOString();

  const booking = {
    id: uuidv4(),
    bookingReference,
    qrToken,
    // Customer
    firstName: customer.firstName.trim(),
    lastName: customer.lastName.trim(),
    email: customer.email.trim().toLowerCase(),
    phone: customer.phone.trim(),
    notes: (customer.notes || "").trim(),
    // Visit
    visitDate,
    visitTime,
    // Items
    items: lineItems,
    // Pricing
    subtotal,
    total,
    currency: "USD",
    // Status
    paymentStatus: "pending",
    bookingStatus: "pending",
    // Timestamps
    createdAt: now,
    updatedAt: now,
  };

  bookings.set(bookingReference, booking);
  bookingsByToken.set(qrToken, bookingReference);

  return booking;
}

// ─── PAYMENT CONFIRMATION ─────────────────────────────────────────────────────

function confirmBookingPayment(bookingReference, transactionId, paymentProvider) {
  const booking = bookings.get(bookingReference);
  if (!booking) throw new Error("Booking not found.");
  if (booking.paymentStatus === "paid") throw new Error("Booking already paid — duplicate payment prevented.");

  const now = new Date().toISOString();

  // Record payment
  payments.set(bookingReference, {
    id: uuidv4(),
    bookingId: booking.id,
    bookingReference,
    provider: paymentProvider || "mock",
    transactionId,
    amount: booking.total,
    currency: "USD",
    status: "paid",
    createdAt: now,
  });

  // Update booking status
  booking.paymentStatus = "paid";
  booking.bookingStatus = "confirmed";
  booking.updatedAt = now;
  bookings.set(bookingReference, booking);

  return booking;
}

function failBookingPayment(bookingReference, reason) {
  const booking = bookings.get(bookingReference);
  if (!booking) return;
  booking.paymentStatus = "failed";
  booking.updatedAt = new Date().toISOString();
  bookings.set(bookingReference, booking);
}

// ─── LOOKUP ───────────────────────────────────────────────────────────────────

function getBookingByReference(ref) {
  return bookings.get(ref) || null;
}

function getBookingByToken(token) {
  const ref = bookingsByToken.get(token);
  if (!ref) return null;
  return bookings.get(ref) || null;
}

// ─── CHECK-IN / TICKET VALIDATION ────────────────────────────────────────────

function validateAndCheckin(token) {
  const booking = getBookingByToken(token);

  if (!booking) return { valid: false, code: "INVALID_TICKET", message: "INVALID TICKET" };
  if (booking.paymentStatus !== "paid") return { valid: false, code: "PAYMENT_PENDING", message: "PAYMENT NOT CONFIRMED" };
  if (booking.bookingStatus === "used") return { valid: false, code: "ALREADY_USED", message: "ALREADY USED" };
  if (booking.bookingStatus === "cancelled") return { valid: false, code: "CANCELLED", message: "BOOKING CANCELLED" };

  // Check visit date
  const today = new Date().toISOString().split("T")[0];
  if (booking.visitDate !== today) {
    return {
      valid: false,
      code: "WRONG_DATE",
      message: `TICKET NOT VALID FOR TODAY — Valid for ${booking.visitDate}`,
    };
  }

  // Mark as used
  booking.bookingStatus = "used";
  booking.updatedAt = new Date().toISOString();
  bookings.set(booking.bookingReference, booking);

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
