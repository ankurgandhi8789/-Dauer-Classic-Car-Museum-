import React, { useState, useRef } from "react";
import "./Tickets.css";

// image: apni ticket image ka path yaha daalo (jaise "/images/ticket-adult.png").
// Khali ("") rahegi to automatic ticket-style placeholder dikhega.
const TICKET_TYPES = [
  { id: "self_adult",     tourType: "self_guided", name: "Adult",                    description: "Self-guided tour. Full access to all exhibits and displays.", price: 20,  ageLabel: "Ages 15+",         isFree: false, requiresId: false, minimumQuantity: 0, image: "" },
  { id: "self_child",     tourType: "self_guided", name: "Child",                    description: "Self-guided tour. Children ages 4–14. Under 4 are free.",      price: 10,  ageLabel: "Ages 4–14",        isFree: false, requiresId: false, minimumQuantity: 0, image: "" },
  { id: "self_military",  tourType: "self_guided", name: "Active Duty Military",     description: "Free admission. Valid military ID required at entry.",          price: 0,   ageLabel: "Valid ID required", isFree: true,  requiresId: true,  minimumQuantity: 0, image: "" },
  { id: "self_responder", tourType: "self_guided", name: "First Responder",          description: "Free admission. Valid ID required at entry.",                   price: 0,   ageLabel: "Valid ID required", isFree: true,  requiresId: true,  minimumQuantity: 0, image: "" },
  { id: "vip",            tourType: "vip",         name: "VIP Tour",                 description: "Guided tour of the full collection with exclusive access. Minimum 2 tickets.", price: 35, ageLabel: "All ages", isFree: false, requiresId: false, minimumQuantity: 2, image: "" },
  { id: "gift",           tourType: "gift",        name: "Gift Tickets (Book of 10)", description: "Book of 10 gift tickets — a $200 value. Perfect for gifting.", price: 180, ageLabel: "$200 value",       isFree: false, requiresId: false, minimumQuantity: 1, image: "" },
];

const MUSEUM = {
  openDays: [1, 2, 3, 4, 5, 6],
  timeSlots: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00"],
};

const TOUR_GROUPS = [
  { key: "self_guided", label: "Self Guided Tour",  desc: "Explore at your own pace. Full access to all 55+ classic automobiles.", image: "/images/car-02.jpg" },
  { key: "vip",         label: "VIP Tour",           desc: "Detailed guided tour of the entire collection with exclusive access.",   image: "/images/car-03.jpg" },
  { key: "gift",        label: "Gift Tickets",        desc: "Book of 10 gift tickets — a $200 value. Perfect for gifting.",          image: "/images/carGalley-01.png" },
];

const STEPS = ["SELECT TICKETS", "VISIT DATE", "YOUR DETAILS", "REVIEW", "CONFIRMATION"];

const today = new Date().toISOString().split("T")[0];

function isClosed(dateStr) {
  if (!dateStr) return false;
  return !MUSEUM.openDays.includes(new Date(dateStr + "T12:00:00").getDay());
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function genRef() {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DCA-${year}-${rand}`;
}

// ─── STEP BAR ─────────────────────────────────────────────────────────────────
function StepBar({ step }) {
  return (
    <div className="tk-steps">
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <div className={`tk-step${step >= i + 1 ? " tk-step--active" : ""}${step > i + 1 ? " tk-step--done" : ""}`}>
            <span className="tk-step-num">{step > i + 1 ? "✓" : `0${i + 1}`}</span>
            <span className="tk-step-label">{label}</span>
          </div>
          {i < STEPS.length - 1 && <div className="tk-step-line" />}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── ORDER SUMMARY SIDEBAR (now with Back / Next buttons) ─────────────────────
function OrderSummary({ quantities, visitDate, visitTime, step, onBack, onNext, nextLabel, nextDisabled }) {
  const selected = TICKET_TYPES.filter((t) => (quantities[t.id] || 0) > 0);
  const total = TICKET_TYPES.reduce((s, t) => s + t.price * (quantities[t.id] || 0), 0);
  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);

  return (
    <aside className="tk-sidebar">
      <div className="tk-summary">
        <div className="tk-summary-img-wrap">
          <img src="/images/car-05.jpg" alt="Classic car" className="tk-summary-img" />
          <div className="tk-summary-img-overlay" />
          <span className="tk-summary-img-text">DAUER CLASSIC CARS</span>
        </div>
        <div className="tk-summary-body">
          <h3>ORDER SUMMARY</h3>
          <div className="tk-summary-line" />
          {totalTickets === 0 ? (
            <p className="tk-summary-empty">No tickets selected yet.</p>
          ) : (
            <>
              {selected.map((t) => (
                <div className="tk-sum-row" key={t.id}>
                  <span>{t.name} × {quantities[t.id]}</span>
                  <span>{t.price === 0 ? "FREE" : `$${(t.price * quantities[t.id]).toFixed(2)}`}</span>
                </div>
              ))}
              <div className="tk-sum-divider" />
              <div className="tk-sum-row tk-sum-total">
                <span>TOTAL</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </>
          )}
          {visitDate && (
            <div className="tk-sum-visit">
              <span className="tk-sum-visit-label">VISIT DATE</span>
              <span>{formatDate(visitDate)}</span>
              {visitTime && <span>{formatTime(visitTime)}</span>}
            </div>
          )}

          {/* Back / Next buttons in sidebar */}
          {nextLabel && (
            <div className="tk-sum-actions">
              <button className="tk-btn-gold" onClick={onNext} disabled={nextDisabled}>
                {nextLabel} <span>→</span>
              </button>
              {step > 1 && (
                <button className="tk-btn-outline" onClick={onBack}>← BACK</button>
              )}
            </div>
          )}

          <div className="tk-summary-notes">
            <p>🔒 Secure booking</p>
            <p>📧 Confirmation sent by email</p>
            <p>📍 10801 NW 50th St, Sunrise FL</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── STEP 1: TICKET SELECTION (ticket cards) ──────────────────────────────────
function StepSelectTickets({ quantities, setQuantities, activeTour, setActiveTour, vipError }) {
  const groupMap = {
    self_guided: TICKET_TYPES.filter((t) => t.tourType === "self_guided"),
    vip:         TICKET_TYPES.filter((t) => t.tourType === "vip"),
    gift:        TICKET_TYPES.filter((t) => t.tourType === "gift"),
  };

  function setQty(id, value) {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, value) }));
  }

  function selectTour(key) {
    setActiveTour(key);
    setQuantities((prev) => {
      const next = { ...prev };
      TICKET_TYPES.forEach((t) => { if (t.tourType !== key) next[t.id] = 0; });
      return next;
    });
  }

  return (
    <div>
      <div className="tk-section-head">
        <span className="tk-section-eyebrow">CHOOSE YOUR EXPERIENCE</span>
        <p>Select a tour type, then choose your ticket quantities.</p>
      </div>

      <div className="tk-tour-tabs">
        {TOUR_GROUPS.map((g) => (
          <button key={g.key} className={`tk-tour-tab${activeTour === g.key ? " tk-tour-tab--active" : ""}`} onClick={() => selectTour(g.key)}>
            {g.label}
          </button>
        ))}
      </div>

      {TOUR_GROUPS.filter((g) => g.key === activeTour).map((g) => (
        <div className="tk-tour-banner" key={g.key}>
          <img src={g.image} alt={g.label} className="tk-tour-banner-img" />
          <div className="tk-tour-banner-overlay" />
          <div className="tk-tour-banner-content">
            <span className="tk-eyebrow">{g.label.toUpperCase()}</span>
            <p>{g.desc}</p>
          </div>
        </div>
      ))}

      <div className="tk-ticket-grid">
        {(groupMap[activeTour] || []).map((t) => {
          const qty = quantities[t.id] || 0;
          const minQ = Math.max(1, t.minimumQuantity);

          return (
            <div className={`tk-ticket-card${qty > 0 ? " tk-ticket-card--selected" : ""}`} key={t.id}>

              {/* Image area: real image if t.image is set, else placeholder */}
              <div className="tk-ticket-art">
                {t.image ? (
                  <img src={t.image} alt={`${t.name} ticket`} />
                ) : (
                  <div className="tk-ticket-placeholder" aria-hidden="true">
                    <span className="tk-ticket-ph-brand">Dauer</span>
                    <span className="tk-ticket-ph-sub">CLASSIC CARS</span>
                    <span className="tk-ticket-ph-type">{t.name}</span>
                  </div>
                )}
              </div>

              <div className="tk-ticket-card-body">
                <h3 className="tk-ticket-card-name">{t.name}</h3>
                <div className="tk-ticket-badges">
                  <span className="tk-ticket-age-badge">{t.ageLabel}</span>
                  {t.minimumQuantity > 1 && <span className="tk-ticket-age-badge">MIN. {t.minimumQuantity} TICKETS</span>}
                  {t.requiresId && <span className="tk-id-badge">ID REQUIRED</span>}
                </div>
                <p className="tk-ticket-card-desc">{t.description}</p>
              </div>

              <div className="tk-ticket-card-footer">
                <span className="tk-price">
                  {t.price === 0 ? <span className="tk-price-free">FREE</span> : <>${t.price}<small>.00</small></>}
                </span>

                {qty === 0 ? (
                  <button className="tk-select-btn" onClick={() => setQty(t.id, minQ)}>
                    SELECT TICKET
                  </button>
                ) : (
                  <div className="tk-qty">
                    <button
                      className="tk-qty-btn"
                      aria-label={`Decrease ${t.name} tickets`}
                      onClick={() => setQty(t.id, qty - 1 < minQ ? 0 : qty - 1)}
                    >−</button>
                    <span className="tk-qty-val" aria-live="polite">{qty}</span>
                    <button
                      className="tk-qty-btn"
                      aria-label={`Increase ${t.name} tickets`}
                      onClick={() => setQty(t.id, qty + 1)}
                    >+</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {vipError && <p className="tk-field-error tk-vip-error" role="alert">{vipError}</p>}

      <div className="tk-info-strip">
        <div className="tk-info-item">
          <span className="tk-info-label">HOURS</span>
          <span>Mon – Sat, 9:00 AM – 3:00 PM (closed Sundays)</span>
        </div>
        <div className="tk-info-item">
          <span className="tk-info-label">LOCATION</span>
          <span>10801 NW 50th St, Sunrise, FL 33351</span>
          <a href="https://www.google.com/maps/search/?api=1&query=10801+NW+50th+St+Sunrise+FL+33351" target="_blank" rel="noreferrer" className="tk-info-link">GET DIRECTIONS →</a>
        </div>
      </div>
    </div>
  );
}

// ─── STEP 2: VISIT DATE ───────────────────────────────────────────────────────
function StepVisitDate({ visitDate, setVisitDate, visitTime, setVisitTime, errors }) {
  const dateError = visitDate && isClosed(visitDate)
    ? "The museum is closed on that day. Please select Monday–Saturday."
    : errors.visitDate;

  return (
    <div>
      <div className="tk-section-head">
        <span className="tk-section-eyebrow">PLAN YOUR VISIT</span>
        <p>Select your visit date and preferred arrival time.</p>
      </div>
      <div className="tk-date-grid">
        <div className="tk-form-group">
          <label htmlFor="tk-visit-date">VISIT DATE <span className="tk-required">*</span></label>
          <input id="tk-visit-date" type="date" min={today} value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            aria-invalid={!!dateError}
            className={dateError ? "tk-input-err" : ""} />
          {dateError && <span className="tk-field-error" role="alert">{dateError}</span>}
          <span className="tk-field-hint">Museum is open Monday – Saturday, 9:00 AM – 3:00 PM</span>
        </div>
        <div className="tk-form-group">
          <label htmlFor="tk-visit-time">ARRIVAL TIME <span className="tk-required">*</span></label>
          <select id="tk-visit-time" value={visitTime} onChange={(e) => setVisitTime(e.target.value)}
            aria-invalid={!!errors.visitTime}
            className={errors.visitTime ? "tk-input-err" : ""}>
            <option value="">— Select a time slot —</option>
            {MUSEUM.timeSlots.map((s) => <option key={s} value={s}>{formatTime(s)}</option>)}
          </select>
          {errors.visitTime && <span className="tk-field-error" role="alert">{errors.visitTime}</span>}
          <span className="tk-field-hint">Last entry at 2:00 PM. Museum closes at 3:00 PM.</span>
        </div>
      </div>
      <div className="tk-availability-note">
        <span className="tk-info-label">NOTE</span>
        <p>Please arrive within 15 minutes of your selected time slot.</p>
      </div>
    </div>
  );
}

// ─── STEP 3: CUSTOMER INFO ────────────────────────────────────────────────────
function StepCustomerInfo({ form, setForm, errors, hasIdTickets }) {
  function handle(field, val) { setForm((prev) => ({ ...prev, [field]: val })); }

  return (
    <div>
      <div className="tk-section-head">
        <span className="tk-section-eyebrow">YOUR DETAILS</span>
        <p>Please fill in your information to complete the booking.</p>
      </div>

      {hasIdTickets && (
        <div className="tk-id-notice">
          <span>⚠</span>
          <p>You have selected Military or First Responder tickets. Valid government-issued identification will be required at museum entry.</p>
        </div>
      )}

      <div className="tk-form-row">
        <div className="tk-form-group">
          <label htmlFor="tk-first-name">FIRST NAME <span className="tk-required">*</span></label>
          <input id="tk-first-name" type="text" autoComplete="given-name" placeholder="Your first name" value={form.firstName}
            onChange={(e) => handle("firstName", e.target.value)}
            aria-invalid={!!errors.firstName}
            className={errors.firstName ? "tk-input-err" : ""} />
          {errors.firstName && <span className="tk-field-error" role="alert">{errors.firstName}</span>}
        </div>
        <div className="tk-form-group">
          <label htmlFor="tk-last-name">LAST NAME <span className="tk-required">*</span></label>
          <input id="tk-last-name" type="text" autoComplete="family-name" placeholder="Your last name" value={form.lastName}
            onChange={(e) => handle("lastName", e.target.value)}
            aria-invalid={!!errors.lastName}
            className={errors.lastName ? "tk-input-err" : ""} />
          {errors.lastName && <span className="tk-field-error" role="alert">{errors.lastName}</span>}
        </div>
      </div>
      <div className="tk-form-row">
        <div className="tk-form-group">
          <label htmlFor="tk-email">EMAIL ADDRESS <span className="tk-required">*</span></label>
          <input id="tk-email" type="email" autoComplete="email" placeholder="your@email.com" value={form.email}
            onChange={(e) => handle("email", e.target.value)}
            aria-invalid={!!errors.email}
            className={errors.email ? "tk-input-err" : ""} />
          {errors.email && <span className="tk-field-error" role="alert">{errors.email}</span>}
        </div>
        <div className="tk-form-group">
          <label htmlFor="tk-phone">PHONE NUMBER <span className="tk-required">*</span></label>
          <input id="tk-phone" type="tel" autoComplete="tel" placeholder="(000) 000-0000" value={form.phone}
            onChange={(e) => handle("phone", e.target.value)}
            aria-invalid={!!errors.phone}
            className={errors.phone ? "tk-input-err" : ""} />
          {errors.phone && <span className="tk-field-error" role="alert">{errors.phone}</span>}
        </div>
      </div>
      <div className="tk-form-group">
        <label htmlFor="tk-notes">SPECIAL NOTES <span className="tk-optional">(optional)</span></label>
        <textarea id="tk-notes" placeholder="Any special requirements or comments..." value={form.notes}
          onChange={(e) => handle("notes", e.target.value)} rows={3} />
      </div>
    </div>
  );
}

// ─── STEP 4: REVIEW ───────────────────────────────────────────────────────────
function StepReview({ quantities, visitDate, visitTime, form, onEditTickets, onEditDate, onEditCustomer }) {
  const selected = TICKET_TYPES.filter((t) => (quantities[t.id] || 0) > 0);
  const total = TICKET_TYPES.reduce((s, t) => s + t.price * (quantities[t.id] || 0), 0);

  return (
    <div>
      <div className="tk-section-head">
        <span className="tk-section-eyebrow">REVIEW YOUR ORDER</span>
        <p>Please review your booking details before confirming.</p>
      </div>

      <div className="tk-review-block">
        <div className="tk-review-block-header">
          <span>VISIT INFORMATION</span>
          <button className="tk-edit-btn" onClick={onEditDate}>Edit</button>
        </div>
        <div className="tk-review-row"><span>Date</span><strong>{formatDate(visitDate)}</strong></div>
        <div className="tk-review-row"><span>Time</span><strong>{formatTime(visitTime)}</strong></div>
        <div className="tk-review-row"><span>Location</span><strong>10801 NW 50th St, Sunrise, FL 33351</strong></div>
      </div>

      <div className="tk-review-block">
        <div className="tk-review-block-header">
          <span>TICKETS</span>
          <button className="tk-edit-btn" onClick={onEditTickets}>Edit</button>
        </div>
        {selected.map((t) => (
          <div className="tk-review-row" key={t.id}>
            <span>{t.name} × {quantities[t.id]}</span>
            <strong>{t.price === 0 ? "FREE" : `$${(t.price * quantities[t.id]).toFixed(2)}`}</strong>
          </div>
        ))}
        <div className="tk-review-row tk-review-total">
          <span>TOTAL</span>
          <strong>${total.toFixed(2)}</strong>
        </div>
      </div>

      <div className="tk-review-block">
        <div className="tk-review-block-header">
          <span>CUSTOMER</span>
          <button className="tk-edit-btn" onClick={onEditCustomer}>Edit</button>
        </div>
        <div className="tk-review-row"><span>Name</span><strong>{form.firstName} {form.lastName}</strong></div>
        <div className="tk-review-row"><span>Email</span><strong>{form.email}</strong></div>
        <div className="tk-review-row"><span>Phone</span><strong>{form.phone}</strong></div>
        {form.notes && <div className="tk-review-row"><span>Notes</span><strong>{form.notes}</strong></div>}
      </div>
    </div>
  );
}

// ─── STEP 5: CONFIRMATION ─────────────────────────────────────────────────────
function StepConfirmation({ booking, onPrint, onReset }) {
  if (!booking) return null;
  const hasIdTickets = booking.items.some((i) => i.requiresId);

  return (
    <div className="tk-confirm-wrap">
      <div className="tk-confirm-box">
        <div className="tk-confirm-icon">✓</div>
        <h2>Booking Confirmed</h2>
        <p className="tk-confirm-sub">
          Thank you, <strong>{booking.firstName} {booking.lastName}</strong>! Your booking reference is below.
        </p>

        <div className="tk-eticket" id="tk-eticket-print">
          <div className="tk-eticket-header">
            <span className="tk-eticket-brand">DAUER CLASSIC CARS</span>
            <span className="tk-eticket-sub">Classic Car Museum of South Florida</span>
          </div>
          <div className="tk-eticket-left">
            <div className="tk-eticket-ref">
              <span className="tk-info-label">BOOKING REFERENCE</span>
              <strong>{booking.bookingReference}</strong>
            </div>
            <div className="tk-eticket-row"><span>Name</span><strong>{booking.firstName} {booking.lastName}</strong></div>
            <div className="tk-eticket-row"><span>Email</span><strong>{booking.email}</strong></div>
            <div className="tk-eticket-row"><span>Phone</span><strong>{booking.phone}</strong></div>
            <div className="tk-eticket-row"><span>Visit Date</span><strong>{formatDate(booking.visitDate)}</strong></div>
            <div className="tk-eticket-row"><span>Arrival Time</span><strong>{formatTime(booking.visitTime)}</strong></div>
            <div className="tk-eticket-divider" />
            {booking.items.map((item, i) => (
              <div className="tk-eticket-row" key={i}>
                <span>{item.name} × {item.qty}</span>
                <strong>{item.price === 0 ? "FREE" : `$${(item.price * item.qty).toFixed(2)}`}</strong>
              </div>
            ))}
            <div className="tk-eticket-divider" />
            <div className="tk-eticket-row tk-eticket-total">
              <span>TOTAL</span>
              <strong>${booking.total.toFixed(2)}</strong>
            </div>
            <div className="tk-eticket-divider" />
            <div className="tk-eticket-row"><span>Status</span><strong className="tk-status-confirmed">CONFIRMED</strong></div>
            <div className="tk-eticket-address">
              <span>📍 10801 NW 50th St, Sunrise, FL 33351</span>
              <span>🕘 Mon–Sat · 9:00 AM – 3:00 PM</span>
            </div>
          </div>
          {hasIdTickets && (
            <div className="tk-eticket-id-notice">
              ⚠ Military / First Responder tickets require valid government-issued ID at entry.
            </div>
          )}
        </div>

        <div className="tk-confirm-actions">
          <button className="tk-btn-gold" onClick={onPrint}>🖨 PRINT / SAVE TICKET</button>
          <button className="tk-btn-outline" onClick={onReset}>BOOK MORE TICKETS →</button>
        </div>

        <div className="tk-confirm-venue">
          <p>📍 10801 NW 50th St, Sunrise, FL 33351</p>
          <p>🕘 Monday – Saturday &nbsp;|&nbsp; 9:00 AM – 3:00 PM</p>
          <p>📞 (954) 748-6271</p>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
function Tickets() {
  const [step, setStep] = useState(1);
  const [activeTour, setActiveTour] = useState("self_guided");
  const [quantities, setQuantities] = useState({});
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", notes: "" });
  const [errors, setErrors] = useState({});
  const [vipError, setVipError] = useState("");
  const [booking, setBooking] = useState(null);
  const bodyRef = useRef(null);

  function scrollToContent() {
    if (bodyRef.current) bodyRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);
  const total = TICKET_TYPES.reduce((s, t) => s + t.price * (quantities[t.id] || 0), 0);
  const hasIdTickets = TICKET_TYPES.some((t) => t.requiresId && (quantities[t.id] || 0) > 0);

  function checkVip() {
    const vip = TICKET_TYPES.find((t) => t.tourType === "vip");
    if (!vip) return true;
    const qty = quantities[vip.id] || 0;
    if (qty > 0 && qty < vip.minimumQuantity) {
      setVipError(`VIP Tour requires a minimum of ${vip.minimumQuantity} tickets.`);
      return false;
    }
    setVipError("");
    return true;
  }

  // NOTE: on validation failure we also scroll up, so errors are visible
  // even when "Next" is clicked from the sidebar.
  function step1Next() {
    if (totalTickets === 0) { setVipError("Please select at least one ticket."); scrollToContent(); return; }
    if (!checkVip()) { scrollToContent(); return; }
    setVipError("");
    setStep(2); scrollToContent();
  }

  function step2Next() {
    const e = {};
    if (!visitDate) e.visitDate = "Please select a visit date.";
    else if (visitDate < today) e.visitDate = "Visit date cannot be in the past.";
    else if (isClosed(visitDate)) e.visitDate = "The museum is closed on that day. Please select Monday–Saturday.";
    if (!visitTime) e.visitTime = "Please select an arrival time.";
    if (Object.keys(e).length) { setErrors(e); scrollToContent(); return; }
    setErrors({});
    setStep(3); scrollToContent();
  }

  function step3Next() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.lastName.trim()) e.lastName = "Last name is required.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "A valid email address is required.";
    if (!form.phone.trim() || !/^[\d\s\-\+\(\)]{7,20}$/.test(form.phone.trim())) e.phone = "A valid phone number is required.";
    if (Object.keys(e).length) { setErrors(e); scrollToContent(); return; }
    setErrors({});
    setStep(4); scrollToContent();
  }

  function step4Confirm() {
    const items = TICKET_TYPES
      .filter((t) => (quantities[t.id] || 0) > 0)
      .map((t) => ({ id: t.id, name: t.name, price: t.price, qty: quantities[t.id], requiresId: t.requiresId }));

    setBooking({
      bookingReference: genRef(),
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      notes: form.notes,
      visitDate,
      visitTime,
      items,
      total,
    });
    setStep(5); scrollToContent();
  }

  function goBack() {
    setStep((s) => Math.max(1, s - 1));
    scrollToContent();
  }

  function handleReset() {
    setStep(1); setQuantities({}); setVisitDate(""); setVisitTime("");
    setForm({ firstName: "", lastName: "", email: "", phone: "", notes: "" });
    setErrors({}); setVipError(""); setBooking(null); setActiveTour("self_guided");
    scrollToContent();
  }

  const navConfig = {
    1: { label: "SELECT DATE",    action: step1Next,    disabled: totalTickets === 0 },
    2: { label: "ENTER DETAILS",  action: step2Next,    disabled: false },
    3: { label: "REVIEW ORDER",   action: step3Next,    disabled: false },
    4: { label: "CONFIRM BOOKING",action: step4Confirm, disabled: false },
  };
  const nc = navConfig[step];

  return (
    <div className="tk-page">

      {/* HERO */}
      <section className="tk-hero">
        <img src="/images/car-01.png" alt="Dauer Classic Cars Museum" className="tk-hero-img" />
        <div className="tk-hero-overlay" />
        <div className="tk-hero-content">
          <span className="tk-eyebrow">DAUER CLASSIC CARS</span>
          <h1>Buy <em>Tickets</em></h1>
          <p>Select your tickets and visit us at the Classic Car Museum of South Florida.</p>
          <div className="tk-hero-meta">
            <div className="tk-meta-item"><span className="tk-meta-label">LOCATION</span><span>10801 NW 50th St, Sunrise FL</span></div>
            <div className="tk-meta-sep" />
            <div className="tk-meta-item"><span className="tk-meta-label">HOURS</span><span>Mon – Sat &nbsp;|&nbsp; 9AM – 3PM</span></div>
            <div className="tk-meta-sep" />
            <div className="tk-meta-item"><span className="tk-meta-label">PHONE</span><span>(954) 748-6271</span></div>
          </div>
        </div>
      </section>

      <StepBar step={step} />

      {/* CONFIRMATION */}
      {step === 5 && (
        <div ref={bodyRef}>
          <StepConfirmation booking={booking} onPrint={() => window.print()} onReset={handleReset} />
        </div>
      )}

      {/* STEPS 1–4 */}
      {step < 5 && (
        <div className="tk-body" ref={bodyRef}>
          <div className="tk-main">

            {step === 1 && (
              <StepSelectTickets
                quantities={quantities} setQuantities={setQuantities}
                activeTour={activeTour} setActiveTour={setActiveTour}
                vipError={vipError}
              />
            )}
            {step === 2 && (
              <StepVisitDate
                visitDate={visitDate} setVisitDate={setVisitDate}
                visitTime={visitTime} setVisitTime={setVisitTime}
                errors={errors}
              />
            )}
            {step === 3 && (
              <StepCustomerInfo form={form} setForm={setForm} errors={errors} hasIdTickets={hasIdTickets} />
            )}
            {step === 4 && (
              <StepReview
                quantities={quantities} visitDate={visitDate} visitTime={visitTime} form={form}
                onEditTickets={() => { setStep(1); scrollToContent(); }}
                onEditDate={() => { setStep(2); scrollToContent(); }}
                onEditCustomer={() => { setStep(3); scrollToContent(); }}
              />
            )}

            <div className="tk-nav-actions">
              {totalTickets > 0 && (
                <div className="tk-nav-total">
                  <span>{totalTickets} {totalTickets === 1 ? "TICKET" : "TICKETS"}</span>
                  <strong>${total.toFixed(2)}</strong>
                </div>
              )}
              {step > 1 && (
                <button className="tk-btn-outline" onClick={goBack}>← BACK</button>
              )}
              {nc && (
                <button className="tk-btn-gold" onClick={nc.action} disabled={nc.disabled}>
                  {nc.label} <span>→</span>
                </button>
              )}
            </div>
          </div>

          <OrderSummary
            quantities={quantities} visitDate={visitDate} visitTime={visitTime}
            step={step}
            onBack={goBack}
            onNext={nc ? nc.action : undefined}
            nextLabel={nc ? nc.label : ""}
            nextDisabled={nc ? nc.disabled : false}
          />
        </div>
      )}
    </div>
  );
}

export default Tickets;