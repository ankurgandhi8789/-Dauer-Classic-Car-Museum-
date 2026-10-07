import React, { useMemo, useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { STATUS_LABEL, TOUR_LABELS } from "./adminData";
import { money, fmtDate, fmtTime, ticketCount, downloadCSV } from "./utils";

const PAGE = 12;

export default function Bookings() {
  const { bookings, updateStatus } = useOutletContext();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [tour, setTour] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState({ key: "visitDate", dir: "desc" });
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);

  useEffect(() => { setPage(1); }, [q, status, tour, from, to]);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = bookings.filter((b) => {
      if (status !== "all" && b.status !== status) return false;
      if (tour !== "all" && b.tour !== tour) return false;
      if (from && b.visitDate < from) return false;
      if (to && b.visitDate > to) return false;
      if (s && !`${b.firstName} ${b.lastName} ${b.email} ${b.phone} ${b.bookingReference}`.toLowerCase().includes(s)) return false;
      return true;
    });
    const m = sort.dir === "asc" ? 1 : -1;
    return list.sort((a, b) => {
      if (sort.key === "total") return (a.total - b.total) * m;
      const ka = a.visitDate + a.visitTime, kb = b.visitDate + b.visitTime;
      return ka < kb ? -m : ka > kb ? m : 0;
    });
  }, [bookings, q, status, tour, from, to, sort]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const view = rows.slice((page - 1) * PAGE, page * PAGE);
  const selected = bookings.find((b) => b.id === openId);

  function toggleSort(key) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));
  }
  const arrow = (key) => (sort.key === key ? (sort.dir === "asc" ? " ▲" : " ▼") : "");

  function exportCSV() {
    downloadCSV([
      ["Reference", "First name", "Last name", "Email", "Phone", "Visit date", "Time", "Tickets", "Total", "Status", "Booked on"],
      ...rows.map((b) => [b.bookingReference, b.firstName, b.lastName, b.email, b.phone, b.visitDate, b.visitTime,
        b.items.map((i) => `${i.name} x${i.qty}`).join("; "), b.total, STATUS_LABEL[b.status], b.createdAt.slice(0, 10)]),
    ], "bookings.csv");
  }

  function reset() { setQ(""); setStatus("all"); setTour("all"); setFrom(""); setTo(""); }

  return (
    <div className="ad-stack">
      <div className="ad-card">
        <div className="ad-filters">
          <label className="ad-field ad-field--grow"><span>Search</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, email, phone or reference" /></label>
          <label className="ad-field"><span>Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All statuses</option>
              {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select></label>
          <label className="ad-field"><span>Tour</span>
            <select value={tour} onChange={(e) => setTour(e.target.value)}>
              <option value="all">All tours</option>
              {Object.entries(TOUR_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select></label>
          <label className="ad-field"><span>Visit from</span><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
          <label className="ad-field"><span>Visit to</span><input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
        </div>
        <div className="ad-toolbar">
          <span className="ad-muted">{rows.length} {rows.length === 1 ? "booking" : "bookings"} found</span>
          <span>
            <button className="ad-btn ad-btn--ghost" onClick={reset}>Clear filters</button>{" "}
            <button className="ad-btn ad-btn--gold" onClick={exportCSV} disabled={!rows.length}>Export CSV</button>
          </span>
        </div>

        {rows.length === 0 ? (
          <p className="ad-empty">No bookings match these filters. Clear a filter or widen the date range.</p>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table ad-table--click">
              <thead><tr>
                <th>Guest</th>
                <th><button className="ad-th-btn" onClick={() => toggleSort("visitDate")}>Visit{arrow("visitDate")}</button></th>
                <th>Tour</th><th>Tickets</th>
                <th><button className="ad-th-btn" onClick={() => toggleSort("total")}>Total{arrow("total")}</button></th>
                <th>Status</th>
              </tr></thead>
              <tbody>
                {view.map((b) => (
                  <tr key={b.id} tabIndex={0} onClick={() => setOpenId(b.id)}
                    onKeyDown={(e) => e.key === "Enter" && setOpenId(b.id)}>
                    <td>{b.firstName} {b.lastName}<small>{b.bookingReference}</small></td>
                    <td>{fmtDate(b.visitDate, { month: "short", day: "numeric", year: "numeric" })}<small>{fmtTime(b.visitTime)}</small></td>
                    <td>{TOUR_LABELS[b.tour]}</td>
                    <td>{ticketCount(b)}</td>
                    <td>{money(b.total)}</td>
                    <td><span className={`ad-pill ad-st-${b.status}`}>{STATUS_LABEL[b.status]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {rows.length > PAGE && (
          <div className="ad-pager">
            <button className="ad-btn ad-btn--ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span>Page {page} of {pages}</span>
            <button className="ad-btn ad-btn--ghost" disabled={page === pages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        )}
      </div>

      {selected && <Drawer b={selected} onClose={() => setOpenId(null)} onStatus={updateStatus} />}
    </div>
  );
}

function Drawer({ b, onClose, onStatus }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const actions = Object.keys(STATUS_LABEL).filter((s) => s !== b.status);
  const verb = { confirmed: "Mark as confirmed", checked_in: "Check in", no_show: "Mark no-show", cancelled: "Cancel booking" };
  const needsId = b.items.some((i) => i.requiresId);

  function change(s) {
    if (s === "cancelled" && !window.confirm("Cancel this booking?")) return;
    onStatus(b.id, s);
  }

  return (
    <>
      <div className="ad-scrim ad-scrim--on" onClick={onClose} />
      <aside className="ad-drawer" role="dialog" aria-label="Booking details">
        <div className="ad-drawer-head">
          <div>
            <h2>{b.firstName} {b.lastName}</h2>
            <span className="ad-muted">{b.bookingReference}</span>
          </div>
          <button className="ad-btn ad-btn--ghost" onClick={onClose}>Close</button>
        </div>

        <span className={`ad-pill ad-st-${b.status}`}>{STATUS_LABEL[b.status]}</span>
        {needsId && <div className="ad-alert ad-alert--warn">Military or first responder tickets. Check government ID at entry.</div>}

        <dl className="ad-dl">
          <dt>Visit</dt><dd>{fmtDate(b.visitDate, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}, {fmtTime(b.visitTime)}</dd>
          <dt>Email</dt><dd>{b.email}</dd>
          <dt>Phone</dt><dd>{b.phone}</dd>
          <dt>Booked on</dt><dd>{fmtDate(b.createdAt.slice(0, 10), { month: "long", day: "numeric", year: "numeric" })}</dd>
          {b.notes && (<><dt>Guest note</dt><dd>{b.notes}</dd></>)}
        </dl>

        <h3>Tickets</h3>
        <ul className="ad-lines">
          {b.items.map((i) => (
            <li key={i.id}><span>{i.name} × {i.qty}</span><strong>{i.price === 0 ? "Free" : money(i.price * i.qty)}</strong></li>
          ))}
          <li className="ad-lines-total"><span>Total</span><strong>{money(b.total)}</strong></li>
        </ul>

        <h3>Update status</h3>
        <div className="ad-actions">
          {actions.map((s) => (
            <button key={s} className={`ad-btn ${s === "cancelled" ? "ad-btn--danger" : s === "checked_in" ? "ad-btn--gold" : "ad-btn--ghost"}`}
              onClick={() => change(s)}>{verb[s]}</button>
          ))}
        </div>
      </aside>
    </>
  );
}
