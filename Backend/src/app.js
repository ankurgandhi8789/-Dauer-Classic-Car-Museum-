const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const ticketsRouter = require("./routes/tickets");
const bookingsRouter = require("./routes/bookings");
const adminRouter = require("./routes/admin");

const app = express();

// ─── CORS ───
const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:5173"]
  .filter(Boolean)
  .map((u) => u.replace(/\/$/, ""));

const vercelFrontend = /^https:\/\/dauer-classic-car-museum-ijzg[a-z0-9-]*\.vercel\.app$/;

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin) || vercelFrontend.test(origin)) {
        return cb(null, true);
      }
      return cb(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());

// Health check (DB ke bina)
app.get("/", (req, res) => res.json({ message: "Dauer Classic Cars API is running" }));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// ─── Database: har request pe connect (cached hai, to fast rehta hai) ───
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("MongoDB connection FAILED:", err.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.use("/api/tickets", ticketsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/admin", adminRouter);

// DEV ONLY
if (process.env.SEED_DEMO === "true") require("../scripts/seedDemo")();

app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;