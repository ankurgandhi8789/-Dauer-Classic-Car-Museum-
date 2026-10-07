const Booking = require("../models/Booking");

// Backend bookingStatus  <->  status names used by the admin dashboard
const TO_ADMIN = { confirmed: "confirmed", used: "checked_in", no_show: "no_show", cancelled: "cancelled" };
const TO_STORE = { confirmed: "confirmed", checked_in: "used", no_show: "no_show", cancelled: "cancelled" };

// Convert a stored booking into the exact shape the admin pages expect.
// The booking reference is used as the id (it is unique and URL-safe).
function toAdminBooking(b) {
  return {
    id: b.bookingReference,
    bookingReference: b.bookingReference,
    firstName: b.firstName,
    lastName: b.lastName,
    email: b.email,
    phone: b.phone,
    notes: b.notes || "",
    visitDate: b.visitDate,
    visitTime: b.visitTime,
    items: b.items.map((i) => ({
      id: i.ticketTypeId,
      name: i.ticketName,
      price: i.unitPrice,
      qty: i.quantity,
      requiresId: i.requiresId,
    })),
    total: b.total,
    tour: b.items[0] ? b.items[0].tourType : "self_guided",
    status: TO_ADMIN[b.bookingStatus] || b.bookingStatus,
    createdAt: new Date(b.createdAt).toISOString(),
  };
}

// Every booking made on the website shows up here (payment is not connected yet).
// Only unfinished "pending" checkouts are hidden.
async function listAdminBookings() {
  const docs = await Booking.find({ bookingStatus: { $ne: "pending" } })
    .sort({ visitDate: -1, visitTime: -1 })
    .limit(2000)
    .lean();
  return docs.map(toAdminBooking);
}

async function updateAdminBookingStatus(id, status) {
  if (typeof status !== "string" || !TO_STORE[status]) return { error: "Invalid status.", code: 400 };

  const doc = await Booking.findOneAndUpdate(
    { bookingReference: String(id) },
    { $set: { bookingStatus: TO_STORE[status] } },
    { new: true }
  ).lean();
  if (!doc) return { error: "Booking not found.", code: 404 };

  return { booking: toAdminBooking(doc) };
}

module.exports = { listAdminBookings, updateAdminBookingStatus };
