import React, { useState, useEffect, useCallback } from "react";
import { NavLink, Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import { getSession, logout } from "./auth";
import { request } from "./api";
import "./Admin.css";

const NAV = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/schedule", label: "Daily schedule" },
];

export default function AdminLayout() {
  const session = getSession();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // silent = background refresh (no "Loading…" flash)
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await request("/admin/bookings");
      setBookings(data.bookings);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Load once, then check for new website bookings every 30 seconds.
  useEffect(() => {
    if (!session) return;
    load();
    const timer = setInterval(() => load(true), 30000);
    return () => clearInterval(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!session) return <Navigate to="/admin/login" replace />;

  // Update on screen right away, then confirm with the server. Roll back if it fails.
  async function updateStatus(id, status) {
    const previous = bookings;
    setBookings((list) => list.map((b) => (b.id === id ? { ...b, status } : b)));
    try {
      const data = await request(`/admin/bookings/${id}/status`, { method: "PATCH", body: { status } });
      setBookings((list) => list.map((b) => (b.id === id ? data.booking : b)));
    } catch (err) {
      setBookings(previous);
      setError(err.message);
    }
  }

  function signOut() {
    logout();
    navigate("/admin/login", { replace: true });
  }

  const current = NAV.find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)));

  return (
    <div className="ad-shell">
      <aside className={`ad-side${open ? " ad-side--open" : ""}`}>
        <div className="ad-brand">
          <span className="ad-brand-name">Dauer</span>
          <span className="ad-brand-sub">Ticket desk</span>
        </div>
        <nav className="ad-nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setOpen(false)}
              className={({ isActive }) => `ad-nav-link${isActive ? " is-active" : ""}`}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="ad-side-foot">
          <div className="ad-user">
            <span className="ad-avatar">{session.name?.[0] || "A"}</span>
            <span><strong>{session.name}</strong><small>{session.email}</small></span>
          </div>
          <button className="ad-btn ad-btn--ghost ad-btn--block" onClick={signOut}>Sign out</button>
        </div>
      </aside>
      {open && <div className="ad-scrim" onClick={() => setOpen(false)} />}

      <div className="ad-main">
        <header className="ad-top">
          <button className="ad-menu" onClick={() => setOpen(true)} aria-label="Open menu">☰</button>
          <h1>{current?.label || "Admin"}</h1>
          <button className="ad-btn ad-btn--ghost" onClick={() => load()} disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </button>
          <a className="ad-top-link" href="/" target="_blank" rel="noreferrer">View website</a>
        </header>
        <div className="ad-content">
          {error && (
            <div className="ad-alert" role="alert" style={{ marginBottom: 16 }}>
              {error}{" "}
              <button className="ad-link" style={{ background: "none", border: 0, cursor: "pointer" }} onClick={() => load()}>Try again</button>
            </div>
          )}
          {loading && bookings.length === 0 ? (
            <p className="ad-empty">Loading bookings…</p>
          ) : (
            <Outlet context={{ bookings, updateStatus, reload: () => load() }} />
          )}
        </div>
      </div>
    </div>
  );
}
