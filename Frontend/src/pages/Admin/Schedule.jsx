import React, { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { MUSEUM, TODAY, addDays, dayOfWeek, STATUS_LABEL } from "./adminData";
import { fmtDate, fmtTime, visitors } from "./utils";

export default function Schedule() {
  const { bookings } = useOutletContext();
  const [date, setDate] = useState(TODAY);
  const closed = !MUSEUM.openDays.includes(dayOfWeek(date));

  const slots = useMemo(() => MUSEUM.timeSlots.map((t) => {
    const list = bookings.filter((b) => b.visitDate === date && b.visitTime === t && b.status !== "cancelled");
    const guests = list.reduce((s, b) => s + visitors(b), 0);
    return { t, list, guests, pct: Math.min(100, Math.round((guests / MUSEUM.capacityPerSlot) * 100)) };
  }), [bookings, date]);

  const total = slots.reduce((s, x) => s + x.guests, 0);

  return (
    <div className="ad-stack">
      <div className="ad-card ad-daybar">
        <button className="ad-btn ad-btn--ghost" onClick={() => setDate(addDays(date, -1))}>Previous day</button>
        <div className="ad-daybar-mid">
          <strong>{fmtDate(date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</strong>
          <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label="Pick a date" />
        </div>
        <button className="ad-btn ad-btn--ghost" onClick={() => setDate(addDays(date, 1))}>Next day</button>
        <button className="ad-btn ad-btn--gold" onClick={() => setDate(TODAY)} disabled={date === TODAY}>Today</button>
      </div>

      {closed ? (
        <div className="ad-card"><p className="ad-empty">The museum is closed on Sundays. Pick Monday to Saturday.</p></div>
      ) : (
        <>
          <p className="ad-muted">{total} visitors booked. Each slot holds {MUSEUM.capacityPerSlot} visitors. Gift ticket books are not counted.</p>
          <div className="ad-slots">
            {slots.map((s) => (
              <section className="ad-card ad-slot" key={s.t}>
                <div className="ad-card-head">
                  <h2>{fmtTime(s.t)}</h2>
                  <span className="ad-muted">{s.guests} / {MUSEUM.capacityPerSlot}</span>
                </div>
                <div className="ad-meter-track"><i className={s.pct >= 100 ? "is-full" : s.pct >= 70 ? "is-busy" : ""} style={{ width: `${s.pct}%` }} /></div>
                {s.list.length === 0 ? (
                  <p className="ad-empty ad-empty--sm">No bookings in this slot.</p>
                ) : (
                  <ul className="ad-slot-list">
                    {s.list.map((b) => (
                      <li key={b.id}>
                        <span>{b.firstName} {b.lastName}<small>{visitors(b) || "Gift"} {visitors(b) ? "visitors" : "voucher"}</small></span>
                        <span className={`ad-pill ad-st-${b.status}`}>{STATUS_LABEL[b.status]}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}