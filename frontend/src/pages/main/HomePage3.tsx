// Note this is AI generated

import React, { useMemo, useState } from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type NavItem = { label: string; href: string };
type Metric = { label: string; value: string; hint?: string };
type Feature = { title: string; desc: string; badge?: string };
type Step = { title: string; desc: string };

function MiniIcon({
  name,
  className,
}: {
  name: "bolt" | "shield" | "spark" | "book" | "chat" | "chart";
  className?: string;
}) {
  const common = "h-4 w-4";
  switch (name) {
    case "bolt":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cx(common, className)}>
          <path
            d="M13 2L4 14h7l-1 8 9-12h-7l1-8Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
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
            d="M9 12l2 2 4-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "spark":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cx(common, className)}>
          <path
            d="M12 2l1.4 4.8L18 8.2l-4.6 1.4L12 14l-1.4-4.4L6 8.2l4.6-1.4L12 2Z"
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
    case "book":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cx(common, className)}>
          <path
            d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M18 19H6a2 2 0 0 0-2 2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cx(common, className)}>
          <path
            d="M21 14a4 4 0 0 1-4 4H8l-5 4V6a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M8 9h8M8 13h5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "chart":
    default:
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
  }
}

function Shell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)}
    >
      {children}
    </div>
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
        "rounded-2xl border border-slate-200/70 bg-white/85 shadow-sm backdrop-blur",
        "transition hover:shadow-md",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SoftBand({ tone = "teal" }: { tone?: "teal" | "emerald" }) {
  return (
    <div
      className="pointer-events-none relative h-24 w-full"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white" />
      <div
        className={cx(
          "absolute inset-0 opacity-70",
          tone === "teal"
            ? "bg-[radial-gradient(circle_at_50%_120%,rgba(13,148,136,0.20),transparent_58%)]"
            : "bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.18),transparent_58%)]",
        )}
      />
      <div className="absolute left-0 right-0 top-0 mx-auto h-px w-[92%] bg-gradient-to-r from-transparent via-slate-200/70 to-transparent" />
    </div>
  );
}

export default function HomeAlt() {
  const nav: NavItem[] = useMemo(
    () => [
      { label: "Tour", href: "#tour" },
      { label: "Benefits", href: "#benefits" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
    [],
  );

  const metrics: Metric[] = useMemo(
    () => [
      { label: "Time saved / week", value: "6.5h", hint: "Admin avg." },
      { label: "Student engagement", value: "+28%", hint: "3 months" },
      { label: "Setup time", value: "48h", hint: "Typical" },
      { label: "Reliability", value: "99.9%", hint: "Uptime" },
    ],
    [],
  );

  const steps: Step[] = useMemo(
    () => [
      {
        title: "Connect your school",
        desc: "Add your profile, branding, and initial roles in minutes.",
      },
      {
        title: "Organize the basics",
        desc: "Courses, clubs, events, and announcements ship with sensible defaults.",
      },
      {
        title: "Operate smoothly",
        desc: "Daily workflows are clean: fewer clicks, clearer ownership, better follow-through.",
      },
    ],
    [],
  );

  const features: Feature[] = useMemo(
    () => [
      {
        badge: "Clarity",
        title: "A calm dashboard for everyone",
        desc: "Students see what’s relevant. Staff gets structure without complexity.",
      },
      {
        badge: "Control",
        title: "Permissions you won’t fight",
        desc: "Role-based access designed for real school needs—admins, teachers, leaders.",
      },
      {
        badge: "Communication",
        title: "Announcements that get read",
        desc: "Pin important posts, track delivery, and reduce “I didn’t see it” noise.",
      },
      {
        badge: "Engagement",
        title: "Clubs & events in one place",
        desc: "Create events, manage attendance, and keep students engaged with reminders.",
      },
      {
        badge: "Support",
        title: "Student support inbox",
        desc: "Route questions to the right staff member and track follow-ups.",
      },
      {
        badge: "Insights",
        title: "Simple, useful analytics",
        desc: "Understand what students use most and improve the experience continuously.",
      },
    ],
    [],
  );

  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const price = (m: number) => (billing === "monthly" ? m : Math.round(m * 10));
  const suffix = billing === "monthly" ? "/mo" : "/yr";

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Background wash */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.22),transparent_60%)] blur-2xl" />
        <div className="absolute top-24 right-[-160px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.14),transparent_60%)] blur-2xl" />
        <div className="absolute bottom-[-180px] left-[-160px] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(2,132,199,0.12),transparent_60%)] blur-2xl" />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur">
        <Shell className="flex items-center justify-between py-3">
          <a href="#" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-sm">
              <span className="text-sm font-semibold">SS</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">SchoolSpace</div>
              <div className="text-[11px] text-slate-500">
                Calm campus operations
              </div>
            </div>
          </a>

          <nav className="hidden items-center gap-6 md:flex">
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="#"
              className="hidden rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 md:inline-flex"
            >
              Sign in
            </a>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Get started
            </a>
          </div>
        </Shell>
      </header>

      {/* HERO (different layout: left message + right stack) */}
      <main>
        <Shell className="pt-12 sm:pt-16">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            {/* Left copy */}
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/70 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                Light, modern, and built for daily use
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                A calmer campus platform—designed for clarity.
              </h1>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
                SchoolSpace organizes announcements, courses, clubs, events, and
                support into a clean workflow that students and staff actually
                enjoy using.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
                >
                  Start free
                  <span className="ml-2 opacity-90">→</span>
                </a>
                <a
                  href="#tour"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                >
                  Take a tour
                </a>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                {metrics.slice(0, 2).map((m) => (
                  <div
                    key={m.label}
                    className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm"
                  >
                    <div className="text-lg font-semibold">{m.value}</div>
                    <div className="mt-1 text-xs text-slate-500">{m.label}</div>
                    {m.hint && (
                      <div className="mt-1 text-xs text-slate-400">
                        {m.hint}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Logo strip */}
              <div className="mt-10">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Trusted by teams at
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    "Northview HS",
                    "Cedar Ridge",
                    "Ottawa West",
                    "Maple District",
                  ].map((x) => (
                    <div
                      key={x}
                      className="rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm"
                    >
                      {x}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right stack cards */}
            <div className="lg:col-span-6">
              <div className="grid gap-4">
                <Card className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Daily overview</div>
                    <span className="rounded-full border border-teal-200/70 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                      Live
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        label: "Announcements",
                        value: "3 new",
                        icon: "spark" as const,
                      },
                      {
                        label: "Support inbox",
                        value: "5 open",
                        icon: "chat" as const,
                      },
                      {
                        label: "Events",
                        value: "2 upcoming",
                        icon: "bolt" as const,
                      },
                      {
                        label: "Engagement",
                        value: "+12%",
                        icon: "chart" as const,
                      },
                    ].map((k) => (
                      <div
                        key={k.label}
                        className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-3"
                      >
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
                          <MiniIcon name={k.icon} className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs text-slate-500">
                            {k.label}
                          </div>
                          <div className="truncate text-sm font-semibold">
                            {k.value}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                        <MiniIcon name="book" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">Courses</div>
                        <div className="text-xs text-slate-500">
                          What matters today
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {[
                        { name: "COMP 2406", meta: "Assignment due Fri" },
                        { name: "CSI 4106", meta: "Quiz tomorrow" },
                        { name: "MAT 2377", meta: "Tutorial today" },
                      ].map((c) => (
                        <div
                          key={c.name}
                          className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-2"
                        >
                          <div>
                            <div className="text-sm font-semibold">
                              {c.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {c.meta}
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-teal-700">
                            View
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
                        <MiniIcon name="shield" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">
                          Roles & access
                        </div>
                        <div className="text-xs text-slate-500">
                          Simple permission model
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {[
                        "Admin: manage school settings",
                        "Teacher: courses & announcements",
                        "Student: clubs, events, support",
                      ].map((t) => (
                        <div
                          key={t}
                          className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white px-3 py-2"
                        >
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          <div className="text-sm text-slate-700">{t}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </Shell>

        <SoftBand tone="teal" />

        {/* TOUR (side-by-side) */}
        <section id="tour" className="py-14 sm:py-16">
          <Shell>
            <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-5">
                <h2 className="text-2xl font-semibold tracking-tight">
                  A quick product tour
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Built around real daily workflows: communicate clearly, keep
                  students engaged, and make follow-ups easy.
                </p>

                <div className="mt-6 space-y-3">
                  {steps.map((s, idx) => (
                    <div
                      key={s.title}
                      className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{s.title}</div>
                          <div className="mt-1 text-sm text-slate-600">
                            {s.desc}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex gap-2">
                  <a
                    href="#pricing"
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                  >
                    See pricing
                  </a>
                  <a
                    href="#benefits"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                  >
                    Benefits
                  </a>
                </div>
              </div>

              <div className="lg:col-span-7">
                <Card className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">Campus feed</div>
                      <div className="mt-1 text-sm text-slate-600">
                        Announcements, events, and support—together.
                      </div>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                      Preview
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {[
                      {
                        type: "Announcement",
                        title: "Midterm schedule posted",
                        meta: "Admin • 2h ago",
                        tone: "teal",
                      },
                      {
                        type: "Event",
                        title: "Club Fair — Friday 1–4pm",
                        meta: "Student Council • Tomorrow",
                        tone: "emerald",
                      },
                      {
                        type: "Support",
                        title: "Counselling appointment request",
                        meta: "Student Support • New",
                        tone: "sky",
                      },
                    ].map((i) => (
                      <div
                        key={i.title}
                        className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white p-4"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={cx(
                                "rounded-full px-2.5 py-1 text-xs font-semibold",
                                i.tone === "teal" &&
                                  "bg-teal-50 text-teal-800 border border-teal-200/60",
                                i.tone === "emerald" &&
                                  "bg-emerald-50 text-emerald-800 border border-emerald-200/60",
                                i.tone === "sky" &&
                                  "bg-sky-50 text-sky-800 border border-sky-200/60",
                              )}
                            >
                              {i.type}
                            </span>
                            <span className="text-xs text-slate-500">
                              {i.meta}
                            </span>
                          </div>
                          <div className="mt-2 truncate text-sm font-semibold">
                            {i.title}
                          </div>
                          <div className="mt-1 text-sm text-slate-600">
                            One click to view details and take action.
                          </div>
                        </div>
                        <button className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                          Open
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </Shell>
        </section>

        <SoftBand tone="emerald" />

        {/* BENEFITS (feature grid) */}
        <section id="benefits" className="py-14 sm:py-16">
          <Shell>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Benefits
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                  A professional, light UI with a softer teal/emerald
                  identity—clean, modern, and easy to extend across pages.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Clean UI", icon: "spark" as const },
                  { label: "Secure by default", icon: "shield" as const },
                  { label: "Fast workflows", icon: "bolt" as const },
                ].map((x) => (
                  <span
                    key={x.label}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm"
                  >
                    <span className="text-teal-700">
                      <MiniIcon name={x.icon} />
                    </span>
                    {x.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, idx) => (
                <Card
                  key={f.title}
                  className={cx(
                    "p-6",
                    idx === 1 && "border-teal-200/70",
                    idx === 3 && "border-emerald-200/70",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">{f.title}</div>
                    {f.badge && (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                        {f.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {f.desc}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-teal-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                    Included
                  </div>
                </Card>
              ))}
            </div>

            {/* Metrics bar */}
            <div className="mt-10 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-4">
                {metrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-2xl border border-slate-200/70 bg-white p-4"
                  >
                    <div className="text-lg font-semibold">{m.value}</div>
                    <div className="mt-1 text-xs text-slate-500">{m.label}</div>
                    {m.hint && (
                      <div className="mt-1 text-xs text-slate-400">
                        {m.hint}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Shell>
        </section>

        <SoftBand tone="teal" />

        {/* PRICING */}
        <section id="pricing" className="py-14 sm:py-16">
          <Shell>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Pricing
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                  Straightforward tiers—no surprises.
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
                      : "text-slate-700 hover:bg-slate-50",
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
                      : "text-slate-700 hover:bg-slate-50",
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
                  price: price(24),
                  desc: "For small programs.",
                  points: ["Announcements", "Clubs & events", "Basic roles"],
                  highlight: false,
                },
                {
                  name: "School",
                  price: price(74),
                  desc: "For most schools.",
                  points: [
                    "Everything in Starter",
                    "Support inbox",
                    "Analytics",
                    "Advanced permissions",
                  ],
                  highlight: true,
                },
                {
                  name: "District",
                  price: price(139),
                  desc: "For multi-campus.",
                  points: [
                    "Everything in School",
                    "Multi-campus",
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
                    p.highlight && "border-teal-200/80 shadow-md",
                  )}
                >
                  {p.highlight && (
                    <div className="mb-3 inline-flex items-center rounded-full border border-teal-200/70 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
                      Most popular
                    </div>
                  )}
                  <div className="text-sm font-semibold">{p.name}</div>
                  <div className="mt-2 flex items-end gap-2">
                    <div className="text-3xl font-semibold">${p.price}</div>
                    <div className="pb-1 text-sm text-slate-500">{suffix}</div>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{p.desc}</p>

                  <div className="mt-5 space-y-3">
                    {p.points.map((t) => (
                      <div key={t} className="flex items-start gap-3">
                        <div className="mt-0.5 grid h-6 w-6 place-items-center rounded-lg bg-teal-50 text-teal-700">
                          <MiniIcon name="spark" />
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
                        ? "bg-teal-600 text-white hover:bg-teal-700"
                        : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
                    )}
                  >
                    Choose {p.name}
                  </a>
                </Card>
              ))}
            </div>
          </Shell>
        </section>

        <SoftBand tone="emerald" />

        {/* FAQ */}
        <section id="faq" className="py-14 sm:py-16">
          <Shell>
            <h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {[
                {
                  q: "Is this built for students and staff?",
                  a: "Yes—students get a clean daily view, while staff gets structure and ownership with simple permissions.",
                },
                {
                  q: "Can we start small and expand later?",
                  a: "That’s the idea. Start with announcements + events, then add clubs, support inbox, and analytics as you scale.",
                },
                {
                  q: "Does SchoolSpace support multiple campuses?",
                  a: "The District tier is designed for multi-campus management and shared standards across schools.",
                },
                {
                  q: "Is the UI theme customizable?",
                  a: "You can easily swap accents (teal/emerald/purple) while keeping the same light, professional base.",
                },
              ].map((x) => (
                <Card key={x.q} className="p-6">
                  <div className="text-sm font-semibold">{x.q}</div>
                  <div className="mt-2 text-sm leading-relaxed text-slate-600">
                    {x.a}
                  </div>
                </Card>
              ))}
            </div>

            <Card className="mt-10 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-lg font-semibold">
                    Try SchoolSpace today
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Light UI, smooth workflows, and a calmer campus experience.
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
                    href="#tour"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                  >
                    Back to tour
                  </a>
                </div>
              </div>
            </Card>
          </Shell>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200/70 bg-white">
          <Shell className="flex flex-col gap-4 py-10 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-sm">
                <span className="text-sm font-semibold">SS</span>
              </div>
              <div>
                <div className="text-sm font-semibold">SchoolSpace</div>
                <div className="text-xs text-slate-500">
                  Calm campus operations.
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
              <a href="#" className="hover:text-slate-900">
                Privacy
              </a>
              <a href="#" className="hover:text-slate-900">
                Terms
              </a>
              <a href="#" className="hover:text-slate-900">
                Contact
              </a>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-slate-500">
                © {new Date().getFullYear()} SchoolSpace
              </span>
            </div>
          </Shell>
        </footer>
      </main>
    </div>
  );
}
