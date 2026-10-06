import React, { useState } from "react";
import "./Contact.css";

function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", subject: "", message: "" });

  function handle(field, val) { setForm((prev) => ({ ...prev, [field]: val })); }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="contact-page">

      {/* HERO */}
      {/* <section className="contact-hero">
        <div className="contact-hero-content">
          <span className="contact-label">DAUER CLASSIC CARS</span>
          <h1>Let's<br /><em>Connect.</em></h1>
          <p>Planning a visit, looking for more information, or simply want to share your passion for classic automobiles? We would love to hear from you.</p>
        </div>
        <div className="contact-hero-circle">
          <span>CONTACT</span>
          <strong>01</strong>
        </div>
      </section> */}

      {/* INFO CARDS */}
      <section className="contact-info-section">
        <div className="contact-info-header">
          <span className="contact-dark-label">GET IN TOUCH</span>
          <h2>We'd love to<br /><em>hear from you.</em></h2>
        </div>
        <div className="contact-info-grid">

          <div className="contact-info-card">
            <div className="contact-icon">01</div>
            <div>
              <span className="contact-card-label">VISIT US</span>
              <h3>Our Museum</h3>
              <p>10801 NW 50th St<br />Sunrise, FL 33351</p>
              <a href="https://www.google.com/maps/search/?api=1&query=10801+NW+50th+St+Sunrise+FL+33351" target="_blank" rel="noreferrer" className="contact-link">GET DIRECTIONS →</a>
            </div>
          </div>

          <div className="contact-info-card">
            <div className="contact-icon">02</div>
            <div>
              <span className="contact-card-label">CALL US</span>
              <h3>Phone</h3>
              <p><a href="tel:+19547486271">(954) 748-6271</a></p>
              <span className="contact-small-text">We're happy to answer your questions.</span>
            </div>
          </div>

          <div className="contact-info-card">
            <div className="contact-icon">03</div>
            <div>
              <span className="contact-card-label">OPENING HOURS</span>
              <h3>Museum Hours</h3>
              <p>Monday – Saturday<br />9:00 AM – 3:00 PM</p>
              <span className="contact-small-text">Closed on Sundays.</span>
            </div>
          </div>

        </div>
      </section>

      {/* DIRECTIONS + MAP */}
      <section className="contact-directions-section">
        <div className="contact-directions-inner">

          <div className="contact-directions-left">
            <span className="contact-label">FIND US</span>
            <h2>Getting<br /><em>Here.</em></h2>
            <p>We are conveniently located in Sunrise, Florida. Whether you're driving, using GPS, or taking public transit, we're easy to find.</p>

            <div className="contact-dir-details">
              <div className="contact-dir-row">
                <span className="contact-dir-icon">📍</span>
                <div>
                  <span className="contact-card-label">ADDRESS</span>
                  <p>10801 NW 50th St<br />Sunrise, FL 33351</p>
                </div>
              </div>
              <div className="contact-dir-row">
                <span className="contact-dir-icon">🕘</span>
                <div>
                  <span className="contact-card-label">HOURS</span>
                  <p>Monday – Saturday<br />9:00 AM – 3:00 PM</p>
                </div>
              </div>
              <div className="contact-dir-row">
                <span className="contact-dir-icon">📞</span>
                <div>
                  <span className="contact-card-label">PHONE</span>
                  <p><a href="tel:+19547486271">(954) 748-6271</a></p>
                </div>
              </div>
            </div>

            <a
              href="https://www.google.com/maps/dir/?api=1&destination=10801+NW+50th+St+Sunrise+FL+33351"
              target="_blank"
              rel="noreferrer"
              className="contact-dir-btn"
            >
              OPEN IN GOOGLE MAPS <span>→</span>
            </a>
          </div>

          <div className="contact-directions-right">
            <div className="contact-map-wrap">
              <iframe
                title="Dauer Classic Cars Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3582.3!2d-80.2707!3d26.1503!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88d9a3b1e1e1e1e1%3A0x1!2s10801+NW+50th+St%2C+Sunrise%2C+FL+33351!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

        </div>
      </section>

      {/* CONTACT FORM */}
      <section className="contact-form-section">
        <div className="contact-form-wrapper">

          <div className="contact-form-intro">
            <span className="contact-label">SEND A MESSAGE</span>
            <h2>Tell us<br /><em>your story.</em></h2>
            <p>Whether you have a question about our collection, want to plan your visit, or simply want to say hello — send us a message and our team will get back to you.</p>
            <div className="contact-form-decoration">
              <span></span><span></span><span></span>
            </div>
          </div>

          {submitted ? (
            <div className="contact-success">
              <div className="contact-success-icon">✓</div>
              <h3>Message Sent!</h3>
              <p>Thank you, <strong>{form.firstName}</strong>. We'll get back to you shortly.</p>
              <button className="contact-submit" onClick={() => { setSubmitted(false); setForm({ firstName: "", lastName: "", email: "", phone: "", subject: "", message: "" }); }}>
                SEND ANOTHER <span>→</span>
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>FIRST NAME</label>
                  <input type="text" placeholder="Your first name" value={form.firstName} onChange={(e) => handle("firstName", e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>LAST NAME</label>
                  <input type="text" placeholder="Your last name" value={form.lastName} onChange={(e) => handle("lastName", e.target.value)} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>EMAIL ADDRESS</label>
                  <input type="email" placeholder="your@email.com" value={form.email} onChange={(e) => handle("email", e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>PHONE</label>
                  <input type="tel" placeholder="Your phone number" value={form.phone} onChange={(e) => handle("phone", e.target.value)} />
                </div>
              </div>
              <div className="form-group full-width">
                <label>SUBJECT</label>
                <select value={form.subject} onChange={(e) => handle("subject", e.target.value)}>
                  <option value="">Select a subject</option>
                  <option value="visit">Planning a Visit</option>
                  <option value="collection">Collection Information</option>
                  <option value="event">Events</option>
                  <option value="general">General Question</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label>MESSAGE</label>
                <textarea rows="6" placeholder="Write your message here..." value={form.message} onChange={(e) => handle("message", e.target.value)} required />
              </div>
              <button type="submit" className="contact-submit">SEND MESSAGE <span>→</span></button>
            </form>
          )}

        </div>
      </section>

      {/* VISIT CTA */}
      <section className="contact-visit">
        <div className="visit-content">
          <span className="contact-label">COME VISIT US</span>
          <h2>Step into<br /><em>the past.</em></h2>
          <p>More than 55 classic automobiles await you. Come experience the history, craftsmanship, and culture of an extraordinary era.</p>
          <a href="https://www.google.com/maps/dir/?api=1&destination=10801+NW+50th+St+Sunrise+FL+33351" target="_blank" rel="noreferrer" className="visit-button">
            GET DIRECTIONS <span>→</span>
          </a>
        </div>
        <div className="visit-number">55+</div>
      </section>

    </main>
  );
}

export default Contact;
