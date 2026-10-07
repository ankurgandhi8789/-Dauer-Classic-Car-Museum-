const express = require("express");
const router = express.Router();
const {
  checkCredentials, signAdminToken, requireAdmin,
  loginLimiter, recordFail, clearFails, TOKEN_TTL_SECONDS,
} = require("../middleware/adminAuth");
const { listAdminBookings, updateAdminBookingStatus } = require("../services/adminService");

// POST /api/admin/login   { email, password }
router.post("/login", loginLimiter, (req, res) => {
  if (!process.env.JWT_SECRET) return res.status(503).json({ error: "Admin login is not configured." });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Enter your email and password." });

  if (!checkCredentials(email, password)) {
    recordFail(req.ip);
    return res.status(401).json({ error: "Email or password is incorrect." });
  }
  clearFails(req.ip);

  const adminEmail = String(email).trim().toLowerCase();
  res.json({
    token: signAdminToken(adminEmail),
    name: "Museum Admin",
    email: adminEmail,
    expiresIn: TOKEN_TTL_SECONDS,
  });
});

// Everything below needs a valid admin token.
router.use(requireAdmin);

// GET /api/admin/bookings
router.get("/bookings", async (req, res, next) => {
  try {
    res.json({ bookings: await listAdminBookings() });
  } catch (err) { next(err); }
});

// PATCH /api/admin/bookings/:id/status   { status: confirmed | checked_in | no_show | cancelled }
router.patch("/bookings/:id/status", async (req, res, next) => {
  try {
    const result = await updateAdminBookingStatus(req.params.id, req.body && req.body.status);
    if (result.error) return res.status(result.code).json({ error: result.error });
    res.json({ booking: result.booking });
  } catch (err) { next(err); }
});

module.exports = router;
