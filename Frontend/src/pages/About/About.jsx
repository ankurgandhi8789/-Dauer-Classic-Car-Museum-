import React, { useEffect, useRef, useState } from "react";
import "./HeritageAbout.css";

/* ---------------------------------------------------------
   DATA (easy to edit)
--------------------------------------------------------- */
const FACTS = [
  { value: "Nearly 50", label: "YEARS OF COLLECTING" },
  { value: "55+",       label: "CLASSIC CARS" },
  { value: "1930s–70s", label: "ERA OF RESTORED CARS" },
  { value: "2001",      label: "MUSEUM OPENED" },
];

/* ---------------------------------------------------------
   SMALL HELPERS
--------------------------------------------------------- */

// Fade-up when a block scrolls into view
function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setShown(true); return; }
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setShown(true); io.disconnect(); } },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`heritage-reveal${shown ? " heritage-in" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// YouTube "click to play" (page loads faster than 2 live iframes)
function VideoCard({ id, title }) {
  const [play, setPlay] = useState(false);

  return (
    <div className="heritage-youtube-video">
      {play ? (
        <iframe
          src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      ) : (
        <button
          type="button"
          className="heritage-video-poster"
          onClick={() => setPlay(true)}
          aria-label={`Play video: ${title}`}
        >
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" />
          <span className="heritage-video-play" aria-hidden="true">▶</span>
        </button>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   PAGE
--------------------------------------------------------- */
function About() {
  return (
    <div className="heritage-about-page">

      {/* ================= HERO ================= */}
      <section className="heritage-about-page-hero">
        <div className="heritage-hero-overlay"></div>
        <div className="heritage-about-container heritage-hero-content">
          <span className="heritage-hero-eyebrow">ABOUT US</span>
          <h1>
            About Dauer <em>Classic Cars</em>
          </h1>
          <p>
            A passion for the past, shared with everyone — the story behind
            South Florida's classic car museum.
          </p>
        </div>
      </section>


      {/* ================= QUICK FACTS ================= */}
      <section className="heritage-facts" aria-label="Museum at a glance">
        <div className="heritage-about-container heritage-facts-grid">
          {FACTS.map((f) => (
            <div className="heritage-fact" key={f.label}>
              <strong>{f.value}</strong>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </section>


      {/* ================= INTRODUCTION ================= */}
      <section className="heritage-about-intro-section">
        <div className="heritage-about-container heritage-about-intro-grid">

          <Reveal className="heritage-intro-heading">
            <span className="heritage-section-number">01</span>
            <h2>
              A PASSION
              <br />
              FOR THE
              <br />
              <span>PAST</span>
            </h2>
          </Reveal>

          <Reveal className="heritage-intro-text" delay={120}>
            <p className="heritage-lead">
              The brainchild of Eddie and Joanne Dauer, Dauer Classic Cars is
              marked by their passion for and appreciation of our nation's rich
              history. What started as a hobby long ago has transformed into an
              incredible homage to the past. In fact, the couple's love of antique
              cars has been a driving force in their lives for nearly 50 years!
            </p>

            <div className="heritage-gold-quote">
              "What started as a hobby long ago has transformed into an
              incredible homage to the past."
            </div>

            <p>
              Eddie started collecting cars in college and even picked up Joanne
              in a 1941 Cadillac sedan for their very first date. After a lot of
              work in restoring it, they sold it and purchased a 1941 Cadillac
              limousine – their first car together as a couple. Since then, they
              have saved every single car that they have purchased – creating a
              wonderful window into yesteryear. As their collection grew and grew,
              the Dauers soon realized that they had quite a treasure on their
              hands. And such an outstanding treasure deserved to be shared.
            </p>
          </Reveal>

        </div>
      </section>


      {/* ================= IMAGE SHOWCASE ================= */}
      <section className="heritage-about-image-showcase">
        <div className="heritage-about-container heritage-image-showcase-grid">

          <div className="heritage-large-image">
            <img
              src="https://dauercars.com/wp-content/uploads/2023/05/Dauer-SOFLO-Health-Video.jpg"
              alt="Dauer Classic Cars featured on SoFlo Health"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="heritage-small-image">
            <img
              src="https://dauercars.com/wp-content/uploads/2021/04/So-Flo-Home-Thumbnail-1024x576.jpg"
              alt="Dauer Classic Cars featured on SoFlo Home"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="heritage-small-image">
            <img
              src="https://dauercars.com/wp-content/uploads/2021/04/Dauer-Classic-Car-Museum-South-Florida-2.jpg"
              alt="Dauer Classic Car Museum South Florida"
              loading="lazy"
              decoding="async"
            />
          </div>

        </div>
      </section>


      {/* ================= MUSEUM STORY ================= */}
      <section className="heritage-about-story-section">
        <div className="heritage-about-container heritage-story-grid">

          <Reveal className="heritage-story-image">
            <img
              src="https://dauercars.com/wp-content/uploads/2020/03/1958-Oldsmobile-98-Holiday-Coupe.jpg"
              alt="1958 Oldsmobile 98 Holiday Coupe"
              loading="lazy"
              decoding="async"
            />
          </Reveal>

          <Reveal className="heritage-story-content" delay={120}>
            <span className="heritage-section-number">02</span>
            <h2>
              A TREASURE
              <br />
              WORTH
              <br />
              <span>SHARING</span>
            </h2>

            <p>
              Officially opening their doors in 2001, Dauer Classic Cars has
              become a beacon of nostalgia, enjoyed by South Florida residents
              and vacationers alike. Today, Eddie and Joanne's vision has been
              brought to life. The beauty and wonderment that fills the walls of
              the museum is echoed by its visitors. As you stroll through the
              exhibits, you will inevitably lose yourself in the thrill of it
              all. From the flawless vehicles to the remarkable memorabilia,
              there is something special for everyone.
            </p>

            <p>
              Dauer Classic Cars' renowned collection is surely something to
              marvel. An opportunity to teach the young ones about the past and
              relive an exceptional time in our history, this type of family fun
              can't be found anywhere else in South Florida.
            </p>

            <p className="heritage-bold-message">
              We hope you will join us soon and relish in the days gone by!
            </p>
          </Reveal>

        </div>
      </section>


      {/* ================= CADILLACS IMAGE ================= */}
      <section className="heritage-single-feature-image">
        <img
          src="https://dauercars.com/wp-content/uploads/2021/04/Classic-Cadillacs-South-Florida.jpg"
          alt="Classic Cadillacs South Florida"
          loading="lazy"
          decoding="async"
        />
      </section>


      {/* ================= TIME MACHINE ================= */}
      <section className="heritage-time-machine-section">
        <div className="heritage-about-container">

          <Reveal className="heritage-time-machine-heading">
            <span className="heritage-section-number">03</span>
            <h2>
              ENTER A
              <br />
              <span>TIME MACHINE</span>
            </h2>
            <div className="heritage-gold-line"></div>
            <h3>
              "When you enter the Dauer Museum of Classic Cars, you enter a
              Time Machine"
            </h3>
          </Reveal>

          <Reveal>
            <p className="heritage-tm-lead">
              When you enter the classic car museum, over 55 classic cars
              transport you back to an age when Americans engaged in a more
              simple life. You'll see beautifully restored cars from the 1930's
              to the 1970's. As you walk along you will pass a nostalgic mural
              of the "Fabulous Fifties" while Marilyn Monroe looks down on her
              cream colored Cadillac convertible.
            </p>
          </Reveal>

          <div className="heritage-tm-grid">

            <Reveal className="heritage-tm-card">
              <span className="heritage-tm-card-mark" aria-hidden="true"></span>
              <h4>A Vintage Ambulance</h4>
              <p>
                When you walk by the Florida Medical Center mural, you can admire
                the vintage ambulance, fully restored. The interior is still
                functional, complete with all the medical technology known during
                the 1970's. It even has a loud working siren.
              </p>
            </Reveal>

            <Reveal className="heritage-tm-card" delay={120}>
              <span className="heritage-tm-card-mark" aria-hidden="true"></span>
              <h4>A 1934 Texaco Station</h4>
              <p>
                You then enter the perfectly replicated Texaco gasoline station,
                circa 1934, complete with an authentic Texaco gasoline truck and
                1930's vintage gasoline pumps, together with original products
                from the time when Americans were well into their love affair
                with the automobile.
              </p>
            </Reveal>

            <Reveal className="heritage-tm-card" delay={240}>
              <span className="heritage-tm-card-mark" aria-hidden="true"></span>
              <h4>A 1950s Hollywood Premiere</h4>
              <p>
                And there are more than just cars. With just a few steps you are
                transported into a Hollywood premier of the 50's complete with
                the luxury cars that the stars arrived in as well as beautifully
                restored vintage Black and White and Color video cameras that the
                movies of the past were filmed on.
              </p>
            </Reveal>

          </div>

          <Reveal>
            <p className="heritage-tm-closing">
              There is so much more to this "one-of-a-kind" museum. We know your
              trip to the Dauer Classic Car Museum will truly be an exciting
              adventure into the past.{" "}
              <strong>
                We hope you will join us soon and relish in the days gone by!
              </strong>
            </p>
          </Reveal>

        </div>
      </section>


      {/* ================= YOUTUBE VIDEOS ================= */}
      <section className="heritage-video-section">
        <div className="heritage-about-container">

          <Reveal className="heritage-video-heading">
            <span className="heritage-section-number">04</span>
            <h2>
              EXPERIENCE
              <br />
              <span>DAUER</span>
            </h2>
            <div className="heritage-gold-line"></div>
          </Reveal>

          <Reveal className="heritage-video-grid">
            <VideoCard id="hEEDpWKKtWE" title="Dauer Classic Car Museum Video 1" />
            <VideoCard id="NWdOpO6o5xc" title="Dauer Classic Car Museum Video 2" />
          </Reveal>

        </div>
      </section>


      {/* ================= FINAL GALLERY ================= */}
      <section className="heritage-final-gallery">
        <div className="heritage-about-container heritage-final-gallery-grid">

          <div className="heritage-gallery-card heritage-wide">
            <img
              src="https://dauercars.com/wp-content/uploads/2021/04/Dauer-Classic-Cars-Old-Time-Movies.jpg"
              alt="Dauer Classic Cars Old Time Movies"
              loading="lazy"
              decoding="async"
            />
            <div className="heritage-gallery-label">OLD TIME MOVIES</div>
          </div>

          <div className="heritage-gallery-card">
            <img
              src="https://dauercars.com/wp-content/uploads/2021/05/WW2-Jeep.jpg"
              alt="WW2 Jeep"
              loading="lazy"
              decoding="async"
            />
            <div className="heritage-gallery-label">WW2 JEEP</div>
          </div>

          <div className="heritage-gallery-card">
            <img
              src="https://dauercars.com/wp-content/uploads/2021/05/Vintage-Color-Video-Camera.jpg"
              alt="Vintage Color Video Camera"
              loading="lazy"
              decoding="async"
            />
            <div className="heritage-gallery-label">VINTAGE COLOR VIDEO CAMERA</div>
          </div>

        </div>
      </section>


      {/* ================= FINAL QUOTE + CTA ================= */}
      <section className="heritage-about-final-quote">
        <div className="heritage-about-container">
          <div className="heritage-quote-symbol">"</div>
          <h2>
            Come with us back to a more simple time...
            a time of cars and culture...of an era gone by.
          </h2>
          <div className="heritage-gold-line"></div>

          <div className="heritage-cta-row">
            <a href="/tickets" className="heritage-btn-gold">
              BUY TICKETS <span>→</span>
            </a>
            <a href="/Gallery" className="heritage-btn-outline">
              VIEW THE GALLERY
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}

export default About;