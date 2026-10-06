/**
 * In-memory booking store.
 * Schema mirrors a real database model — swap this module for a DB adapter later.
 *
 * Collections:
 *   bookings      — main booking records
 *   bookingItems  — line items per booking
 *   payments      — payment records per booking
 */

const bookings = new Map();      // key: bookingReference
const bookingsByToken = new Map(); // key: qrToken  → bookingReference
const payments = new Map();      // key: bookingReference

module.exports = { bookings, bookingsByToken, payments };
