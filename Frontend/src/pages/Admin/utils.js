export const money = (n) =>
  "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export function fmtDate(iso, opts = { weekday: "short", month: "short", day: "numeric" }) {
  if (!iso) return "";
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", opts);
}

export function fmtTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

// People walking in the door. Gift books are vouchers, so they don't use slot capacity.
export const visitors = (b) => b.items.reduce((s, i) => (i.id === "gift" ? s : s + i.qty), 0);
export const ticketCount = (b) => b.items.reduce((s, i) => s + i.qty, 0);
export const revenueOf = (b) => (b.status === "cancelled" ? 0 : b.total);

export function downloadCSV(rows, filename) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}