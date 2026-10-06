import React from "react";
import "./Nav.css";
import { Link } from "react-router-dom";
import realogo from "../../assets/hdlogo.png";

function Nav() {
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
            <img src={realogo} alt="Logo" />
          </div>

          {/* Navigation Links */}
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

        </div>
      </nav>
    </>
  );
}

export default Nav;
