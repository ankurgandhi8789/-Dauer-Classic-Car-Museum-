import React, { useMemo } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { TODAY, addDays, STATUS_LABEL, TOUR_LABELS } from "./adminData";
import { money, fmtDate, fmtTime, visitors, revenueOf, ticketCount } from "./utils";

export default function Overview() {
  const { bookings } = useOutletContext();

  const d = useMemo(() => {
    const month = TODAY.slice(0, 7);
    const live = bookings.filter((b) => b.status !== "cancelled");

    const today = live.filter((b) => b.visitDate === TODAY)
      .sort((a, b) => a.visitTime.localeCompare(b.visitTime));
    const monthRevenue = bookings.filter((b) => b.visitDate.startsWith(month)).reduce((s, b) => s + revenueOf(b), 0);
    const upcoming = bookings.filter((b) => b.visitDate > TODAY && b.status === "confirmed");
    const past = bookings.filter((b) => b.visitDate < TODAY && b.status !== "cancelled");
    const attendRate = past.length ? Math.round((past.filter((b) => b.status === "checked_in").length / past.length) * 100) : 0;

    const days = Array.from({ length: 14 }, (_, i) => {
      const date = addDays(TODAY, i - 13);
      return { date, rev: bookings.filter((b) => b.visitDate === date).reduce((s, b) => s + revenueOf(b), 0) };
    });

    const tours = {};
    live.forEach((b) => { tours[b.tour] = (tours[b.tour] || 0) + b.total; });

    const status = {};
    bookings.forEach((b) => { status[b.status] = (status[b.status] || 0) + 1; });

    return { today, monthRevenue, upcoming, attendRate, days, tours, status };
  }, [bookings]);

  const todayGuests = d.today.reduce((s, b) => s + visitors(b), 0);
  const maxRev = Math.max(...d.days.map((x) => x.rev), 1);
  const tourTotal = Object.values(d.tours).reduce((a, b) => a + b, 0) || 1;
  const statusTotal = Object.values(d.status).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="ad-stack">
      <section className="ad-kpis">
        <Kpi label="Visitors expected today" value={todayGuests} note={`${d.today.length} bookings`} />
        <Kpi label="Revenue this month" value={money(d.monthRevenue)} note="Cancelled bookings excluded" />
        <Kpi label="Upcoming bookings" value={d.upcoming.length} note="Confirmed, after today" />
        <Kpi label="Show-up rate" value={`${d.attendRate}%`} note="Past visits that checked in" />
      </section>

      <section className="ad-grid-2">
        <div className="ad-card">
          <div className="ad-card-head">
            <h2>Revenue, last 14 days</h2>
            <span className="ad-muted">{money(d.days.reduce((s, x) => s + x.rev, 0))} total</span>
          </div>
          <svg className="ad-chart" viewBox="0 0 560 190" role="img" aria-label="Revenue per day for the last 14 days">
            {[0, 0.5, 1].map((g) => (
              <line key={g} x1="0" x2="560" y1={150 - g * 130} y2={150 - g * 130} className="ad-chart-grid" />
            ))}
            {d.days.map((x, i) => {
              const h = (x.rev / maxRev) * 130;
              const isToday = x.date === TODAY;
              return (
                <g key={x.date}>
                  <rect x={i * 40 + 8} y={150 - h} width="24" height={h} rx="2"
                    className={isToday ? "ad-bar ad-bar--today" : "ad-bar"}>
                    <title>{fmtDate(x.date)}: {money(x.rev)}</title>
                  </rect>
                  {i % 2 === 0 && (
                    <text x={i * 40 + 20} y="172" textAnchor="middle" className="ad-chart-label">
                      {fmtDate(x.date, { month: "numeric", day: "numeric" })}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="ad-card">
          <div className="ad-card-head"><h2>Where revenue comes from</h2></div>
          {Object.entries(d.tours).map(([k, v]) => (
            <div className="ad-meter" key={k}>
              <div><span>{TOUR_LABELS[k]}</span><strong>{money(v)}</strong></div>
              <div className="ad-meter-track"><i style={{ width: `${(v / tourTotal) * 100}%` }} /></div>
            </div>
          ))}
          <div className="ad-card-head ad-gap-top"><h2>Booking status</h2></div>
          <div className="ad-status-bar">
            {Object.entries(d.status).map(([k, v]) => (
              <i key={k} className={`ad-st-${k}`} style={{ width: `${(v / statusTotal) * 100}%` }} title={`${STATUS_LABEL[k]}: ${v}`} />
            ))}
          </div>
          <ul className="ad-legend">
            {Object.entries(d.status).map(([k, v]) => (
              <li key={k}><i className={`ad-dot ad-st-${k}`} />{STATUS_LABEL[k]} <strong>{v}</strong></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ad-card">
        <div className="ad-card-head">
          <h2>Today's arrivals</h2>
          <Link to="/admin/schedule" className="ad-link">Open daily schedule</Link>
        </div>
        {d.today.length === 0 ? (
          <p className="ad-empty">No bookings for today. {new Date(TODAY + "T12:00:00").getDay() === 0 && "The museum is closed on Sundays."}</p>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead><tr><th>Time</th><th>Guest</th><th>Tickets</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {d.today.map((b) => (
                  <tr key={b.id}>
                    <td>{fmtTime(b.visitTime)}</td>
                    <td>{b.firstName} {b.lastName}<small>{b.bookingReference}</small></td>
                    <td>{ticketCount(b)}</td>
                    <td>{money(b.total)}</td>
                    <td><span className={`ad-pill ad-st-${b.status}`}>{STATUS_LABEL[b.status]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Kpi({ label, value, note }) {
  return (
    <div className="ad-kpi">
      <span className="ad-kpi-label">{label}</span>
      <strong className="ad-kpi-value">{value}</strong>
      <span className="ad-muted">{note}</span>
    </div>
  );
}