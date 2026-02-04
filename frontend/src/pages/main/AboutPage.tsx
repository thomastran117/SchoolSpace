import { Section } from "@components/common/Section";
import { Card } from "@components/common/Card";
import { HeroCard } from "@components/common/HeroCard";
import { FeatureCard } from "@components/common/FeatureCard";
import { StatCard } from "@components/common/StatCard";
import { LogoCloud } from "@components/common/LogoCloud";
import { Pill } from "@components/common/Pill";
import { Breadcrumb } from "@components/common/BreadCrumb";
import { Button } from "@components/common/Button";
import { H2, Lead, Muted } from "@components/common/Text";
import Icon from "@components/common/Icon";
import BookIcon from "@icon/BookIcon";
import ShieldIcon from "@icon/ShieldIcon";
import SparkIcon from "@icon/SparkIcon";
import PeopleIcon from "@icon/PeopleIcon";
import TimelineItem from "@/components/common/Timeline";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Subtle, calm top gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-indigo-50 via-white to-transparent" />

      <div className="relative">
        <Section className="pt-10 md:pt-12" containerClassName="space-y-6">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "About", current: true },
            ]}
          />

          <HeroCard
            tone="soft"
            eyebrow={
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
                Campus Minimal • About
              </span>
            }
            badge={{ text: "Student-first platform", variant: "info" }}
            title="Designed like a modern university portal — calm, clear, and admin-friendly."
            subtitle="We build simple tooling for schedules, clubs, and campus events so students spend less time searching and more time participating."
            primaryAction={{
              label: "Contact us",
              href: "/contact",
              variant: "primary",
            }}
            secondaryAction={{
              label: "View services",
              href: "/services",
              variant: "outline",
            }}
            stats={[
              { label: "Focus", value: "Clarity & usability" },
              { label: "Default style", value: "White space + thin dividers" },
              { label: "Accent", value: "Indigo / royal blue" },
            ]}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                <Pill>Accessible UI</Pill>
                <Pill>Role-based experiences</Pill>
                <Pill>Minimal, fast pages</Pill>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" className="text-slate-700">
                  Release notes
                </Button>
                <Button variant="outline">Security</Button>
              </div>
            </div>
          </HeroCard>
        </Section>

        {/* Mission + stats */}
        <Section>
          <div className="grid gap-6 md:grid-cols-12">
            <Card className="p-7 md:col-span-7">
              <H2>Our mission</H2>
              <Lead className="mt-3">
                Make campus tools feel predictable and calm — the same way a
                great admin dashboard does — while still being welcoming for
                students.
              </Lead>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="text-xs font-medium text-slate-500">
                    Design principle
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">
                    “Reduce cognitive load”
                  </div>
                  <Muted className="mt-1">
                    Clear hierarchy, fewer decisions per screen, sensible
                    defaults.
                  </Muted>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="text-xs font-medium text-slate-500">
                    Engineering principle
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">
                    “Fast, stable, observable”
                  </div>
                  <Muted className="mt-1">
                    Consistent UI components, simple data flows, strong error
                    states.
                  </Muted>
                </div>
              </div>
            </Card>

            <div className="grid gap-4 md:col-span-5">
              <StatCard
                label="UI tone"
                value="Minimal & modern"
                hint="Muted slate text, subtle borders"
              />
              <StatCard
                label="Interaction"
                value="Low-friction"
                hint="Pill badges, thin dividers, soft shadows"
              />
              <StatCard
                label="Scales to admins"
                value="Yes"
                hint="Clear density and predictable layouts"
              />
            </div>
          </div>
        </Section>

        {/* Values */}
        <Section className="bg-white">
          <div className="flex items-end justify-between gap-6">
            <div className="max-w-2xl">
              <H2>What we optimize for</H2>
              <Lead className="mt-2">
                Practical, campus-ready UX: simple, consistent patterns that
                don’t surprise users.
              </Lead>
            </div>
            <Pill className="hidden md:inline-flex">
              Theme A • Campus Minimal
            </Pill>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={
                <Icon>
                  <BookIcon />
                </Icon>
              }
              title="Clarity"
              description="Straightforward layouts, readable type, clean spacing and hierarchy."
            />
            <FeatureCard
              icon={
                <Icon>
                  <ShieldIcon />
                </Icon>
              }
              title="Trust"
              description="Admin-friendly patterns, stable navigation, and safe defaults."
            />
            <FeatureCard
              icon={
                <Icon>
                  <SparkIcon />
                </Icon>
              }
              title="Polish"
              description="Soft shadows, calm gradients, and consistent micro-interactions."
            />
            <FeatureCard
              icon={
                <Icon>
                  <PeopleIcon />
                </Icon>
              }
              title="Community"
              description="Designed for clubs and events—help people find their place faster."
            />
          </div>
        </Section>

        {/* Timeline */}
        <Section>
          <Card className="p-7">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <H2>How the platform evolved</H2>
                <Muted className="mt-1">
                  A simple timeline that reads like an internal university
                  project page.
                </Muted>
              </div>
              <Pill>Thin dividers • Calm UI</Pill>
            </div>

            <div className="mt-6 divide-y divide-slate-200">
              <TimelineItem
                when="Phase 1"
                tag="Foundation"
                title="Core navigation & role-aware layout"
                desc="Established the component system: cards, sections, breadcrumbs, and buttons tuned for readability."
              />
              <TimelineItem
                when="Phase 2"
                tag="Campus workflows"
                title="Events, clubs, and discovery"
                desc="Added structured browsing, simple filters, and consistent empty states so pages feel predictable."
              />
              <TimelineItem
                when="Phase 3"
                tag="Admin-ready"
                title="Moderation, reporting, and settings UX"
                desc="Focused on dashboard density without clutter: borders, dividers, and compact information blocks."
              />
            </div>
          </Card>
        </Section>

        {/* Logos / partners */}
        <Section className="bg-white">
          <div className="grid gap-6 md:grid-cols-12 md:items-center">
            <div className="md:col-span-5">
              <H2>Built to fit campus ecosystems</H2>
              <Lead className="mt-2">
                A calm interface that works well alongside existing tools and
                university workflows.
              </Lead>
              <div className="mt-4 flex gap-2">
                <Button variant="outline">Documentation</Button>
                <Button variant="ghost" className="text-slate-700">
                  API status
                </Button>
              </div>
            </div>

            <div className="md:col-span-7">
              <LogoCloud
                names={[
                  "Student Services",
                  "Clubs Council",
                  "Registrar",
                  "IT Services",
                  "Campus Rec",
                  "Libraries",
                  "Accessibility",
                  "Residence Life",
                ]}
              />
            </div>
          </div>
        </Section>

        {/* Team */}
        <Section>
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-5">
              <H2>Small team, strong standards</H2>
              <Lead className="mt-2">
                We prefer a clean component system over one-off pages—so the app
                stays consistent as it grows.
              </Lead>
              <Muted className="mt-3">
                Tip: swap these placeholders with your real team data, avatars,
                and links later.
              </Muted>
            </div>

            <Card className="p-7 md:col-span-7">
              <div className="space-y-5">
                {[
                  {
                    name: "Product / UX",
                    desc: "Keeps pages calm, readable, and consistent.",
                  },
                  {
                    name: "Frontend",
                    desc: "Builds reusable components and accessible patterns.",
                  },
                  {
                    name: "Backend",
                    desc: "Designs clean APIs and secure auth flows.",
                  },
                  {
                    name: "Ops / QA",
                    desc: "Ensures reliability, monitoring, and safe releases.",
                  },
                ].map((m) => (
                  <div key={m.name} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm">
                      {m.name.split("/")[0].trim().slice(0, 1)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-slate-900">
                          {m.name}
                        </div>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="text-xs font-medium text-slate-500">
                          Campus Minimal
                        </span>
                      </div>
                      <Muted className="mt-1">{m.desc}</Muted>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Want to contribute?
                    </div>
                    <div className="text-sm text-slate-600">
                      We love clear PRs and consistent components.
                    </div>
                  </div>
                  <Button variant="primary">Join the project</Button>
                </div>
              </div>
            </Card>
          </div>
        </Section>

        <div className="h-10" />
      </div>
    </div>
  );
}
