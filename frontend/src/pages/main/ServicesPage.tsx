import React, { useMemo } from "react";

import { Section } from "@common/Section";
import { Card } from "@common/Card";
import { HeroCard } from "@common/HeroCard";
import { FeatureCard } from "@common/FeatureCard";
import { Pill } from "@common/Pill";
import { Breadcrumb } from "@common/BreadCrumb";
import { Button } from "@common/Button";
import { H2, Lead, Muted } from "@common/Text";
import CheckRow from "@common/CheckRow";
import ServiceTierCard from "@/components/main/ServiceTierCard";
import FAQItem from "@/components/main/FAQItem";
import SimpleIcon from "@/components/main/SimpleIcon";
import IconShell from "@common/IconShell";

export default function ServicesPage() {
  const serviceCards = useMemo(
    () => [
      {
        icon: "calendar" as const,
        title: "Event Publishing & Discovery",
        desc: "Create events fast, keep listings consistent, and help students find what matters.",
        bullets: [
          "Structured categories",
          "Smart search & filters",
          "Clear RSVP / attendance states",
        ],
      },
      {
        icon: "people" as const,
        title: "Clubs & Community Tools",
        desc: "A calm, admin-friendly workflow for club pages, membership, and announcements.",
        bullets: [
          "Role-based moderation",
          "Membership requests",
          "Announcements + pinned updates",
        ],
      },
      {
        icon: "shield" as const,
        title: "Security & Identity",
        desc: "Solid auth patterns that feel invisible: clean sessions, safe defaults, clear errors.",
        bullets: [
          "OAuth & email flows",
          "JWT / refresh patterns",
          "Audit-friendly admin controls",
        ],
      },
      {
        icon: "chart" as const,
        title: "Analytics & Reporting",
        desc: "Useful metrics without noise—built for campus stakeholders and admins.",
        bullets: [
          "Participation trends",
          "Top events / clubs",
          "Export-ready summaries",
        ],
      },
      {
        icon: "spark" as const,
        title: "UI/UX Systemization",
        desc: "Reusable components that keep the portal consistent as features grow.",
        bullets: [
          "Component library alignment",
          "Accessibility pass",
          "Design tokens + spacing scale",
        ],
      },
      {
        icon: "bolt" as const,
        title: "Performance & Reliability",
        desc: "Fast pages and stable releases: fewer surprises for students and admins.",
        bullets: [
          "Caching strategy",
          "Error boundaries + retries",
          "Observability hooks",
        ],
      },
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Calm top wash */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-indigo-50 via-white to-transparent" />

      <div className="relative">
        <Section className="pt-10 md:pt-12" containerClassName="space-y-6">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Services", current: true },
            ]}
          />

          <HeroCard
            tone="soft"
            eyebrow={
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
                Services • Campus Minimal
              </span>
            }
            badge={{ text: "Admin-friendly by default", variant: "info" }}
            title="Campus tools, delivered with calm UX and predictable engineering."
            subtitle="A set of practical services to help you ship a modern university portal—without clutter, without surprises."
            primaryAction={{
              label: "Get in touch",
              href: "/contact",
              variant: "primary",
            }}
            secondaryAction={{
              label: "See pricing tiers",
              href: "#tiers",
              variant: "outline",
            }}
            stats={[
              { label: "Style", value: "White space + thin dividers" },
              { label: "Accent", value: "Indigo" },
              { label: "Approach", value: "Reusable components first" },
            ]}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                <Pill>Subtle borders</Pill>
                <Pill>Soft shadows</Pill>
                <Pill>Muted slate text</Pill>
                <Pill>Calm gradients</Pill>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">View docs</Button>
                <Button variant="ghost" className="text-slate-700">
                  Security notes
                </Button>
              </div>
            </div>
          </HeroCard>
        </Section>

        {/* Service grid */}
        <Section className="bg-white">
          <div className="max-w-2xl">
            <H2>What we offer</H2>
            <Lead className="mt-2">
              A focused set of campus-ready capabilities—each designed to look
              and feel like a clean university portal.
            </Lead>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {serviceCards.map((s) => (
              <FeatureCard
                key={s.title}
                icon={
                  <IconShell>
                    <SimpleIcon kind={s.icon} />
                  </IconShell>
                }
                title={s.title}
                description={s.desc}
              />
            ))}
          </div>
        </Section>

        {/* Process */}
        <Section>
          <div className="grid gap-6 md:grid-cols-12 md:items-start">
            <div className="md:col-span-5">
              <H2>How we work</H2>
              <Lead className="mt-2">
                Simple process, clear artifacts, and clean handoff—so the portal
                stays consistent.
              </Lead>

              <div className="mt-4 flex flex-wrap gap-2">
                <Pill>Thin dividers</Pill>
                <Pill>Stable layouts</Pill>
                <Pill>Accessible components</Pill>
              </div>

              <Card className="mt-6 p-6">
                <div className="text-sm font-semibold text-slate-900">
                  Deliverables you’ll actually use
                </div>
                <div className="mt-4 space-y-3">
                  <CheckRow>Reusable React + Tailwind components</CheckRow>
                  <CheckRow>
                    Clear UI guidelines (spacing, borders, states)
                  </CheckRow>
                  <CheckRow>API contracts + validation rules</CheckRow>
                  <CheckRow>Admin workflows and edge-case handling</CheckRow>
                </div>
              </Card>
            </div>

            <Card className="p-7 md:col-span-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-medium text-slate-500">
                    Project flow
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    Four calm steps
                  </div>
                </div>
                <Pill className="text-indigo-700">
                  <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  Campus Minimal
                </Pill>
              </div>

              <div className="mt-6 divide-y divide-slate-200">
                {[
                  {
                    n: "01",
                    t: "Scope & audit",
                    d: "We map your campus workflows and identify the highest friction pages.",
                  },
                  {
                    n: "02",
                    t: "Component plan",
                    d: "We align tokens, spacing, borders, and error/empty states across the app.",
                  },
                  {
                    n: "03",
                    t: "Implementation",
                    d: "Build services + UI with predictable patterns and role-aware flows.",
                  },
                  {
                    n: "04",
                    t: "Hardening",
                    d: "Performance, monitoring, and stability passes—then a clean handoff.",
                  },
                ].map((step) => (
                  <div
                    key={step.n}
                    className="grid gap-3 py-5 md:grid-cols-12 md:gap-6"
                  >
                    <div className="md:col-span-3">
                      <div className="inline-flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm">
                          {step.n}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          Step
                        </span>
                      </div>
                    </div>
                    <div className="md:col-span-9">
                      <div className="text-sm font-semibold text-slate-900">
                        {step.t}
                      </div>
                      <Muted className="mt-1">{step.d}</Muted>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Prefer async collaboration?
                    </div>
                    <div className="text-sm text-slate-600">
                      We can work via PRs + short review calls.
                    </div>
                  </div>
                  <Button variant="outline">Schedule a call</Button>
                </div>
              </div>
            </Card>
          </div>
        </Section>

        {/* Tiers */}
        <Section className="bg-white" id="tiers">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <H2>Service tiers</H2>
              <Lead className="mt-2">
                Pick a tier that matches your timeline. All tiers keep the same
                Campus Minimal UI standards.
              </Lead>
            </div>
            <Pill>One accent • Indigo</Pill>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <ServiceTierCard
              name="Starter"
              tagline="Quick help for a single area"
              priceNote="Fixed scope"
              features={[
                "1 feature area (e.g., Events or Clubs)",
                "UI consistency pass (spacing, borders, states)",
                "Basic API contract + validation",
                "PR-ready component changes",
              ]}
              cta={{ label: "Choose Starter", href: "/contact" }}
            />

            <ServiceTierCard
              name="Campus"
              tagline="Most popular for shipping a cohesive portal"
              highlight="Recommended"
              priceNote="Flexible"
              features={[
                "2–3 feature areas (Events + Clubs + Admin)",
                "Design tokens & shared components",
                "Error/empty/loading states",
                "Performance pass on key routes",
              ]}
              cta={{ label: "Choose Campus", href: "/contact" }}
              variant="featured"
            />

            <ServiceTierCard
              name="Enterprise"
              tagline="For larger rollouts + deeper reliability"
              priceNote="Custom"
              features={[
                "Role matrix + governance workflows",
                "Analytics/reporting pack",
                "Observability (logging/metrics) integration",
                "Release hardening + QA plan",
              ]}
              cta={{ label: "Talk to us", href: "/contact" }}
            />
          </div>

          <Card className="mt-6 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Not sure which tier fits?
                </div>
                <Muted className="mt-1">
                  Tell us what pages feel “messy” and we’ll recommend the
                  smallest clean solution.
                </Muted>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Compare tiers</Button>
                <Button variant="primary">Contact</Button>
              </div>
            </div>
          </Card>
        </Section>

        {/* FAQ */}
        <Section>
          <div className="grid gap-6 md:grid-cols-12 md:items-start">
            <div className="md:col-span-5">
              <H2>FAQ</H2>
              <Lead className="mt-2">
                Common questions from campus teams and admins.
              </Lead>
              <Muted className="mt-3">
                Everything here is designed to stay calm: short answers, clear
                states, no surprises.
              </Muted>
            </div>

            <div className="space-y-3 md:col-span-7">
              <FAQItem
                q="Can you match our current component library?"
                a="Yes. We’ll prefer your existing components and only add small, reusable helpers when needed (e.g., dividers, FAQ items, tier cards)."
              />
              <FAQItem
                q="Do you support role-based admin workflows?"
                a="Yes—student/teacher/admin flows are a core focus. We keep permissions and moderation states obvious without adding UI clutter."
              />
              <FAQItem
                q="Will pages stay fast with more features?"
                a="We optimize layout consistency and add lightweight performance improvements (cache strategy, pagination patterns, and stable loading states)."
              />
              <FAQItem
                q="What does ‘Campus Minimal’ mean in practice?"
                a="More whitespace, thin dividers, muted slate text, subtle shadows—and one strong accent (indigo) to guide attention."
              />
            </div>
          </div>
        </Section>

        {/* CTA */}
        <Section className="bg-white">
          <Card className="p-7">
            <div className="grid gap-6 md:grid-cols-12 md:items-center">
              <div className="md:col-span-8">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill className="text-indigo-700">Calm UX</Pill>
                  <Pill>Admin-friendly</Pill>
                  <Pill>Reusable components</Pill>
                </div>

                <div className="mt-3 text-lg font-semibold text-slate-900">
                  Ready to ship a portal that feels clean and predictable?
                </div>
                <Muted className="mt-1">
                  We’ll keep your UI consistent, your flows role-aware, and your
                  pages fast.
                </Muted>
              </div>

              <div className="md:col-span-4 md:text-right">
                <div className="flex flex-col gap-2 sm:flex-row md:justify-end">
                  <Button variant="outline">View case notes</Button>
                  <Button variant="primary">Contact</Button>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Typical response within 1–2 business days
                </div>
              </div>
            </div>
          </Card>
        </Section>

        <div className="h-10" />
      </div>
    </div>
  );
}
