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
// Saves the booking in MongoDB. It shows up in the admin dashboard right away.
// (Payment is not connected yet, so the booking is saved as confirmed / payment pending.)
router.post("/create", validateBookingInput, async (req, res) => {
  try {
    const { customer, visitDate, visitTime, items } = req.body;
    const booking = await createBooking({ customer, visitDate, visitTime, items });

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
    // Validation problems from createBooking() are safe to show. Database errors are not.
    if (err.name === "MongoServerError" || err.name === "MongooseError" || err.name === "ValidationError") {
      console.error(err);
      return res.status(500).json({ error: "We could not save your booking. Please try again." });
    }
    res.status(400).json({ error: err.message });
  }
});

// ─── POST /api/bookings/payment ───────────────────────────────────────────────
// NOT used by the website yet. Kept for when payment is connected.
router.post("/payment", validatePaymentInput, async (req, res) => {
  const { bookingReference, paymentDetails } = req.body;

  try {
    const booking = await getBookingByReference(bookingReference);
    if (!booking) return res.status(404).json({ error: "Booking not found." });
    if (booking.paymentStatus === "paid") {
      return res.status(409).json({ error: "This booking has already been paid. Duplicate payment prevented." });
    }

    const result = await processPayment(bookingReference, booking.total, paymentDetails);

    if (!result.success) {
      await failBookingPayment(bookingReference);
      return res.status(402).json({ error: result.error || "Payment failed. Please try again." });
    }

    const confirmed = await confirmBookingPayment(bookingReference, result.transactionId, result.provider);

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
    console.error(err);
    await failBookingPayment(bookingReference).catch(() => {});
    res.status(500).json({ error: "Payment processing error. Please try again." });
  }
});

// ─── GET /api/bookings/:reference ─────────────────────────────────────────────
router.get("/:reference", async (req, res, next) => {
  try {
    const booking = await getBookingByReference(req.params.reference);
    if (!booking) return res.status(404).json({ error: "Booking not found." });

    // Never expose qrToken or internal fields in the general lookup.
    const { qrToken, _id, __v, isDemo, ...safeBooking } = booking;
    res.json(safeBooking);
  } catch (err) { next(err); }
});

// ─── GET /api/bookings/verify/:token ──────────────────────────────────────────
router.get("/verify/:token", async (req, res, next) => {
  try {
    const booking = await getBookingByToken(req.params.token);
    if (!booking) return res.status(404).json({ valid: false, code: "INVALID_TICKET", message: "INVALID TICKET" });

    res.json({
      valid: booking.paymentStatus === "paid" && booking.bookingStatus === "confirmed",
      bookingReference: booking.bookingReference,
      visitDate: booking.visitDate,
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.bookingStatus,
    });
  } catch (err) { next(err); }
});

// ─── POST /api/bookings/checkin/:token ────────────────────────────────────────
router.post("/checkin/:token", async (req, res, next) => {
  try {
    const result = await validateAndCheckin(req.params.token);
    res.status(result.valid ? 200 : 400).json(result);
  } catch (err) { next(err); }
});

module.exports = router;
