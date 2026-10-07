/* Shared constants + date helpers for the admin pages.
   Bookings now come from the backend, so the demo generator is removed. */

export const TOUR_LABELS = {
  self_guided: "Self Guided",
  vip: "VIP Tour",
  gift: "Gift Tickets",
};

export const MUSEUM = {
  openDays: [1, 2, 3, 4, 5, 6],                       // Mon–Sat
  timeSlots: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00"],
  capacityPerSlot: 30,                                // same as defaultCapacityPerSlot in Backend ticketConfig.js
};

export const STATUS_LABEL = {
  confirmed: "Confirmed",
  checked_in: "Checked in",
  no_show: "No-show",
  cancelled: "Cancelled",
};

/* ---------- date helpers (all dates are "YYYY-MM-DD" strings) ---------- */

export const pad = (n) => String(n).padStart(2, "0");

export function toISO(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(iso, n) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function dayOfWeek(iso) {
  return new Date(iso + "T12:00:00").getDay();
}

export const TODAY = toISO(new Date());
