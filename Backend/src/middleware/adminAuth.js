const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const TOKEN_TTL_SECONDS = 8 * 60 * 60; // 8 hours

const secret = () => process.env.JWT_SECRET || null;

// Hash both sides first so the comparison is constant-time and length-safe.
function safeEqual(a, b) {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function checkCredentials(email, password) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return false;
  const emailOk = safeEqual(String(email).trim().toLowerCase(), adminEmail.trim().toLowerCase());
  const passOk = safeEqual(password, adminPassword);
  return emailOk && passOk;
}

function signAdminToken(email) {
  return jwt.sign({ role: "admin", email }, secret(), { expiresIn: TOKEN_TTL_SECONDS });
}

function requireAdmin(req, res, next) {
  if (!secret()) return res.status(503).json({ error: "Admin access is not configured." });
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Please sign in." });
  try {
    const payload = jwt.verify(token, secret());
    if (payload.role !== "admin") throw new Error("not admin");
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ error: "Your session has expired. Please sign in again." });
  }
}

// Simple in-memory brute-force guard: 10 failed logins per IP per 15 minutes.
const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 10;

function loginLimiter(req, res, next) {
  const now = Date.now();
  const rec = attempts.get(req.ip);
  if (rec && rec.resetAt > now && rec.count >= MAX_FAILS) {
    return res.status(429).json({ error: "Too many login attempts. Try again in a few minutes." });
  }
  next();
}
function recordFail(ip) {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || rec.resetAt <= now) attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  else rec.count += 1;
}
const clearFails = (ip) => attempts.delete(ip);

if (!secret()) console.warn("[admin] JWT_SECRET is not set. Admin login is disabled until you add it to .env");

module.exports = { checkCredentials, signAdminToken, requireAdmin, loginLimiter, recordFail, clearFails, TOKEN_TTL_SECONDS };
