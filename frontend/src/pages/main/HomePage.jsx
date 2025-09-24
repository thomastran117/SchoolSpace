import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";

export default function HomePage() {
  const heroRef = useRef(null);
  const testiTrackRef = useRef(null);
  const testiSectionRef = useRef(null);

  useEffect(() => {
    const revealEls = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("animate-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" },
    );
    revealEls.forEach((el) => io.observe(el));

    const statEls = document.querySelectorAll("[data-count-to]");
    const ioStats = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          const target = el.getAttribute("data-count-to");
          if (el.dataset.counted === "1") return;
          el.dataset.counted = "1";
          countUp(el, target, 900);
          ioStats.unobserve(el);
        });
      },
      { threshold: 0.6 },
    );
    statEls.forEach((el) => ioStats.observe(el));

    const cleanups = [];
    document.querySelectorAll(".btn-animate, .btn").forEach((btn) => {
      const handler = (e) => {
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement("span");
        const size = Math.max(rect.width, rect.height);
        ripple.className = "ripple";
        ripple.style.width = ripple.style.height = size + "px";
        ripple.style.left = e.clientX - rect.left - size / 2 + "px";
        ripple.style.top = e.clientY - rect.top - size / 2 + "px";
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 550);
      };
      btn.addEventListener("click", handler);
      cleanups.push(() => btn.removeEventListener("click", handler));
    });

    const hero = heroRef.current;
    const onMove = (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      hero.style.setProperty("--tiltX", (y * -6).toFixed(2) + "deg");
      hero.style.setProperty("--tiltY", (x * 6).toFixed(2) + "deg");
    };
    if (hero) hero.addEventListener("pointermove", onMove);

    let slide = 0;
    const track = testiTrackRef.current;
    const section = testiSectionRef.current;
    const cards = track ? Array.from(track.children) : [];
    const total = cards.length;
    const setSlide = (i) => {
      slide = (i + total) % total;
      if (track) track.style.setProperty("--slide", slide);
      const dots = section?.querySelectorAll(".testi-dot");
      dots?.forEach((d, idx) => d.classList.toggle("active", idx === slide));
    };
    let timerId = null;
    const start = () => {
      if (!timerId) timerId = setInterval(() => setSlide(slide + 1), 3500);
    };
    const stop = () => {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    };
    if (track) {
      setSlide(0);
      start();
      section?.addEventListener("mouseenter", stop);
      section?.addEventListener("mouseleave", start);
      section
        ?.querySelector(".testi-prev")
        ?.addEventListener("click", () => setSlide(slide - 1));
      section
        ?.querySelector(".testi-next")
        ?.addEventListener("click", () => setSlide(slide + 1));
      section?.querySelectorAll(".testi-dot").forEach((dot, idx) => {
        dot.addEventListener("click", () => setSlide(idx));
      });
    }

    return () => {
      io.disconnect();
      ioStats.disconnect();
      cleanups.forEach((fn) => fn());
      if (hero) hero.removeEventListener("pointermove", onMove);
      stop();
      if (section) {
        section.removeEventListener("mouseenter", stop);
        section.removeEventListener("mouseleave", start);
      }
    };
  }, []);

  return (
    <main className="bg-light">
      <style>{`
        :root { --brand: #16a34a; --brand-soft: rgba(22,163,74,.12); }
        /* reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .reveal, .animate-in, .lift, .btn-animate, .glow, .parallax { transition: none !important; animation: none !important; }
        }
        /* Reveal on scroll */
        .reveal { opacity: 0; transform: translateY(14px); transition: opacity .6s ease, transform .6s ease; }
        .reveal.animate-in { opacity: 1; transform: translateY(0); }
        /* Lift + glow */
        .lift { transition: transform .25s ease, box-shadow .25s ease; will-change: transform; }
        .lift:hover { transform: translateY(-6px); box-shadow: 0 16px 32px rgba(0,0,0,.08); }
        .glow:hover { box-shadow: 0 0 0 1px var(--brand-soft), 0 12px 24px rgba(22,163,74,.12); }
        /* Buttons micro-interactions + ripple */
        .btn-animate { transition: transform .15s ease, box-shadow .2s ease; position: relative; overflow: hidden; }
        .btn-animate:hover { transform: translateY(-2px); box-shadow: 0 10px 18px rgba(0,0,0,.08); }
        .btn-animate:active { transform: translateY(0); box-shadow: 0 6px 12px rgba(0,0,0,.06); }
        .ripple { position: absolute; border-radius: 50%; transform: scale(0); background: rgba(255,255,255,.45); animation: ripple .55s ease-out; pointer-events: none; }
        @keyframes ripple { to { transform: scale(2.6); opacity: 0; } }
        /* Parallax card tilt */
        .parallax { transform: perspective(1200px) rotateX(var(--tiltX, 0deg)) rotateY(var(--tiltY, 0deg)); transition: transform .12s ease-out; }
        .parallax:hover { transition: transform .06s ease-out; }
        /* Accent underline for links */
        .link-accent { position: relative; text-decoration: none; }
        .link-accent::after { content: ""; position: absolute; left: 0; bottom: -2px; width: 100%; height: 2px; background: var(--brand); transform: scaleX(0); transform-origin: left; transition: transform .25s ease; }
        .link-accent:hover::after { transform: scaleX(1); }
        /* Testimonials slider */
        .testi { --slide: 0; }
        .testi-track { display: flex; gap: 1rem; transition: transform .6s ease; will-change: transform; }
        .testi-window { overflow: hidden; }
        .testi-card { min-width: 100%; }
        @media (min-width: 768px) { .testi-card { min-width: 50%; } }
        @media (min-width: 1200px) { .testi-card { min-width: 33.3333%; } }
        .testi-track { transform: translateX(calc(var(--slide) * -100%)); }
        .testi-quote { position: relative; }
        .testi-quote::before { content: "\u201C"; position: absolute; left: .25rem; top: -.5rem; font-size: 3rem; color: var(--brand); opacity: .15; }
        .testi-dot { width: 8px; height: 8px; border-radius: 999px; background: #cbd5e1; border: 0; padding: 0; }
        .testi-dot.active { background: var(--brand); }
        .testi-ctrl { transition: transform .15s ease; }
        .testi-ctrl:hover { transform: translateY(-2px); }
      `}</style>

      <section className="position-relative overflow-hidden">
        <div className="container py-5 py-lg-6">
          <div className="row align-items-center g-4 g-lg-5">
            <div className="col-lg-6">
              <span className="badge text-bg-success rounded-pill mb-3 reveal">
                New
              </span>
              <h1 className="display-5 fw-bold lh-sm mb-3 reveal">
                Build faster with a crisp, modern UI
              </h1>
              <p className="lead text-secondary mb-4 reveal">
                A starter home page styled with Bootstrap 5. Clean layout,
                accessible components, and ready for your brand.
              </p>
              <div className="d-flex gap-2 reveal">
                <NavLink
                  to="/get-started"
                  className="btn btn-success btn-lg px-4 rounded-pill btn-animate"
                >
                  Get Started
                </NavLink>
                <NavLink
                  to="/features"
                  className="btn btn-outline-secondary btn-lg px-4 rounded-pill btn-animate"
                >
                  Explore Features
                </NavLink>
              </div>
              <div className="d-flex align-items-center gap-3 mt-4 text-secondary reveal">
                <div className="d-flex align-items-center gap-2">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                  </svg>
                  No setup hassle
                </div>
                <div className="d-flex align-items-center gap-2">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                  </svg>
                  Responsive by default
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div
                ref={heroRef}
                className="ratio ratio-16x9 rounded-4 shadow-sm bg-white border position-relative parallax reveal"
              >
                <div className="d-flex flex-column align-items-center justify-content-center h-100 w-100 p-4">
                  <div className="text-center">
                    <div className="display-6 fw-semibold">
                      Your App Preview
                    </div>
                    <p className="text-secondary mt-2 mb-0">
                      Swap this for a screenshot or product mockup.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            pointerEvents: "none",
            background:
              "radial-gradient(1200px 600px at 10% -10%, rgba(16,185,129,.15), transparent 60%), radial-gradient(900px 500px at 90% 10%, rgba(59,130,246,.12), transparent 60%)",
          }}
        />
      </section>

      <section className="py-4 border-top border-bottom bg-white">
        <div className="container text-center">
          <div className="row row-cols-2 row-cols-md-5 g-3 align-items-center justify-content-center text-secondary opacity-75">
            {["Acme", "Globe", "Zephyr", "Quanta", "Nimbus"].map((n, i) => (
              <div
                className="col fw-semibold reveal"
                style={{ transitionDelay: `${i * 60}ms` }}
                key={n}
              >
                {n}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="text-center mb-4 reveal">
            <h2 className="fw-bold">Everything you need to ship</h2>
            <p className="text-secondary mb-0">
              Simple building blocks you can rearrange as your product grows.
            </p>
          </div>

          <div className="row g-4 g-lg-4">
            {FEATURES.map((f, idx) => (
              <div
                className="col-md-6 col-lg-4 reveal"
                style={{ transitionDelay: `${idx * 80}ms` }}
                key={f.title}
              >
                <div className="card h-100 shadow-sm border-0 rounded-4 lift glow">
                  <div className="card-body p-4">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
                      style={{ width: 48, height: 48, background: f.bg }}
                    >
                      {f.icon}
                    </div>
                    <h5 className="fw-semibold mb-2">{f.title}</h5>
                    <p className="text-secondary mb-3">{f.desc}</p>
                    <NavLink className="stretched-link link-accent" to={f.to}>
                      Learn more
                    </NavLink>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5 bg-white border-top border-bottom">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-6 reveal">
              <h3 className="fw-bold mb-3">
                Delightful by design, practical in production
              </h3>
              <p className="text-secondary mb-4">
                Built on Bootstrap 5 utilities and components, so you can theme
                it quickly and keep shipping. Copy the sections you like and
                remove the rest.
              </p>
              <ul className="list-unstyled text-secondary d-grid gap-2">
                {[
                  "Accessible color contrast & focus states",
                  "No heavy dependencies — just Bootstrap",
                  "Works great with React Router",
                ].map((item) => (
                  <li key={item} className="d-flex align-items-start gap-2">
                    <span className="mt-1" aria-hidden="true">
                      ✅
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-lg-6">
              <div className="row g-3">
                {STATS.map((s, i) => (
                  <div
                    className="col-6 reveal"
                    style={{ transitionDelay: `${i * 90}ms` }}
                    key={s.label}
                  >
                    <div className="p-4 bg-light rounded-4 h-100 border text-center lift">
                      <div className="h2 fw-bold mb-1">
                        <span data-count-to={s.value}>
                          {/* fallback for no JS */}
                          {s.value}
                        </span>
                      </div>
                      <div className="text-secondary small">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-white border-top border-bottom">
        <div className="container testi" ref={testiSectionRef}>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h2 className="fw-bold mb-1">What people say</h2>
              <p className="text-secondary mb-0">
                Trusted by teams and indie devs alike
              </p>
            </div>
            <div className="d-none d-md-flex gap-2">
              <button
                className="btn btn-outline-secondary btn-sm rounded-pill testi-prev testi-ctrl"
                aria-label="Previous testimonial"
              >
                ‹
              </button>
              <button
                className="btn btn-outline-secondary btn-sm rounded-pill testi-next testi-ctrl"
                aria-label="Next testimonial"
              >
                ›
              </button>
            </div>
          </div>

          <div className="testi-window">
            <div className="testi-track" ref={testiTrackRef}>
              {TESTIMONIALS.map((t, i) => (
                <div className="testi-card" key={i}>
                  <div
                    className="card h-100 shadow-sm border-0 rounded-4 lift glow reveal"
                    style={{ transitionDelay: `${i * 70}ms` }}
                  >
                    <div className="card-body p-4 d-flex flex-column">
                      <p className="mb-3 testi-quote">{t.quote}</p>
                      <div className="d-flex align-items-center gap-3 mt-auto">
                        <img
                          src={t.avatar}
                          alt=""
                          width="44"
                          height="44"
                          className="rounded-circle border"
                        />
                        <div>
                          <div className="fw-semibold">{t.name}</div>
                          <div className="text-secondary small">{t.role}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="d-flex justify-content-center gap-2 mt-3">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                className="testi-dot"
                aria-label={`Go to slide ${i + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="p-4 p-lg-5 rounded-4 bg-success text-white d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3 reveal">
            <div>
              <h4 className="fw-bold mb-1">Ready to launch?</h4>
              <p className="mb-0 opacity-90">
                Start with the basics and iterate quickly. You can always
                customize later.
              </p>
            </div>
            <div className="d-flex gap-2">
              <NavLink
                to="/get-started"
                className="btn btn-light rounded-pill px-4 fw-semibold btn-animate"
              >
                Get Started
              </NavLink>
              <NavLink
                to="/pricing"
                className="btn btn-outline-light rounded-pill px-4 btn-animate"
              >
                See Pricing
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-white border-top">
        <div className="container">
          <div className="text-center mb-4 reveal">
            <h2 className="fw-bold">Frequently asked questions</h2>
            <p className="text-secondary">
              Quick answers to common setup questions.
            </p>
          </div>
          <div className="row g-4">
            <div className="col-lg-8 mx-auto">
              <div className="accordion" id="faq">
                {FAQS.map((q, idx) => (
                  <div
                    className="accordion-item rounded-4 overflow-hidden mb-3 border reveal"
                    style={{ transitionDelay: `${idx * 70}ms` }}
                    key={q.q}
                  >
                    <h2 className="accordion-header" id={`h-${idx}`}>
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#c-${idx}`}
                        aria-expanded="false"
                        aria-controls={`c-${idx}`}
                      >
                        {q.q}
                      </button>
                    </h2>
                    <div
                      id={`c-${idx}`}
                      className="accordion-collapse collapse"
                      aria-labelledby={`h-${idx}`}
                      data-bs-parent="#faq"
                    >
                      <div className="accordion-body text-secondary">{q.a}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const FEATURES = [
  {
    title: "Responsive Layouts",
    desc: "Grid and utility classes keep your UI tidy on any screen.",
    to: "/features#responsive",
    bg: "rgba(16,185,129,.12)",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M3 5h18v6H3V5zm0 8h10v6H3v-6zm12 0h6v6h-6v-6z" />
      </svg>
    ),
  },
  {
    title: "Accessible by Default",
    desc: "Good color contrast, clear focus states, and semantic HTML.",
    to: "/features#accessibility",
    bg: "rgba(59,130,246,.12)",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-7 7h14v2H5v8H3V9zm16 0v10h-2V9h2z" />
      </svg>
    ),
  },
  {
    title: "Router Friendly",
    desc: "Snappy navigation with <NavLink> and active styles.",
    to: "/features#router",
    bg: "rgba(234,179,8,.15)",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M10 17l5-5-5-5v10z" />
      </svg>
    ),
  },
  {
    title: "Cards & Sections",
    desc: "Copy-paste sections to compose your own landing quickly.",
    to: "/features#cards",
    bg: "rgba(99,102,241,.12)",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M3 7h18v2H3V7zm0 4h10v6H3v-6zm12 0h6v6h-6v-6z" />
      </svg>
    ),
  },
  {
    title: "Utilities First",
    desc: "Use Bootstrap utilities for spacing, color, and layout.",
    to: "/features#utilities",
    bg: "rgba(236,72,153,.12)",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" />
      </svg>
    ),
  },
  {
    title: "Lightweight",
    desc: "Keep bundle size small; stick to Bootstrap core.",
    to: "/features#lightweight",
    bg: "rgba(45,212,191,.15)",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zm0 7l10 5-10 5-10-5 10-5z" />
      </svg>
    ),
  },
];

const STATS = [
  { value: "4.9", label: "Average rating (/5)" },
  { value: "2000", label: "Developers using it" },
  { value: "30", label: "Extra KB of CSS/JS" },
  { value: "24", label: "Support hours/day" },
];

const TESTIMONIALS = [
  {
    quote: "This platform has completely transformed our delivery speed.",
    name: "Alex Rivera",
    role: "Staff Engineer, Acme",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=Alex",
  },
  {
    quote: "Secure, fast, and reliable — everything our team needs.",
    name: "Priya Shah",
    role: "Tech Lead, Nimbus",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=Priya",
  },
  {
    quote: "From mockup to production in days, not weeks.",
    name: "Daniel Kim",
    role: "Founder, Zephyr Labs",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=Daniel",
  },
  {
    quote: "Clean components and great docs. 10/10.",
    name: "Sofia Ramos",
    role: "Frontend Dev, Quanta",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=Sofia",
  },
];

const FAQS = [
  {
    q: "Does it require TypeScript?",
    a: "No. This example is plain JavaScript with React and Bootstrap 5.",
  },
  {
    q: "How do I change colors?",
    a: "Use Bootstrap utility classes (e.g., text-success, bg-light) or your own CSS variables/themes.",
  },
  {
    q: "Can I use it with React Router?",
    a: "Yes—links are <NavLink> components and work inside a <BrowserRouter>.",
  },
];

function countUp(el, targetVal, durationMs) {
  const isNumeric = /^-?\d+(?:\.\d+)?$/.test(targetVal);
  if (!isNumeric) {
    el.textContent = targetVal;
    return;
  }
  const target = parseFloat(targetVal);
  const decimals = (targetVal.split(".")[1] || "").length;
  const start = performance.now();
  const from = 0;
  const step = (now) => {
    const t = Math.min(1, (now - start) / durationMs);
    const eased = 1 - Math.pow(1 - t, 3);
    const val = (from + (target - from) * eased).toFixed(decimals);
    el.textContent = decimals ? val : Math.round(val);
    if (t < 1) requestAnimationFrame(step);
    else if (targetVal === "4.9") el.textContent = "4.9/5";
  };
  requestAnimationFrame(step);
}
