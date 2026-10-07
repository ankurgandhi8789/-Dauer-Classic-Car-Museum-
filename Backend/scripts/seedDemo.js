/**
 * DEV / DEMO ONLY.
 *   npm run seed         -> adds ~140 demo bookings (marked isDemo) to MongoDB
 *   npm run seed:clear   -> removes only the demo bookings, real ones are never touched
 * Running "seed" twice is safe: old demo bookings are replaced.
 */
require("dotenv").config();
const crypto = require("crypto");
const mongoose = require("mongoose");
const Booking = require("../src/models/Booking");
const { TICKET_TYPES, MUSEUM_CONFIG } = require("../src/config/ticketConfig");

const FIRST = ["Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason", "Priya", "Carlos", "Mei", "Omar", "Grace", "Victor"];
const LAST = ["Smith", "Johnson", "Garcia", "Miller", "Davis", "Lopez", "Wilson", "Taylor", "Patel", "Nguyen", "Kim", "Rossi", "Silva", "Reyes"];
const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function buildDemo() {
  let s = 11;
  const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  const int = (a, b) => a + Math.floor(rand() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const line = (id, qty) => {
    const t = TICKET_TYPES.find((x) => x.id === id);
    return { ticketTypeId: t.id, ticketName: t.name, tourType: t.tourType, quantity: qty, unitPrice: t.price, subtotal: t.price * qty, requiresId: t.requiresId };
  };

  const today = iso(new Date());
  const nowHour = new Date().getHours();
  const docs = [];
  const used = new Set();

  for (let off = -30; off <= 14; off++) {
    const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + off);
    if (!MUSEUM_CONFIG.openDays.includes(d.getDay())) continue;
    const visitDate = iso(d);

    for (let i = 0, n = int(2, 6); i < n; i++) {
      const r = rand();
      const items = r < 0.8
        ? [line("self_adult", int(1, 4)), ...(rand() < 0.4 ? [line("self_child", int(1, 3))] : [])]
        : r < 0.94 ? [line("vip", int(2, 5))] : [line("gift", 1)];
      const total = items.reduce((sum, it) => sum + it.subtotal, 0);
      const visitTime = pick(MUSEUM_CONFIG.timeSlots);

      const x = rand();
      let status;
      if (visitDate < today) status = x < 0.85 ? "used" : x < 0.93 ? "no_show" : "cancelled";
      else if (visitDate === today && parseInt(visitTime, 10) <= nowHour) status = x < 0.8 ? "used" : "no_show";
      else status = x < 0.94 ? "confirmed" : "cancelled";

      const first = pick(FIRST), last = pick(LAST);
      let ref;
      do { ref = `DCA-${visitDate.slice(0, 4)}-${Math.floor(rand() * 36 ** 6).toString(36).toUpperCase().padStart(6, "0")}`; } while (used.has(ref));
      used.add(ref);

      const created = new Date(d.getTime() - int(0, 8) * 86400000 - int(1, 600) * 60000);
      docs.push({
        bookingReference: ref, qrToken: crypto.randomUUID(),
        firstName: first, lastName: last,
        email: `${first}.${last}${int(1, 99)}@example.com`.toLowerCase(),
        phone: `(954) 555-0${int(100, 199)}`,
        notes: rand() < 0.15 ? "Celebrating a birthday visit." : "",
        visitDate, visitTime, items, subtotal: total, total, currency: "USD",
        paymentStatus: "pending", bookingStatus: status, isDemo: true,
        createdAt: created > new Date() ? new Date() : created,
      });
    }
  }
  return docs;
}

(async () => {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set in Backend/.env");
  await mongoose.connect(process.env.MONGODB_URI);
  const removed = await Booking.deleteMany({ isDemo: true });
  if (process.argv.includes("--clear")) {
    console.log(`Removed ${removed.deletedCount} demo bookings.`);
  } else {
    const docs = buildDemo();
    await Booking.insertMany(docs);
    console.log(`Added ${docs.length} demo bookings.`);
  }
  await mongoose.disconnect();
})().catch((err) => { console.error(err.message); process.exit(1); });
