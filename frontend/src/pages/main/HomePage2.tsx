// Note this is AI generated

import React, { useMemo, useState } from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type NavItem = { label: string; href: string };
type Stat = { label: string; value: string };
type Feature = { title: string; desc: string; icon: React.ReactNode };
type Testimonial = { quote: string; name: string; role: string };

function Icon({
  name,
  className,
}: {
  name:
    | "shield"
    | "sparkles"
    | "users"
    | "calendar"
    | "chart"
    | "rocket"
    | "check";
  className?: string;
}) {
  const common = "h-5 w-5";
  switch (name) {
    case "sparkles":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cx(common, className)}>
          <path
            d="M12 2l1.2 4.2L17.4 7.4l-4.2 1.2L12 12l-1.2-3.4-4.2-1.2 4.2-1.2L12 2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M19 12l.8 2.8L22.6 16l-2.8.8L19 19.6l-.8-2.8-2.8-.8 2.8-.8L19 12Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "users":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cx(common, className)}>
          <path
            d="M16 11c1.9 0 3.5-1.6 3.5-3.5S17.9 4 16 4s-3.5 1.6-3.5 3.5S14.1 11 16 11Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M8 11c1.9 0 3.5-1.6 3.5-3.5S9.9 4 8 4 4.5 5.6 4.5 7.5 6.1 11 8 11Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M3.5 20c.6-3.1 3.1-5 6.5-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M20.5 20c-.6-3.1-3.1-5-6.5-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M10 15h4c2.8 0 5 2.2 5 5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "calendar":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cx(common, className)}>
          <path
            d="M7 3v3M17 3v3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M4 7h16"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M6 21h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M8 11h4M8 15h8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "chart":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cx(common, className)}>
          <path
            d="M4 19V5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M4 19h16"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M8 17v-6M12 17V8M16 17v-9"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "rocket":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cx(common, className)}>
          <path
            d="M14.5 4.5c3.2 0 5 1.8 5 5 0 6-7 12-12 12-3.2 0-5-1.8-5-5 0-5 6-12 12-12Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9 15l-3 3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M14 10h.01"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cx(common, className)}>
          <path
            d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 12l2.2 2.2L15.5 9.6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "check":
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cx(common, className)}>
          <path
            d="M20 6L9 17l-5-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-purple-200/60 bg-white/70 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur">
      <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
      {children}
    </span>
  );
}

function GradientDivider({ flip }: { flip?: boolean }) {
  // Soft band to avoid sharp transitions between sections
  return (
    <div
      className={cx(
        "pointer-events-none relative -mt-10 h-20 w-full",
        flip && "rotate-180"
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-50/70 to-white" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(124,58,237,0.18),transparent_55%)]" />
    </div>
  );
}

function SectionShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("relative", className)}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur",
        "transition hover:shadow-md hover:border-slate-200",
        className
      )}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const navItems: NavItem[] = useMemo(
    () => [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how" },
      { label: "Pricing", href: "#pricing" },
      { label: "Testimonials", href: "#testimonials" },
    ],
    []
  );

  const stats: Stat[] = useMemo(
    () => [
      { label: "Active students", value: "25k+" },
      { label: "Schools onboarded", value: "180+" },
      { label: "Avg. setup time", value: "2 days" },
      { label: "Uptime", value: "99.9%" },
    ],
    []
  );

  const features: Feature[] = useMemo(
    () => [
      {
        title: "One dashboard for everything",
        desc: "Courses, clubs, announcements, and student support in a single, calm interface.",
        icon: <Icon name="sparkles" className="text-purple-600" />,
      },
      {
        title: "Role-based access built-in",
        desc: "Students, teachers, and admins each get exactly what they need—nothing extra.",
        icon: <Icon name="shield" className="text-purple-600" />,
      },
      {
        title: "Clubs & events that just work",
        desc: "Create events, manage attendance, and keep everyone in the loop with reminders.",
        icon: <Icon name="calendar" className="text-purple-600" />,
      },
      {
        title: "Insights without the noise",
        desc: "Simple analytics to track engagement and identify what students care about most.",
        icon: <Icon name="chart" className="text-purple-600" />,
      },
      {
        title: "Fast onboarding",
        desc: "Invite users, import courses, and go live quickly—with sensible defaults.",
        icon: <Icon name="rocket" className="text-purple-600" />,
      },
      {
        title: "Student-first support",
        desc: "Built for clarity: fewer clicks, clean UI, and thoughtful UX for daily use.",
        icon: <Icon name="users" className="text-purple-600" />,
      },
    ],
    []
  );

  const testimonials: Testimonial[] = useMemo(
    () => [
      {
        quote:
          "SchoolSpace made our daily ops feel organized overnight. The UI is clean and students actually use it.",
        name: "Amina K.",
        role: "Academic Coordinator",
      },
      {
        quote:
          "Setup was painless. The roles and permissions were exactly what we needed—no custom work required.",
        name: "Jordan L.",
        role: "IT Administrator",
      },
      {
        quote:
          "Our clubs finally have a central place for events and updates. It’s simple and it works.",
        name: "Sofia M.",
        role: "Student Leader",
      },
    ],
    []
  );

  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const price = (m: number) => (billing === "monthly" ? m : Math.round(m * 10)); // 2 months free-ish
  const priceSuffix = billing === "monthly" ? "/mo" : "/yr";

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Background accents */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.18),transparent_60%)] blur-2xl" />
        <div className="absolute -top-12 right-[-120px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.10),transparent_60%)] blur-2xl" />
        <div className="absolute bottom-[-160px] left-[-140px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.10),transparent_60%)] blur-2xl" />
      </div>

      {/* Hero */}
      <main>
        <SectionShell className="pt-14 sm:pt-18">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Pill>Modern, calm, and built for real schools</Pill>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                The cleanest way to run your campus life in one place.
              </h1>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
                SchoolSpace helps students, teachers, and admins stay aligned—
                courses, clubs, events, announcements, and support in a simple,
                professional platform.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-purple-700"
                >
                  Start free
                  <span className="ml-2 opacity-90">→</span>
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                >
                  See features
                </a>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-2xl border border-slate-200/70 bg-white/70 p-3 shadow-sm">
                    <div className="text-sm font-semibold">{s.value}</div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right visual */}
            <Card className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold">Today</div>
                  <div className="mt-1 text-sm text-slate-600">
                    A quick snapshot of your campus
                  </div>
                </div>
                <span className="rounded-full border border-purple-200/70 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                  Live preview
                </span>
              </div>

              <div className="mt-6 grid gap-4">
                <div className="grid gap-3 rounded-2xl border border-slate-200/70 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Announcements</div>
                    <span className="text-xs text-slate-500">3 new</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      "Midterm schedule posted",
                      "Library hours updated",
                      "Club fair this Friday",
                    ].map((t) => (
                      <div
                        key={t}
                        className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-slate-50 px-3 py-2"
                      >
                        <span className="h-2 w-2 rounded-full bg-purple-500" />
                        <span className="text-sm text-slate-700">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 rounded-2xl border border-slate-200/70 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Upcoming events</div>
                    <span className="text-xs text-slate-500">This week</span>
                  </div>

                  <div className="grid gap-2">
                    {[
                      { name: "AI Study Jam", meta: "Wed • Room 2-14" },
                      { name: "Basketball Tryouts", meta: "Thu • Gym" },
                      { name: "Hack Night", meta: "Sat • Lab 3" },
                    ].map((e) => (
                      <div
                        key={e.name}
                        className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-white px-3 py-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-purple-700">
                            <Icon name="calendar" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{e.name}</div>
                            <div className="text-xs text-slate-500">{e.meta}</div>
                          </div>
                        </div>
                        <button className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </SectionShell>

        <GradientDivider />

        {/* Features */}
        <SectionShell id="features" className="py-14 sm:py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Designed for clarity
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                A light, professional UI that stays out of the way—so students and
                staff can focus on what matters.
              </p>
            </div>
            <a
              href="#how"
              className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              How it works <span className="opacity-70">→</span>
            </a>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="p-5">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-50">
                    {f.icon}
                  </div>
                  <div className="text-sm font-semibold">{f.title}</div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {f.desc}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-purple-700">
                  <Icon name="check" className="text-purple-700" />
                  Included
                </div>
              </Card>
            ))}
          </div>
        </SectionShell>

        <GradientDivider flip />

        {/* How it works */}
        <SectionShell id="how" className="py-14 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Launch in days, not months
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Start with a clean baseline and customize as you grow. SchoolSpace
                is built to stay simple while scaling smoothly.
              </p>

              <div className="mt-6 grid gap-3">
                {[
                  {
                    step: "01",
                    title: "Invite your team",
                    desc: "Create roles for admins, teachers, and student leaders.",
                  },
                  {
                    step: "02",
                    title: "Import courses & clubs",
                    desc: "Bring structure in quickly with sensible defaults.",
                  },
                  {
                    step: "03",
                    title: "Go live with confidence",
                    desc: "Announcements, events, and support are ready day one.",
                  },
                ].map((s) => (
                  <div
                    key={s.step}
                    className="flex gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                      {s.step}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{s.title}</div>
                      <div className="mt-1 text-sm text-slate-600">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Admin checklist</div>
                  <div className="mt-1 text-sm text-slate-600">
                    A realistic rollout plan
                  </div>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                  Week 1
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  "Set school profile + branding",
                  "Invite staff and assign roles",
                  "Create first announcements",
                  "Add clubs & upcoming events",
                  "Enable student support inbox",
                ].map((t) => (
                  <div
                    key={t}
                    className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white px-3 py-2"
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-purple-50 text-purple-700">
                      <Icon name="check" />
                    </div>
                    <div className="text-sm text-slate-700">{t}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </SectionShell>

        <GradientDivider />

        {/* Pricing */}
        <SectionShell id="pricing" className="py-14 sm:py-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Simple pricing
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                Clear tiers that work for schools of different sizes.
              </p>
            </div>

            <div className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={cx(
                  "rounded-xl px-3 py-2 text-sm font-semibold",
                  billing === "monthly"
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-50"
                )}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBilling("yearly")}
                className={cx(
                  "rounded-xl px-3 py-2 text-sm font-semibold",
                  billing === "yearly"
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-50"
                )}
              >
                Yearly
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {[
              {
                name: "Starter",
                price: price(29),
                desc: "For small programs getting organized.",
                points: ["Announcements", "Clubs & events", "Basic roles"],
                highlight: false,
              },
              {
                name: "School",
                price: price(79),
                desc: "Best for most schools.",
                points: [
                  "Everything in Starter",
                  "Support inbox",
                  "Advanced permissions",
                  "Analytics",
                ],
                highlight: true,
              },
              {
                name: "District",
                price: price(149),
                desc: "For multi-school operations.",
                points: [
                  "Everything in School",
                  "Multi-campus management",
                  "SSO options",
                  "Priority support",
                ],
                highlight: false,
              },
            ].map((p) => (
              <Card
                key={p.name}
                className={cx(
                  "p-6",
                  p.highlight && "border-purple-200/80 shadow-md"
                )}
              >
                {p.highlight && (
                  <div className="mb-3 inline-flex items-center rounded-full border border-purple-200/70 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                    Most popular
                  </div>
                )}
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="mt-2 flex items-end gap-2">
                  <div className="text-3xl font-semibold">${p.price}</div>
                  <div className="pb-1 text-sm text-slate-500">{priceSuffix}</div>
                </div>
                <p className="mt-2 text-sm text-slate-600">{p.desc}</p>

                <div className="mt-5 space-y-3">
                  {p.points.map((t) => (
                    <div key={t} className="flex items-start gap-3">
                      <div className="mt-0.5 grid h-6 w-6 place-items-center rounded-lg bg-purple-50 text-purple-700">
                        <Icon name="check" className="h-4 w-4" />
                      </div>
                      <div className="text-sm text-slate-700">{t}</div>
                    </div>
                  ))}
                </div>

                <a
                  href="#"
                  className={cx(
                    "mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm",
                    p.highlight
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  )}
                >
                  Choose {p.name}
                </a>
              </Card>
            ))}
          </div>
        </SectionShell>

        <GradientDivider flip />

        {/* Testimonials */}
        <SectionShell id="testimonials" className="py-14 sm:py-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            Trusted by real teams
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            Calm UI, clear workflows, and features that fit how schools actually operate.
          </p>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="p-6">
                <p className="text-sm leading-relaxed text-slate-700">
                  “{t.quote}”
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600" />
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-10 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-lg font-semibold">
                  Ready to simplify your campus?
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Start free and invite your team in minutes.
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href="#"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                >
                  Create account
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                >
                  Explore features
                </a>
              </div>
            </div>
          </Card>
        </SectionShell>
      </main>
    </div>
  );
}
