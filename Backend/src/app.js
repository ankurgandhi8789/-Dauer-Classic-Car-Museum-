const express = require("express");
const cors = require("cors");

const ticketsRouter = require("./routes/tickets");
const bookingsRouter = require("./routes/bookings");
const adminRouter = require("./routes/admin");               // NEW

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

app.use("/api/tickets", ticketsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/admin", adminRouter);                          // NEW

// DEV ONLY: demo bookings for the admin dashboard. Remove before going live.
if (process.env.SEED_DEMO === "true") require("./config/seedDemo")();   // NEW

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// 404
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
