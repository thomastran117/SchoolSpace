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
      { threshold: 0.12 },
    );
    revealEls.forEach((el) => io.observe(el));

    const statEls = document.querySelectorAll("[data-count-to]");
    const ioStats = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          if (el.dataset.counted === "1") return;
          el.dataset.counted = "1";
          countUp(el, el.getAttribute("data-count-to"), 900);
          ioStats.unobserve(el);
        });
      },
      { threshold: 0.6 },
    );
    statEls.forEach((el) => ioStats.observe(el));

    const hero = heroRef.current;
    const onMove = (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      hero.style.setProperty("--tiltX", y * -6 + "deg");
      hero.style.setProperty("--tiltY", x * 6 + "deg");
    };
    hero?.addEventListener("pointermove", onMove);
    return () => hero?.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <main className="bg-gradient-to-br from-white via-emerald-50 to-white text-gray-800">
      <style>{`
        .reveal { opacity:0; transform:translateY(12px); transition:opacity .6s, transform .6s; }
        .animate-in { opacity:1; transform:none; }
        .parallax { transform:perspective(1200px) rotateX(var(--tiltX,0)) rotateY(var(--tiltY,0)); transition:transform .1s ease-out; }
      `}</style>

      <section className="relative overflow-hidden px-6 py-24 md:py-32">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="px-3 py-1 text-sm bg-emerald-100 text-emerald-700 rounded-full font-semibold reveal">
              🌿 New Release
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight reveal">
              Build faster with a crisp, modern UI
            </h1>
            <p className="text-gray-600 text-lg reveal">
              A clean UnoCSS starter home page with animations, responsive
              layout, and minimal dependencies.
            </p>
            <div className="flex flex-wrap gap-3 reveal">
              <NavLink
                to="/get-started"
                className="px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
              >
                Get Started
              </NavLink>
              <NavLink
                to="/features"
                className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Explore Features
              </NavLink>
            </div>
            <div className="flex gap-4 mt-4 text-sm text-gray-500 reveal">
              <div>✅ No setup hassle</div>
              <div>✅ Responsive by default</div>
            </div>
          </div>

          <div ref={heroRef} className="reveal parallax">
            <div className="rounded-3xl bg-white shadow-md p-10 text-center border border-emerald-100">
              <div className="text-2xl font-semibold mb-2">
                Your App Preview
              </div>
              <p className="text-gray-500">
                Replace this with a screenshot or live component demo.
              </p>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(800px_400px_at_10%_-10%,rgba(16,185,129,.12),transparent_70%),radial-gradient(700px_400px_at_90%_10%,rgba(59,130,246,.1),transparent_70%)]"></div>
      </section>

      <section className="py-12 border-t border-gray-200 text-gray-500 text-center">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-5 gap-6">
          {["Acme", "Globe", "Zephyr", "Quanta", "Nimbus"].map((n, i) => (
            <div
              key={n}
              className="font-semibold opacity-70 hover:opacity-100 transition reveal"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              {n}
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto text-center mb-12 reveal">
          <h2 className="text-3xl font-bold">Everything you need to ship</h2>
          <p className="text-gray-600 mt-2">
            Simple building blocks you can rearrange as your product grows.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {FEATURES.map((f, idx) => (
            <div
              key={idx}
              className="reveal bg-white rounded-2xl shadow-sm hover:shadow-lg p-6 transition"
              style={{ transitionDelay: `${idx * 80}ms` }}
            >
              <div
                className="w-12 h-12 flex items-center justify-center rounded-lg mb-4"
                style={{ background: f.bg }}
              >
                {f.icon}
              </div>
              <h5 className="text-lg font-semibold mb-2">{f.title}</h5>
              <p className="text-gray-600 mb-3">{f.desc}</p>
              <NavLink
                to={f.to}
                className="text-emerald-600 font-medium hover:underline"
              >
                Learn more →
              </NavLink>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-white border-t border-b border-gray-200">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {STATS.map((s, i) => (
            <div
              key={i}
              className="bg-emerald-50 rounded-2xl p-8 reveal"
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <div
                className="text-4xl font-bold text-emerald-600 mb-1"
                data-count-to={s.value}
              >
                {s.value}
              </div>
              <div className="text-gray-500 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 text-center bg-gradient-to-br from-emerald-600 to-green-700 text-white px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">Ready to launch?</h2>
          <p className="text-white/90 mb-8">
            Start with the basics and iterate quickly. You can always customize
            later.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <NavLink
              to="/get-started"
              className="px-6 py-3 bg-white text-emerald-600 font-semibold rounded-full shadow-md hover:bg-emerald-50 transition"
            >
              Get Started
            </NavLink>
            <NavLink
              to="/pricing"
              className="px-6 py-3 border border-white text-white rounded-full hover:bg-white/10 transition"
            >
              See Pricing
            </NavLink>
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
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
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
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
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
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 17l5-5-5-5v10z" />
      </svg>
    ),
  },
];

const STATS = [
  { value: "4.9", label: "Average rating (/5)" },
  { value: "2000", label: "Developers using it" },
  { value: "30", label: "Extra KB of JS/CSS" },
  { value: "24", label: "Support hours/day" },
];

function countUp(el, targetVal, durationMs) {
  const isNum = /^-?\\d+(?:\\.\\d+)?$/.test(targetVal);
  if (!isNum) return (el.textContent = targetVal);
  const target = parseFloat(targetVal);
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / durationMs);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = (target * eased).toFixed(0);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
