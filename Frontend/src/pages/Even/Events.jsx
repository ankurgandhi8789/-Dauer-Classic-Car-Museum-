import React from "react";
import "./Events.css";

import bigimage from "../../assets/bigimage4.jpg";

import event1 from "../../assets/event1.jpg";
import event2 from "../../assets/event2.jpg";
import event3 from "../../assets/event3.jpg";
import event4 from "../../assets/event4.jpg";
import event5 from "../../assets/event5.jpg";
import event6 from "../../assets/event6.jpg";

import party1 from "../../assets/party1.jpg";
import party2 from "../../assets/party2.jpg";
import party3 from "../../assets/party3.jpg";

const eventImages = [
  event1,
  event2,
  event3,
  event4,
  event5,
  event6,
];

const partyImages = [
  party1,
  party2,
  party3,
];

function Events() {
  return (
    <main className="events-page">

      {/* =========================
          HERO
      ========================= */}
      <section className="events-hero">
        <img
          src={bigimage}
          alt="Dauer Classic Cars Event"
          className="events-hero-image"
        />

        <div className="events-hero-overlay" />

        <div className="events-hero-content">
          <span className="events-label">
            DAUER CLASSIC CARS
          </span>

          <h1>
            Events at
            <br />
            <em>Dauer Classic Cars</em>
          </h1>

          <p>
            A unique event venue surrounded by beautiful classic
            automobiles, fascinating history, and an atmosphere
            unlike anywhere else.
          </p>
        </div>
      </section>


      {/* =========================
          EVENTS INTRO
      ========================= */}
      <section className="events-intro">
        <div className="events-section-label">
          EVENTS AT DAUER CLASSIC CARS
        </div>

        <div className="events-intro-content">

          <div className="events-intro-heading">
            <h2>
              A venue
              <br />
              <em>worth remembering.</em>
            </h2>
          </div>

          <div className="events-intro-copy">

            <p className="events-large-copy">
              Are you ready to host a party of your own?
              Dauer Classic Cars is a private event space
              nothing short of "wow".
            </p>

            <p>
              Located in Sunrise, Florida, both natives and
              visitors have utilized this event venue to
              celebrate their most important life events.
              From receptions to performances, from meetings
              to dinners, and from banquets to conferences,
              there is nowhere quite like Dauer Classic Cars
              for your special event.
            </p>

            <p>
              What better backdrop than a collection of the
              most extraordinary antique cars and innovations?
              Dauer Classic Cars has the ability to take an
              ordinary event like a meeting or corporate
              reception and transform it into an unforgettable
              experience for all.
            </p>

            <p>
              Private events like weddings and holiday
              gatherings will have your guests talking about
              the incredible ambience and breathtaking views.
            </p>

          </div>
        </div>
      </section>


      {/* =========================
          EVENT GALLERY
      ========================= */}
      <section className="events-gallery-section">

        {/* PARTY IMAGES */}
        <div className="events-party-gallery">
          {partyImages.map((image, index) => (
            <div
              className="events-party-card"
              key={image}
            >
              <img
                src={image}
                alt={`Dauer Classic Cars event ${index + 1}`}
                loading="lazy"
              />
            </div>
          ))}
        </div>


        {/* GALLERY HEADING */}
        <div className="events-gallery-heading">

          <span className="events-section-label">
            EVENT GALLERY
          </span>

          <h2>
            Moments worth
            <br />
            <em>remembering.</em>
          </h2>

        </div>


        {/* EVENT DESCRIPTION — ABOVE PHOTOS */}
        <div className="events-gallery-copy">

          <p>
            Our event space gives any party that little extra
            something that gets people talking and, most
            importantly, having fun. At Dauer Classic Cars,
            we take pride in our ability to host a memorable,
            once-in-a-lifetime type of event.
          </p>

          <p>
            Occasions big and small are enjoyed under our roof,
            surrounded by beautifully restored automobiles,
            fascinating history, and an atmosphere unlike
            anywhere else.
          </p>

        </div>


        {/* EVENT PHOTOS */}
        <div className="events-photo-grid">
          {eventImages.map((image, index) => (
            <div
              className="events-photo-card"
              key={image}
            >
              <img
                src={image}
                alt={`Dauer Classic Cars event ${index + 1}`}
                loading="lazy"
              />

              <span>
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>

      </section>


      {/* =========================
          MORE THAN A VENUE
      ========================= */}
      <section className="events-story">

        <div className="events-story-heading">

          <span className="events-section-label">
            MORE THAN A VENUE
          </span>

          <h2>
            Make your event
            <br />
            <em>extraordinary.</em>
          </h2>

        </div>

        <div className="events-story-copy">

          <p className="events-story-large">
            What better backdrop than a collection of the most
            extraordinary antique cars and innovations?
          </p>

          <p>
            Dauer Classic Cars has the ability to take an
            ordinary event like a meeting or corporate reception
            and transform it into an unforgettable experience
            for all.
          </p>

          <p>
            Private events like weddings and holiday gatherings
            give your guests the opportunity to enjoy incredible
            ambience, breathtaking views, and a collection unlike
            anything they have seen before.
          </p>

          <p>
            Surrounded by beautifully restored automobiles and
            fascinating pieces of history, your special occasion
            becomes more than just an event. It becomes a memory
            your guests will remember for years to come.
          </p>

        </div>

      </section>


      {/* =========================
          BOOKING
      ========================= */}
      <section className="events-booking">

        <div className="events-booking-content">

          <span className="events-section-label">
            READY TO BOOK?
          </span>

          <h2>
            Ready to book
            <br />
            <em>your next event?</em>
          </h2>

          <p>
            Give us a call at <strong>954-748-6271</strong> and
            discover what makes Dauer Classic Cars such a
            special place for unforgettable occasions.
          </p>

          <a
            href="tel:+19547486271"
            className="events-call-button"
          >
            CALL 954-748-6271
            <span>→</span>
          </a>

        </div>

      </section>

    </main>
  );
}

export default Events;
