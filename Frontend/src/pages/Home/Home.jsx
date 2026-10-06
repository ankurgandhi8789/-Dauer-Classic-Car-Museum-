import { useEffect, useRef, useState } from "react";

/* =========================================================
   DAUER MUSEUM OF CLASSIC CARS — HOME PAGE (redesign)

   Content, wording and section order are unchanged.
   The design takes its details from the subject itself:

   - Coachline    the double pinstripe painted along a classic
                  car's body, used as the section marker
   - Odometer     the statistics roll into place like a
                  dashboard odometer
   - Placards     collection cards are photo-first, with the
                  year on a small brass-style plate
   - Ticket       "Plan your visit" is a museum entry ticket
   - Type         Playfair Display (elegant high-contrast serif)
                  for headings, Inter for body text and buttons

   One orchestrated moment on load (hero), one on scroll
   (odometer). Everything else is still. All motion is
   switched off for visitors who prefer reduced motion.

   Self-contained: Tailwind utilities + one small <style> block.
   ========================================================= */

/* ---------- Content (unchanged) ---------- */

const STATS = [
  {
    value: "55+",
    label: "Classic Automobiles",
    text: "Vehicles preserved across generations of automotive history.",
  },
  {
    value: "1906–2020",
    label: "A Century of History",
    text: "Design, engineering and culture brought together under one roof.",
  },
  {
    value: "2001",
    label: "Museum Opens",
    text: "A destination for nostalgia and classic car lovers.",
  },
];

const CARS = [
  {
    year: "1929",
    name: "Cadillac",
    image: "/images/car-02.jpg",
    alt: "Classic Cadillac",
    text: "A striking example of early American luxury and craftsmanship.",
  },
  {
    year: "1958",
    name: "Pontiac Bonneville",
    image: "/images/car-03.jpg",
    alt: "Pontiac Bonneville",
    text: "Bold 1950s styling captured in one unforgettable automobile.",
  },
  {
    year: "1958",
    name: "Oldsmobile 98",
    image: "/images/car-04.jpg",
    alt: "Oldsmobile 98",
    text: "A classic American coupe with the character of its era.",
  },
];

const VIDEOS = [
  {
    id: "hEEDpWKKtWE",
    title: "Dauer Classic Cars",
    label: "Dauer Classic Cars",
    heading: "The Collection",
  },
  {
    id: "NWdOpO6o5xc",
    title: "Dauer Classic Cars Experience",
    label: "The Dauer Experience",
    heading: "Inside the Museum",
  },
];

const DIRECTIONS_URL =
  "https://www.google.com/maps/search/?api=1&query=10801+NW+50th+St+Sunrise+FL+33351";

/* ---------- Global CSS (fonts + the two motion moments) ---------- */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap');

.dm-serif {
  font-family: "Playfair Display", Georgia, "Times New Roman", serif;
  font-variant-numeric: lining-nums tabular-nums;
}
.dm-sans {
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
}

@keyframes dm-rise { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
@keyframes dm-settle { from { transform: scale(1.08); } to { transform: scale(1); } }

.dm-hero-img { animation: dm-settle 2.6s cubic-bezier(.2,.7,.2,1) both; }
.dm-rise { animation: dm-rise .9s cubic-bezier(.2,.7,.2,1) both; animation-delay: var(--d, 0ms); }

@media (prefers-reduced-motion: reduce) {
  .dm-hero-img, .dm-rise { animation: none; }
}
`;

const rise = (ms) => ({ "--d": `${ms}ms` });

/* ---------- Style tokens ---------- */

const RING_ON_DARK =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4af62]";
const RING_ON_LIGHT =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#183128]";

const BTN_BASE =
  "inline-flex min-h-[52px] items-center justify-center gap-3 px-7 text-center text-sm font-bold uppercase tracking-[0.1em] transition-colors duration-200 motion-reduce:transition-none";

const BTN = {
  gold: `${BTN_BASE} bg-[#c5a05a] text-[#151410] hover:bg-[#d9bd78] ${RING_ON_DARK}`,
  outline: `${BTN_BASE} border border-[#f5efe2]/70 text-[#f5efe2] hover:bg-[#f5efe2] hover:text-[#151410] ${RING_ON_DARK}`,
  forest: `${BTN_BASE} bg-[#183128] text-[#f5efe2] hover:bg-[#245040] ${RING_ON_LIGHT}`,
  outlineForest: `${BTN_BASE} border border-[#183128] text-[#183128] hover:bg-[#183128] hover:text-[#f5efe2] ${RING_ON_LIGHT}`,
};

const H2 =
  "dm-serif text-balance text-4xl leading-[1.1] tracking-[-0.01em] sm:text-5xl lg:text-[3.5rem]";
const LEAD = "text-pretty text-base leading-8 sm:text-lg sm:leading-[1.85]";

/* ---------- Hooks ---------- */

/* True once the element has scrolled into view (immediately if the visitor
   prefers reduced motion or the browser has no IntersectionObserver). */
function useInView(threshold = 0.35) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, inView];
}

/* ---------- Small pieces ---------- */

function Container({ children, className = "" }) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-10 ${className}`}>
      {children}
    </div>
  );
}

function Icon({ children, className = "" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 shrink-0 ${className}`}
    >
      {children}
    </svg>
  );
}

const ArrowIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M4 10h12M11 5l5 5-5 5" />
  </Icon>
);

const ArrowUpRightIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M6 14 14 6M7 6h7v7" />
  </Icon>
);

function PlayIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-7 w-7 translate-x-[2px]"
    >
      <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z" />
    </svg>
  );
}

/* Coachline: the double pinstripe painted along a classic car's flank */
function Coachline({ tone = "light" }) {
  const c = tone === "dark" ? "bg-[#c5a05a]" : "bg-[#96702a]";
  return (
    <span aria-hidden="true" className="flex w-12 shrink-0 flex-col gap-[3px] sm:w-16">
      <span className={`h-[2px] ${c}`} />
      <span className={`h-px ${c}`} />
    </span>
  );
}

function Eyebrow({ children, tone = "light", className = "" }) {
  const dark = tone === "dark";
  return (
    <div className={`mb-5 flex items-center gap-4 sm:mb-6 ${className}`}>
      <Coachline tone={tone} />
      <span
        className={`text-xs font-semibold uppercase tracking-[0.18em] sm:text-sm ${
          dark ? "text-[#d4af62]" : "text-[#80591a]"
        }`}
      >
        {children}
      </span>
    </div>
  );
}

function TextLink({ href, children }) {
  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.1em] text-[#183128] underline decoration-[#96702a]/60 decoration-2 underline-offset-8 transition-colors duration-200 hover:text-[#80591a] motion-reduce:transition-none ${RING_ON_LIGHT}`}
    >
      {children}
      <ArrowIcon className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
    </a>
  );
}

/* Odometer: each digit is a column of 0-9 that rolls to its value */
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function Odometer({ value, active }) {
  let n = 0;
  return (
    <p
      role="img"
      aria-label={value}
      className="dm-serif flex items-center justify-center text-[2rem] text-[#d4af62] sm:text-5xl lg:text-[2rem] xl:text-[2.6rem]"
    >
      {[...value].map((ch, i) => {
        if (!/\d/.test(ch)) {
          return (
            <span key={i} aria-hidden="true" className="mx-1.5">
              {ch}
            </span>
          );
        }
        const d = Number(ch);
        const idx = n++;
        return (
          <span
            key={i}
            aria-hidden="true"
            className="relative mx-px inline-block h-[1.3em] w-[0.72em] overflow-hidden rounded-[3px] bg-[#0b1712] shadow-inner ring-1 ring-[#c5a05a]/35"
          >
            <span
              className="block transition-transform duration-[1600ms] ease-[cubic-bezier(.22,.8,.2,1)] motion-reduce:transition-none"
              style={{
                transform: `translateY(-${active ? d * 10 : 0}%)`,
                transitionDelay: `${idx * 140}ms`,
              }}
            >
              {DIGITS.map((x) => (
                <span key={x} className="block h-[1.3em] text-center leading-[1.3em]">
                  {x}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </p>
  );
}

/* Video: thumbnail first, YouTube player loads on click */
function VideoCard({ video }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="overflow-hidden border border-[#c5a05a]/25 bg-[#1c1b17]">
      <div className="relative aspect-video bg-[#0c0b09]">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${video.title}`}
            className={`group absolute inset-0 ${RING_ON_DARK}`}
          >
            <img
              src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
            />
            <span aria-hidden="true" className="absolute inset-0 bg-[#151410]/30" />
            <span className="absolute left-1/2 top-1/2 flex h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#c5a05a] text-[#151410] shadow-lg transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none">
              <PlayIcon />
            </span>
          </button>
        )}
      </div>
      <div className="px-6 py-5">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#d4af62]">
          {video.label}
        </p>
        <h3 className="dm-serif mt-2 text-2xl text-[#f5efe2]">{video.heading}</h3>
      </div>
    </div>
  );
}

/* Collection card: photo first, year on a brass-style plate, text on a deep scrim */
function CarCard({ car, index }) {
  return (
    <article
      className={`group relative isolate aspect-[4/5] overflow-hidden bg-[#10241c] sm:aspect-[16/11] lg:aspect-[4/5] ${
        index === 1 ? "lg:mt-12" : ""
      }`}
    >
      <img
        src={car.image}
        alt={car.alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05] motion-reduce:transition-none"
      />

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-[#0b1712] via-[#0b1712]/85 to-transparent"
      />

      <p className="absolute left-5 top-5 border border-[#c5a05a]/70 bg-[#0b1712]/80 px-3 py-1.5 text-sm font-bold tracking-[0.16em] text-[#d4af62] backdrop-blur-sm">
        {car.year}
      </p>

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
        <h3 className="dm-serif text-3xl text-[#f8f3e8]">{car.name}</h3>
        <p className="mt-2 max-w-[34ch] text-base leading-7 text-[#e6e0d3]">{car.text}</p>
      </div>
    </article>
  );
}

/* ---------- Page ---------- */

function Home() {
  const [statsRef, statsInView] = useInView();

  return (
    <div className="dm-sans min-h-screen overflow-x-hidden bg-[#f5efe2] text-[#1c1b17] antialiased">
      <style>{CSS}</style>

      {/* =====================================================
          HERO
          ===================================================== */}
      <section
        aria-labelledby="hero-title"
        className="relative min-h-[calc(100svh-80px)] overflow-hidden bg-[#151410]"
      >
        <img
          src="/images/car-01.png"
          alt="Classic automobile collection"
          className="dm-hero-img absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Scrims keep text readable on any part of the photo */}
        <div aria-hidden="true" className="absolute inset-0 bg-[#151410]/30" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#151410]/95 via-[#151410]/55 to-[#151410]/10"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden bg-gradient-to-r from-[#151410]/75 via-[#151410]/15 to-transparent md:block"
        />

        <div className="relative z-10 flex min-h-[calc(100svh-80px)] items-end">
          <Container className="pb-14 pt-24 md:pb-20 lg:pb-24">
            <div className="max-w-4xl">
              <div className="dm-rise" style={rise(100)}>
                <Eyebrow tone="dark">Dauer Museum of Classic Cars</Eyebrow>
              </div>

              <h1
                id="hero-title"
                className="dm-serif text-[2.75rem] leading-[1.03] tracking-[-0.02em] text-[#f8f3e8] sm:text-6xl md:text-7xl lg:text-[5.5rem]"
              >
                <span className="dm-rise block" style={rise(200)}>A Journey</span>
                <span className="dm-rise block" style={rise(320)}>Through</span>
                <span className="dm-rise block italic text-[#d4af62]" style={rise(440)}>
                  Automotive
                </span>
                <span className="dm-rise block" style={rise(560)}>History</span>
              </h1>

              <p
                className="dm-rise mt-6 max-w-xl text-pretty text-lg leading-8 text-[#f5efe2] sm:mt-8 sm:text-xl sm:leading-9"
                style={rise(720)}
              >
                Step into a world of beautifully preserved automobiles,
                remarkable craftsmanship and stories from another era.
              </p>

              <div
                className="dm-rise mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4"
                style={rise(860)}
              >
                <a href="#collection" className={BTN.gold}>
                  Explore Collection
                  <ArrowIcon />
                </a>
                <a href="#visit" className={BTN.outline}>
                  Plan Your Visit
                  <ArrowUpRightIcon />
                </a>
              </div>
            </div>
          </Container>
        </div>

        <div aria-hidden="true" className="absolute bottom-10 right-5 hidden md:flex">
          <div className="flex flex-col items-center gap-3 text-[#d4af62]">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] [writing-mode:vertical-rl]">
              Scroll to explore
            </span>
            <div className="h-12 w-px bg-gradient-to-b from-[#d4af62] to-transparent" />
          </div>
        </div>
      </section>

      {/* =====================================================
          STATISTICS — odometer
          ===================================================== */}
      <section
        aria-labelledby="stats-title"
        className="border-b border-[#c5a05a]/25 bg-[#183128] text-[#f5efe2]"
      >
        <h2 id="stats-title" className="sr-only">
          The museum at a glance
        </h2>

        <div
          ref={statsRef}
          className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-[#c5a05a]/20 lg:grid-cols-3 lg:divide-x lg:divide-y-0"
        >
          {STATS.map((s) => (
            <div key={s.label} className="px-6 py-10 text-center sm:px-8 lg:py-14">
              <Odometer value={s.value} active={statsInView} />
              <h3 className="mt-5 text-sm font-bold uppercase tracking-[0.16em]">
                {s.label}
              </h3>
              <p className="mx-auto mt-3 max-w-xs text-base leading-7 text-[#d8d4c8] sm:text-[17px]">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          COLLECTION
          ===================================================== */}
      <section
        id="collection"
        aria-labelledby="collection-title"
        className="scroll-mt-20 bg-[#f5efe2] py-20 md:py-28"
      >
        <Container>
          <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow>The Collection</Eyebrow>
              <h2 id="collection-title" className={`${H2} text-[#183128]`}>
                <span className="block">Timeless</span>
                <span className="block italic text-[#96702a]">Automobiles</span>
              </h2>
            </div>

            <TextLink href="/Gallery">View the Gallery</TextLink>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            {CARS.map((car, i) => (
              <CarCard key={car.name} car={car} index={i} />
            ))}
          </div>
        </Container>
      </section>

      {/* =====================================================
          VIDEO EXPERIENCE
          ===================================================== */}
      <section
        aria-labelledby="video-title"
        className="bg-[#11100e] py-20 text-[#f5efe2] md:py-28"
      >
        <Container>
          <div className="mb-10 max-w-3xl md:mb-12">
            <Eyebrow tone="dark">The Dauer Experience</Eyebrow>
            <h2 id="video-title" className={`${H2} text-[#f5efe2]`}>
              See the collection{" "}
              <span className="italic text-[#d4af62]">in motion.</span>
            </h2>
            <p className={`${LEAD} mt-6 max-w-2xl text-[#d8d4c8]`}>
              Take a closer look at the automobiles, atmosphere and history
              preserved inside Dauer Classic Cars.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {VIDEOS.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </Container>
      </section>

      {/* =====================================================
          STORY
          ===================================================== */}
      <section
        aria-labelledby="story-title"
        className="border-t border-[#c5a05a]/25 bg-gradient-to-br from-[#183128] to-[#10241c] py-20 text-[#f5efe2] md:py-28"
      >
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-4 z-10 border border-[#c5a05a]/50 sm:inset-6"
            />
            <div className="relative aspect-square overflow-hidden sm:aspect-[1/0.98]">
              <img
                src="/images/car-05.jpg"
                alt="Classic Cadillac inside the Dauer museum"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-center"
              />
            </div>
          </div>

          <div>
            <Eyebrow tone="dark">The Dauer Story</Eyebrow>
            <h2 id="story-title" className={`${H2} text-[#f5efe2]`}>
              A passion that became{" "}
              <span className="italic text-[#d4af62]">a legacy.</span>
            </h2>
            <p className={`${LEAD} mt-7 max-w-[60ch] text-[#e2dacd] sm:text-xl`}>
              What began as Eddie and Joanne Dauer's love of antique cars grew
              into a remarkable collection and, eventually, a museum built to
              share that passion with generations of visitors.
            </p>
            <a href="/about" className={`${BTN.gold} mt-8`}>
              Discover Our Story
              <ArrowIcon />
            </a>
          </div>
        </Container>
      </section>

      {/* =====================================================
          EXPERIENCE
          ===================================================== */}
      <section
        aria-labelledby="experience-title"
        className="bg-[#f5efe2] py-20 md:py-28"
      >
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative lg:order-2">
            {/* offset frame behind the collage */}
            <span
              aria-hidden="true"
              className="absolute -bottom-3 -right-3 h-full w-full border border-[#96702a]/60 sm:-bottom-4 sm:-right-4"
            />
            <div className="relative grid grid-cols-5 gap-3 sm:gap-4">
              <div className="col-span-3 overflow-hidden">
                <img
                  src="/images/car-01.png"
                  alt="Classic car museum"
                  loading="lazy"
                  decoding="async"
                  className="h-full min-h-[360px] w-full object-cover sm:min-h-[520px]"
                />
              </div>
              <div className="col-span-2 grid grid-rows-2 gap-3 sm:gap-4">
                <div className="relative min-h-0 overflow-hidden">
                  <img
                    src="/images/car-04.jpg"
                    alt="Classic automobile detail"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="relative min-h-0 overflow-hidden">
                  <img
                    src="/images/car-03.jpg"
                    alt="Classic dashboard"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:order-1">
            <Eyebrow>The Experience</Eyebrow>
            <h2 id="experience-title" className={`${H2} text-[#183128]`}>
              More than <span className="italic text-[#96702a]">cars.</span>
            </h2>
            <p className={`${LEAD} mt-7 max-w-[60ch] text-[#4f524c]`}>
              Walk through a recreated world of classic automobiles, vintage
              technology, memorabilia and the atmosphere of another time.
            </p>
            <p className={`${LEAD} mt-5 max-w-[60ch] text-[#4f524c]`}>
              Every display is designed to make history feel tangible — not
              simply something behind glass.
            </p>
            <div className="mt-8">
              <TextLink href="/Gallery">Explore the Museum</TextLink>
            </div>
          </div>
        </Container>
      </section>

      {/* =====================================================
          VISIT — the details are set as a museum ticket
          ===================================================== */}
      <section
        id="visit"
        aria-labelledby="visit-title"
        className="scroll-mt-20 border-t border-[#c5a05a]/30 bg-[#10241c] py-20 text-[#f5efe2] md:py-28"
      >
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <Eyebrow tone="dark">Plan Your Visit</Eyebrow>
            <h2 id="visit-title" className={`${H2} text-[#f5efe2]`}>
              Come see history{" "}
              <span className="italic text-[#d4af62]">in person.</span>
            </h2>
            <p className={`${LEAD} mt-7 max-w-[60ch] text-[#d8d4c8]`}>
              Dauer Classic Cars welcomes visitors to experience automotive
              history, design and craftsmanship in person.
            </p>
          </div>

          {/* Ticket */}
          <div className="relative w-full max-w-xl bg-[#f5efe2] text-[#183128] shadow-[0_28px_60px_-24px_rgba(0,0,0,0.7)] lg:ml-auto">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-2 border border-[#96702a]/40"
            />

            <dl className="relative px-7 pt-9 sm:px-10">
              <div className="pb-7">
                <dt className="text-sm font-bold uppercase tracking-[0.16em] text-[#80591a]">
                  Location
                </dt>
                <dd className="mt-3">
                  <address className="dm-serif text-2xl not-italic leading-9">
                    <span className="uppercase tracking-[0.02em]">10801 NW 50th Street</span>
                    <br />
                    Sunrise, FL 33351
                  </address>
                </dd>
              </div>

              <div className="border-t border-[#183128]/15 py-7">
                <dt className="text-sm font-bold uppercase tracking-[0.16em] text-[#80591a]">
                  Opening Hours
                </dt>
                <dd className="dm-serif mt-3 text-2xl leading-9">
                  <span className="uppercase tracking-[0.02em]">Monday – Saturday</span>
                  <br />
                  9:00 AM – 3:00 PM
                </dd>
              </div>
            </dl>

            {/* Perforation with side notches (notch colour = section background) */}
            <div
              aria-hidden="true"
              className="relative border-t-2 border-dashed border-[#183128]/30"
            >
              <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[#10241c]" />
              <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-[#10241c]" />
            </div>

            <div className="relative flex flex-col gap-3 px-7 pb-9 pt-7 sm:flex-row sm:px-10">
              <a href="/Contact" className={BTN.forest}>
                Contact Us
              </a>
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noreferrer"
                className={BTN.outlineForest}
              >
                Directions
                <span className="sr-only"> (opens Google Maps in a new tab)</span>
              </a>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default Home;
