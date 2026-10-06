import React, { useEffect, useRef, useState } from "react";
import "./Nav.css";
import { Link, useLocation } from "react-router-dom";
import realogo from "../../assets/hdlogo.png";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/About", label: "About" },
  { to: "/Gallery", label: "Gallery" },
  { to: "/Events", label: "Events" },
  { to: "/Contact", label: "Contact" },
];

function Nav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const toggleRef = useRef(null);
  const closeRef = useRef(null);
  const drawerRef = useRef(null);
  const wasOpen = useRef(false);

  const closeMenu = () => setOpen(false);

  // Is this link the current page? (case-insensitive: /about = /About)
  const isActive = (to) => {
    const p = pathname.toLowerCase();
    return to === "/" ? p === "/" : p.startsWith(to.toLowerCase());
  };

  // Close the menu whenever the page changes (link click, browser back, etc.)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // While the menu is open:
  // lock page scroll, Esc closes, Tab stays inside the menu,
  // and the menu closes if the screen becomes wide (e.g. rotating a tablet)
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !drawerRef.current) return;

      const focusable = drawerRef.current.querySelectorAll("a[href], button:not([disabled])");
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const wide = window.matchMedia("(min-width: 901px)");
    const onWide = (e) => {
      if (e.matches) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    wide.addEventListener?.("change", onWide);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      wide.removeEventListener?.("change", onWide);
    };
  }, [open]);

  // Give focus back to the hamburger button after the menu closes
  useEffect(() => {
    if (!open && wasOpen.current) toggleRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  return (
    <>
      {/* Upper Navigation */}
      <div className="upper-nav">
        <div className="upper-nav-left">
          <span>10801 NW 50th St, Sunrise, FL 33351</span>
          <span>•</span>
          <span>Mon-Saturday | 9am - 3pm</span>
        </div>

        <div className="upper-nav-right">
          <span>Tel:</span>
          <a href="tel:+19547486271">(954) 748-6271</a>
        </div>
      </div>

      {/* Page-wide intro overlay */}
      <div className="logo-intro-overlay" aria-hidden="true"></div>

      {/* Sticky Navigation */}
      <nav className="bottom-nav">
        <div className="nav-container">

          {/* Logo */}
          <div className="nav-logo">
            <Link to="/" aria-label="Go to home page">
              <img src={realogo} alt="Logo" />
            </Link>
          </div>

          {/* Navigation Links (desktop + tablet) */}
          <div className="nav-links">
            <Link to={"/"}>
              <div className="ham1">Home</div>
            </Link>

            <Link to={"/About"}>
              <div className="ham1">About</div>
            </Link>

            <Link to={"/Gallery"}>
              <div className="ham1">Gallery</div>
            </Link>

            <Link to={"/Events"}>
              <div className="ham1">Events</div>
            </Link>

            <Link to={"/Contact"}>
              <div className="ham1">Contact</div>
            </Link>

            <Link to={"/tickets"} className="nav-buy-btn">
              BUY TICKETS
            </Link>
          </div>

          {/* Hamburger button (small screens only) */}
          <button
            ref={toggleRef}
            type="button"
            className="nav-toggle"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-drawer"
            onClick={() => setOpen(true)}
          >
            <span className="nav-toggle-lines" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

        </div>
      </nav>

      {/*
        Mobile menu is placed OUTSIDE <nav> on purpose:
        .bottom-nav uses backdrop-filter, which would trap a
        position:fixed menu inside the 86px-high header.
      */}
      <div
        className={`drawer-backdrop${open ? " is-open" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      ></div>

      <aside
        id="mobile-drawer"
        ref={drawerRef}
        className={`mobile-drawer${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!open}
      >
        <div className="drawer-header">
          <Link to="/" className="drawer-logo" onClick={closeMenu} aria-label="Go to home page">
            <img src={realogo} alt="Logo" />
          </Link>

          <button
            ref={closeRef}
            type="button"
            className="drawer-close"
            aria-label="Close menu"
            onClick={closeMenu}
          >
            <span></span>
            <span></span>
          </button>
        </div>

        <nav className="drawer-links" aria-label="Main menu">
          {LINKS.map((item, i) => (
            <Link
              key={item.to}
              to={item.to}
              className={`drawer-link${isActive(item.to) ? " is-active" : ""}`}
              style={{ "--i": i }}
              aria-current={isActive(item.to) ? "page" : undefined}
              onClick={closeMenu}
            >
              <span>{item.label}</span>
              <span className="drawer-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </nav>

        <div className="drawer-footer">
          <Link to="/tickets" className="drawer-buy" onClick={closeMenu}>
            BUY TICKETS
          </Link>

          <div className="drawer-info">
            <p>10801 NW 50th St, Sunrise, FL 33351</p>
            <p>Mon-Saturday | 9am - 3pm</p>
            <p>
              Tel: <a href="tel:+19547486271">(954) 748-6271</a>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Nav;
