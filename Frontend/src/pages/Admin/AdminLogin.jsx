import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { login, getSession } from "./auth";
import "./Admin.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (getSession()) return <Navigate to="/admin" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) { setError("Enter your email and password."); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Could not sign in. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ad-login">
      <aside className="ad-login-art">
        <img src="/images/car-01.png" alt="" />
        <div className="ad-login-art-shade" />
        <div className="ad-login-art-text">
          <h1>Dauer Classic Cars</h1>
          <p>Ticket desk for the Classic Car Museum of South Florida.</p>
        </div>
      </aside>

      <main className="ad-login-panel">
        <form className="ad-login-form" onSubmit={onSubmit} noValidate>
          <h2>Sign in</h2>
          <p className="ad-login-lead">Use your staff account to manage bookings and visit slots.</p>

          {error && <div className="ad-alert" role="alert">{error}</div>}

          <label className="ad-field">
            <span>Email</span>
            <input type="email" autoComplete="username" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="you@dauerclassiccars.com" autoFocus />
          </label>

          <label className="ad-field">
            <span>Password</span>
            <div className="ad-pass">
              <input type={show ? "text" : "password"} autoComplete="current-password" value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
              <button type="button" className="ad-pass-toggle" onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}>
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <button className="ad-btn ad-btn--gold ad-btn--block" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </main>
    </div>
  );
}
