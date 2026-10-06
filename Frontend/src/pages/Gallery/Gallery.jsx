import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./gallery.css";
// import "./.css";

// ── All car images (public/images/car/)
const CAR_IMAGES = [
  { src: "/images/car/Dauer-Classic-Car-Museum-South-Florida-2-768x576.jpg", title: "Museum Collection",        year: "DAUER · MUSEUM" },
  { src: "/images/car/Classic-Car-Museum-600x450.jpg",                        title: "Classic Car Museum",       year: "MUSEUM" },
  { src: "/images/car/Classic-Car-Museum-Florida-1-600x450.jpg",              title: "Museum Florida",           year: "FLORIDA" },
  { src: "/images/car/Classic-Cars-Museum-Rows-of-Cars-600x450.jpg",          title: "Rows of Cars",             year: "COLLECTION" },
  { src: "/images/car/Dauer-Classic-Cars-Cadillac-Collection.jpg",            title: "Cadillac Collection",      year: "CADILLAC" },
  { src: "/images/car/Dauer-Classic-Cars-Cadillac-Collection-2.jpg",          title: "Cadillac Collection II",   year: "CADILLAC" },
  { src: "/images/car/Dauer-Classic-Cadillacs-600x450.jpg",                   title: "Classic Cadillacs",        year: "CADILLAC" },
  { src: "/images/car/1958-Pontiac-Bonneville-Custom-Sport-Coupe.jpg",        title: "1958 Pontiac Bonneville",  year: "1958" },
  { src: "/images/car/1958-Pontiac-Bonneville-Custom-Sport-Coupe-interior.jpg", title: "Bonneville Interior",    year: "1958 · INTERIOR" },
  { src: "/images/car/Classic-Cars-Convertable-600x450.jpg",                  title: "Classic Convertible",      year: "CONVERTIBLE" },
  { src: "/images/car/Classic-Cars-South-Florida-3-600x450.jpg",              title: "South Florida Cars",       year: "SOUTH FLORIDA" },
  { src: "/images/car/marilyn-monroes-car-600x450.jpg",                       title: "Marilyn Monroe's Car",     year: "CELEBRITY" },
  { src: "/images/car/First-Family-Cars-600x450.jpg",                         title: "First Family Cars",        year: "HISTORIC" },
  { src: "/images/car/Jeep-600x450.jpg",                                      title: "Classic Jeep",             year: "JEEP" },
  { src: "/images/car/Classic-Texico-Gas-Station-600x450.jpg",                title: "Texaco Gas Station",       year: "MEMORABILIA" },
  { src: "/images/car/Dauer-Classic-Texico-Cars-600x450.jpg",                 title: "Texaco Cars Display",      year: "MEMORABILIA" },
  { src: "/images/car/Dauer-Classic-Cars-Old-Time-Movies-768x576.jpg",        title: "Old Time Movies Display",  year: "EXHIBIT" },
];

// ── All history images (public/images/history/ + src/assets/history1-6)
import history1 from "../../assets/history1.jpg";
import history2 from "../../assets/history2.jpg";
import history3 from "../../assets/history3.jpg";
import history4 from "../../assets/history4.jpg";
import history5 from "../../assets/history5.jpg";
import history6 from "../../assets/history6.jpg";

const HISTORY_IMAGES = [
  { src: "/images/history/Sunoco-600x800.jpg",                title: "Sunoco Station",         label: "MEMORABILIA" },
  { src: "/images/history/Classic-Switchboard-600x800.jpg",   title: "Classic Switchboard",    label: "TECHNOLOGY" },
  { src: "/images/history/Cigarettes-Machine-600x800.jpg",    title: "Cigarette Machine",      label: "ARTIFACTS" },
  { src: "/images/history/Black-White-Camera-600x800.jpg",    title: "Vintage Camera",         label: "PHOTOGRAPHY" },
  { src: "/images/history/Camera-Inside-600x800.jpg",         title: "Camera Interior",        label: "PHOTOGRAPHY" },
  { src: "/images/history/Electronic-Microscope-600x800.jpg", title: "Electronic Microscope",  label: "SCIENCE" },
  { src: "/images/history/Inside-Camera-2-600x450.jpg",       title: "Camera Mechanics",       label: "PHOTOGRAPHY" },
  { src: "/images/history/Motor-2-600x450.jpg",               title: "Classic Motor",          label: "ENGINE" },
  { src: history1, title: "History Display I",    label: "HISTORY" },
  { src: history2, title: "History Display II",   label: "HISTORY" },
  { src: history3, title: "History Display III",  label: "HISTORY" },
  { src: history4, title: "History Display IV",   label: "HISTORY" },
  { src: history5, title: "History Display V",    label: "HISTORY" },
  { src: history6, title: "History Display VI",   label: "HISTORY" },
];

// Each group is browsed separately (next/previous stays inside Cars or inside History)
const GROUPS = {
  cars: CAR_IMAGES.map((i) => ({ src: i.src, title: i.title, label: i.year })),
  history: HISTORY_IMAGES.map((i) => ({ src: i.src, title: i.title, label: i.label })),
};

/* ---------------------------------------------------------
   ICONS
--------------------------------------------------------- */
const Icon = {
  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
  Prev: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  ),
  Next: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 5l7 7-7 7" />
    </svg>
  ),
  Expand: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" />
    </svg>
  ),
};

/* ---------------------------------------------------------
   LIGHTBOX
   - Prev / Next buttons + keyboard arrows + swipe on mobile
   - Esc, X button, or click outside the image to close
   - Preloads the neighbouring images, shows a loader
   - Locks page scroll, keeps focus inside, restores focus on close
--------------------------------------------------------- */
function Lightbox({ items, index, onClose, onNavigate }) {
  const rootRef = useRef(null);
  const closeRef = useRef(null);
  const touchRef = useRef(null);
  const [loaded, setLoaded] = useState({ src: null, ratio: 4 / 3 });

  const total = items.length;
  const item = items[index];
  const isLoaded = loaded.src === item.src;

  const go = useCallback(
    (dir) => onNavigate((index + dir + total) % total),
    [index, total, onNavigate]
  );

  // Lock background scroll (without the page jumping sideways)
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
    };
  }, []);

  // Keyboard: Esc, ← →, and Tab stays inside the lightbox
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowRight") { go(1); return; }
      if (e.key === "ArrowLeft") { go(-1); return; }

      if (e.key === "Tab" && rootRef.current) {
        const f = rootRef.current.querySelectorAll("button");
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  // Preload next + previous so arrows feel instant
  useEffect(() => {
    [1, -1].forEach((d) => {
      const im = new Image();
      im.src = items[(index + d + total) % total].src;
    });
  }, [index, items, total]);

  // Swipe left / right on touch screens
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e) => {
    if (!touchRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    touchRef.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  };

  // Click on the dark area (not image / buttons / caption) closes
  const onBackdrop = (e) => {
    if (!e.target.closest("button, img, .lb-caption")) onClose();
  };

  const markLoaded = (e) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    setLoaded({ src: item.src, ratio: w && h ? w / h : 4 / 3 });
  };

  return createPortal(
    <div
      ref={rootRef}
      className="lb"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      onClick={onBackdrop}
    >
      <div className="lb-top">
        <span className="lb-count" aria-hidden="true">
          <b>{String(index + 1).padStart(2, "0")}</b> / {String(total).padStart(2, "0")}
        </span>
        <button ref={closeRef} type="button" className="lb-btn" onClick={onClose} aria-label="Close image viewer">
          <Icon.Close />
        </button>
      </div>

      <div className="lb-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <button type="button" className="lb-btn lb-nav lb-prev" onClick={() => go(-1)} aria-label="Previous image">
          <Icon.Prev />
        </button>

        {!isLoaded && <span className="lb-spinner" aria-hidden="true" />}

        <img
          key={item.src}
          className={`lb-img${isLoaded ? " is-loaded" : ""}`}
          style={{ "--ar": loaded.ratio }}
          src={item.src}
          alt={item.title}
          draggable="false"
          onLoad={markLoaded}
          onError={markLoaded}
        />

        <button type="button" className="lb-btn lb-nav lb-next" onClick={() => go(1)} aria-label="Next image">
          <Icon.Next />
        </button>
      </div>

      <div className="lb-caption" aria-live="polite">
        <span className="lb-label">{item.label}</span>
        <h3 className="lb-title">{item.title}</h3>
      </div>
    </div>,
    document.body
  );
}

/* ---------------------------------------------------------
   PAGE
--------------------------------------------------------- */
export default function Gallery() {
  const [box, setBox] = useState(null); // { group: "cars" | "history", index: number } | null
  const triggerRef = useRef(null);

  const open = (group, index, e) => {
    triggerRef.current = e.currentTarget; // so focus can return to the clicked image
    setBox({ group, index });
  };

  const close = useCallback(() => {
    setBox(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const navigate = useCallback((index) => {
    setBox((b) => (b ? { ...b, index } : b));
  }, []);

  return (
    <main className="gallery-page">

      {/* ── HERO ── */}
      <section style={{ position: "relative", minHeight: "70vh", overflow: "hidden", background: "#11100e", display: "flex", alignItems: "flex-end" }}>
        <img
          src="/images/carGallery-02.png"
          alt="Dauer Classic Car Museum"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.85), rgba(0,0,0,0.45), rgba(0,0,0,0.25))" }} />
        <div style={{ position: "relative", zIndex: 2, padding: "0 8% 80px", width: "100%" }}>
          <span className="gallery-label" style={{ marginBottom: 20, display: "inline-flex" }}>The Collection</span>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(64px, 10vw, 120px)", fontWeight: 400, lineHeight: 0.85, letterSpacing: "-3px", color: "#f8f3e8", margin: "16px 0 24px" }}>
            Gallery
          </h1>
          <p style={{ maxWidth: 520, color: "rgba(245,239,226,0.75)", fontSize: 15, lineHeight: 1.85, margin: 0 }}>
            A closer look at the automobiles, memories and atmosphere inside Dauer Classic Cars.
          </p>
        </div>
      </section>

      {/* ── INTRO ── */}
      {/* ── INTRO ── */}
      <section className="gv-intro">
        <div className="gv-intro-inner">
          <div className="gv-intro-grid">
            <div className="gv-intro-head">
              <span className="gallery-label gv-intro-label">A Visual Journey</span>
              <h2 className="gv-intro-title">
                Cars with <em>character.</em>
              </h2>
            </div>
            <div className="gv-intro-text">
              <p>
                They say that a picture is worth a thousand words, but at Dauer Classic Cars a picture is worth a thousand memories.
              </p>
              <p>
                Explore the automobiles, memorabilia and atmosphere that make the Dauer collection unique.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CAR IMAGES ── */}
      <section className="gallery-section">
        <div className="gallery-heading">
          <div>
            <span className="gallery-label">The Collection</span>
            <h2>The <em>Cars.</em></h2>
          </div>
          <p>{CAR_IMAGES.length} photographs from the museum floor and collection.</p>
        </div>

        <div className="gallery-grid">
          {CAR_IMAGES.map((img, i) => (
            <div className="gallery-card" key={i}>
              <button
                type="button"
                className="gallery-image gallery-zoom"
                onClick={(e) => open("cars", i, e)}
                aria-label={`View larger: ${img.title}`}
              >
                <span className="gallery-number">{String(i + 1).padStart(2, "0")}</span>
                <img src={img.src} alt={img.title} loading="lazy" style={{ objectFit: "cover", padding: 0 }} />
                <span className="zoom-hint" aria-hidden="true"><Icon.Expand /></span>
              </button>
              <div className="gallery-card-content">
                <div className="gallery-card-top">
                  <span className="gallery-card-number">{img.year}</span>
                  <span className="gallery-card-line" />
                </div>
                <h3>{img.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HISTORY IMAGES ── */}
      <section className="history-section">
        <div className="history-header">
          <span className="gallery-label">Behind the Collection</span>
          <h2>The <em>History.</em></h2>
          <p>
            Dauer is more than a collection of automobiles. The museum brings together cars, memorabilia,
            technology and artifacts that preserve the atmosphere of another era.
          </p>
        </div>

        <div className="history-grid">
          {HISTORY_IMAGES.map((img, i) => (
            <div className="history-card" key={i}>
              <button
                type="button"
                className="history-image gallery-zoom"
                onClick={(e) => open("history", i, e)}
                aria-label={`View larger: ${img.title}`}
              >
                <span className="history-number">{String(i + 1).padStart(2, "0")}</span>
                <img src={img.src} alt={img.title} loading="lazy" style={{ objectFit: "cover", padding: 0 }} />
                <span className="zoom-hint" aria-hidden="true"><Icon.Expand /></span>
              </button>
              <div className="history-content">
                <span className="history-small">{img.label}</span>
                <h3>{img.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── QUOTE ── */}
      <section className="gallery-quote">
        <span className="quote-symbol">"</span>
        <h2>Some stories are better<br /><em style={{ color: "#d2aa45", fontStyle: "italic" }}>experienced.</em></h2>
        <p>The images offer a glimpse into the collection. The museum lets you experience the atmosphere for yourself.</p>
      </section>

      {/* ── LIGHTBOX ── */}
      {box && (
        <Lightbox
          items={GROUPS[box.group]}
          index={box.index}
          onClose={close}
          onNavigate={navigate}
        />
      )}

    </main>
  );
}
