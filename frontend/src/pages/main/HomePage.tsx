import React from "react";
import { Button } from "@components/common/Button";
import { Section } from "@components/common/Section";
import { Eyebrow, H1, H2, Lead, Muted } from "@components/common/Text";
import { Pill } from "@components/common/Pill";
import { FeatureCard } from "@components/common/FeatureCard";
import { StatCard } from "@components/common/StatCard";
import { TestimonialCard } from "@components/common/TestimonialCard";
import { PricingCard } from "@components/common/PricingCard";
import { LogoCloud } from "@components/common/LogoCloud";
import { Card } from "@components/common/Card";

export default function HomePageThemeA() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* soft background accents */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-50 via-white to-indigo-50 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[520px] translate-x-1/4 translate-y-1/4 rounded-full bg-indigo-50 blur-3xl" />
      </div>

      {/* HERO */}
      <Section className="pt-12 md:pt-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <Eyebrow>
              <span className="h-2 w-2 rounded-full bg-indigo-600" />
              Built for modern academic workflows
            </Eyebrow>

            <H1 className="mt-5">
              A calm, modern portal for{" "}
              <span className="text-indigo-600">courses</span>,{" "}
              <span className="text-indigo-600">clubs</span>, and{" "}
              <span className="text-indigo-600">campus life</span>.
            </H1>

            <Lead className="mt-4 max-w-xl">
              SchoolSpace brings clarity to academic management—simple UX for
              students, powerful tools for staff, and clean administration for
              everything else.
            </Lead>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="primary"
                size="lg"
                title="Get started"
                onClick={() => {}}
              />
              <Button
                variant="outline"
                size="lg"
                title="Watch demo"
                onClick={() => {}}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Pill>SSO-ready</Pill>
              <Pill>Role-based access</Pill>
              <Pill>Audit-friendly</Pill>
              <Pill>Accessible UI</Pill>
            </div>
          </div>

          {/* hero panel */}
          <Card className="p-6 md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">Today</div>
                <div className="mt-1 text-xs text-slate-500">
                  A quick snapshot
                </div>
              </div>
              <Pill className="bg-indigo-50 text-indigo-700 border-indigo-100">
                Winter term
              </Pill>
            </div>

            <div className="mt-5 grid gap-3">
              <Card className="p-4">
                <div className="flex items-end justify-between">
                  <div className="text-sm font-semibold">Announcements</div>
                  <div className="text-xs text-slate-500">2 new</div>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {[
                    "Add/drop deadline updated",
                    "Library hours posted for this week",
                  ].map((t) => (
                    <li key={t} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-600" />
                      <span className="leading-relaxed">{t}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-4">
                <div className="flex items-end justify-between">
                  <div className="text-sm font-semibold">Upcoming</div>
                  <div className="text-xs text-slate-500">Next 7 days</div>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {[
                    "Club fair • Thu 3:00 PM",
                    "Midterm review • Sat 11:00 AM",
                  ].map((t) => (
                    <li key={t} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-600" />
                      <span className="leading-relaxed">{t}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Active courses" value="5" hint="This term" />
                <StatCard label="Club memberships" value="3" hint="Joined" />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <div className="text-sm font-semibold">
                  Continue where you left off
                </div>
                <div className="mt-0.5 text-xs text-slate-600">
                  COMP 2406 • Assignment 2
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                title="Open"
                onClick={() => {}}
              />
            </div>
          </Card>
        </div>
      </Section>

      {/* FEATURES */}
      <Section className="bg-slate-50/60">
        <div className="text-center">
          <H2>Everything your institution needs</H2>
          <Muted className="mx-auto mt-3 max-w-3xl">
            Clean structure, modern UX, and scalable foundations—designed for
            real school workflows.
          </Muted>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <FeatureCard
            title="Course management"
            description="Create curricula, manage prerequisites, assign instructors, and publish updates with confidence."
          />
          <FeatureCard
            title="Student insights"
            description="Track progress, identify at-risk students, and support advisors with simple dashboards."
          />
          <FeatureCard
            title="Analytics & reporting"
            description="Generate semester reports, export data, and support accreditation workflows."
          />
        </div>
      </Section>

      {/* TRUST */}
      <Section>
        <div className="text-center">
          <div className="text-xs font-semibold tracking-wide text-slate-500">
            TRUSTED BY MODERN INSTITUTIONS
          </div>
          <div className="mt-8">
            <LogoCloud
              names={["University A", "College B", "Institute C", "Academy D"]}
            />
          </div>
        </div>
      </Section>

      {/* TESTIMONIALS */}
      <Section className="bg-white">
        <div className="text-center">
          <H2>Loved by educators and administrators</H2>
          <Muted className="mx-auto mt-3 max-w-2xl">
            Institutions choose SchoolSpace for its clarity, reliability, and
            thoughtful design.
          </Muted>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <TestimonialCard
            quote="SchoolSpace transformed how we manage courses and enrollment. The dashboards give us instant clarity."
            author="Director of Academics"
            role="Academic Office"
            organization="University A"
          />
          <TestimonialCard
            quote="Our advisors finally have the insights they need to support students proactively. The UI is modern and intuitive."
            author="Student Success Lead"
            role="Student Services"
            organization="College B"
          />
          <TestimonialCard
            quote="Implementation was smooth, and reporting tools have saved us hours every semester."
            author="Registrar"
            role="Registrar’s Office"
            organization="Institute C"
          />
        </div>
      </Section>

      {/* PRICING */}
      <Section className="bg-slate-50/60">
        <div className="text-center">
          <H2>Simple, transparent pricing</H2>
          <Muted className="mx-auto mt-3 max-w-2xl">
            Flexible plans designed for institutions of all sizes.
          </Muted>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <PricingCard
            title="Starter"
            price="$99"
            description="For small schools and pilot programs"
            features={[
              "Up to 1,000 students",
              "Core course management",
              "Basic analytics",
            ]}
          />
          <PricingCard
            title="Professional"
            price="$299"
            highlighted
            description="Best for growing institutions"
            features={[
              "Up to 10,000 students",
              "Advanced analytics",
              "Priority support",
            ]}
          />
          <PricingCard
            title="Enterprise"
            price="Custom"
            description="For large universities"
            features={[
              "Unlimited students",
              "Custom integrations",
              "Dedicated support",
            ]}
          />
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <Card className="overflow-hidden">
          <div className="relative p-8 md:p-10">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-50 via-white to-indigo-50" />
            <div className="relative">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Ready to elevate your academic platform?
                  </div>
                  <div className="mt-2 text-sm text-slate-600">
                    Start with a clean foundation. Add modules as you grow.
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    variant="primary"
                    size="lg"
                    title="Start free trial"
                    onClick={() => {}}
                  />
                  <Button
                    variant="outline"
                    size="lg"
                    title="Talk to sales"
                    onClick={() => {}}
                  />
                </div>
              </div>
              <div className="mt-4 text-xs text-slate-500">
                No credit card required.
              </div>
            </div>
          </div>
        </Card>
      </Section>
    </div>
  );
}
