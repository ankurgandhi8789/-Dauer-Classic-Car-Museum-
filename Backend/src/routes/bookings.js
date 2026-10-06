const express = require("express");
const router = express.Router();
const { validateBookingInput, validatePaymentInput } = require("../middleware/validate");
const {
  createBooking,
  confirmBookingPayment,
  failBookingPayment,
  getBookingByReference,
  getBookingByToken,
  validateAndCheckin,
} = require("../services/bookingService");
const { processPayment } = require("../services/paymentService");
const { sendBookingConfirmation } = require("../services/emailService");

// ─── POST /api/bookings/create ────────────────────────────────────────────────
// Creates a PENDING booking. Does NOT confirm until payment succeeds.
router.post("/create", validateBookingInput, async (req, res) => {
  try {
    const { customer, visitDate, visitTime, items } = req.body;
    const booking = createBooking({ customer, visitDate, visitTime, items });

    // Return only what the frontend needs for the payment step
    res.status(201).json({
      bookingReference: booking.bookingReference,
      total: booking.total,
      subtotal: booking.subtotal,
      items: booking.items,
      visitDate: booking.visitDate,
      visitTime: booking.visitTime,
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.bookingStatus,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── POST /api/bookings/payment ───────────────────────────────────────────────
// Processes payment for a pending booking.
// Booking only becomes CONFIRMED after successful payment.
router.post("/payment", validatePaymentInput, async (req, res) => {
  const { bookingReference, paymentDetails } = req.body;

  const booking = getBookingByReference(bookingReference);
  if (!booking) return res.status(404).json({ error: "Booking not found." });
  if (booking.paymentStatus === "paid") {
    return res.status(409).json({ error: "This booking has already been paid. Duplicate payment prevented." });
  }

  try {
    const result = await processPayment(bookingReference, booking.total, paymentDetails);

    if (!result.success) {
      failBookingPayment(bookingReference, result.error);
      return res.status(402).json({ error: result.error || "Payment failed. Please try again." });
    }

    const confirmed = confirmBookingPayment(bookingReference, result.transactionId, result.provider);

    // Attempt email — does not fail the request if email is not configured
    const emailResult = await sendBookingConfirmation(confirmed).catch(() => ({
      sent: false,
      reason: "Email service error.",
    }));

    res.json({
      success: true,
      bookingReference: confirmed.bookingReference,
      qrToken: confirmed.qrToken,
      paymentStatus: confirmed.paymentStatus,
      bookingStatus: confirmed.bookingStatus,
      total: confirmed.total,
      emailSent: emailResult.sent,
      emailNote: emailResult.sent ? null : emailResult.reason,
    });
  } catch (err) {
    failBookingPayment(bookingReference, err.message);
    res.status(500).json({ error: "Payment processing error. Please try again." });
  }
});

// ─── GET /api/bookings/:reference ─────────────────────────────────────────────
// Retrieve a confirmed booking by reference number (for confirmation page).
router.get("/:reference", (req, res) => {
  const booking = getBookingByReference(req.params.reference);
  if (!booking) return res.status(404).json({ error: "Booking not found." });

  // Never expose qrToken in the general lookup — only return it after payment
  const { qrToken, ...safeBooking } = booking;
  res.json(safeBooking);
});

// ─── GET /api/bookings/verify/:token ──────────────────────────────────────────
// Staff check-in: verify a booking by QR token (read-only, does not mark as used).
router.get("/verify/:token", (req, res) => {
  const booking = getBookingByToken(req.params.token);
  if (!booking) return res.status(404).json({ valid: false, code: "INVALID_TICKET", message: "INVALID TICKET" });

  res.json({
    valid: booking.paymentStatus === "paid" && booking.bookingStatus === "confirmed",
    bookingReference: booking.bookingReference,
    visitDate: booking.visitDate,
    paymentStatus: booking.paymentStatus,
    bookingStatus: booking.bookingStatus,
  });
});

// ─── POST /api/bookings/checkin/:token ────────────────────────────────────────
// Staff check-in: validate and mark ticket as used. Prevents double-scan.
router.post("/checkin/:token", (req, res) => {
  const result = validateAndCheckin(req.params.token);
  const status = result.valid ? 200 : 400;
  res.status(status).json(result);
});

module.exports = router;
