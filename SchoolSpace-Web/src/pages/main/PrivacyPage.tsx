import { useMemo, useState } from "react";

import { Section } from "@common/Section";
import { Card } from "@common/Card";
import { HeroCard } from "@common/HeroCard";
import { Pill } from "@common/Pill";
import { Breadcrumb } from "@common/BreadCrumb";
import { Button } from "@common/Button";
import { H2, Lead, Muted } from "@common/Text";
import SectionLink from "@common/SectionLink";
import InlineCode from "@common/InlineCode";
import Divider from "@common/Divider";
import PolicyBlock from "@/components/main/PolicyBlock";
import DataTable from "@/components/main/DataTable";
import Bullets from "@common/Bullets";

export default function PrivacyPage() {
  const effectiveDate = "February 3, 2026";
  const companyName = "SchoolSpace";
  const productName = "SchoolSpace Platform";
  const contactEmail = "support@school.com";
  const jurisdiction = "Ontario, Canada";

  const sections = useMemo(
    () => [
      { id: "summary", title: "Quick summary" },
      { id: "data", title: "Information we collect" },
      { id: "use", title: "How we use information" },
      { id: "legal", title: "Legal bases (if applicable)" },
      { id: "sharing", title: "How we share information" },
      { id: "cookies", title: "Cookies & analytics" },
      { id: "security", title: "Security" },
      { id: "retention", title: "Data retention" },
      { id: "rights", title: "Your rights" },
      { id: "children", title: "Children / student users" },
      { id: "changes", title: "Changes to this policy" },
      { id: "contact", title: "Contact" },
    ],
    [],
  );

  const [activeId, setActiveId] = useState(sections[0]?.id ?? "summary");

  const jumpTo = (id: string) => {
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const collectedRows = useMemo(
    () => [
      {
        category: "Account",
        examples:
          "Name, email, role (student/teacher/admin), login identifiers",
        purpose:
          "Create accounts, authenticate users, and personalize role-based features.",
      },
      {
        category: "Profile & content",
        examples: "Club/event posts, uploaded images/files, messages to admins",
        purpose: "Display campus content and enable moderation/workflows.",
      },
      {
        category: "Usage",
        examples: "Pages viewed, actions taken, timestamps, basic diagnostics",
        purpose:
          "Improve reliability, troubleshoot issues, and measure feature usage.",
      },
      {
        category: "Device & technical",
        examples: "IP address, browser type, device identifiers, cookies",
        purpose:
          "Security, session management, fraud prevention, and basic analytics.",
      },
      {
        category: "Communications",
        examples: "Support requests, feedback, email preferences",
        purpose:
          "Respond to inquiries and provide service updates when requested.",
      },
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Calm top wash */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-gradient-to-b from-indigo-50 via-white to-transparent" />

      <div className="relative">
        <Section className="pt-10 md:pt-12" containerClassName="space-y-6">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Privacy", current: true },
            ]}
          />

          <HeroCard
            tone="soft"
            eyebrow={
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
                Legal • Privacy Policy
              </span>
            }
            badge={{ text: "Template", variant: "info" }}
            title="Privacy Policy"
            subtitle="A calm, readable privacy policy layout. Replace placeholders to match your actual data practices."
            primaryAction={{
              label: "Contact privacy",
              href: "/contact",
              variant: "primary",
            }}
            secondaryAction={{
              label: "Terms",
              href: "/terms",
              variant: "outline",
            }}
            stats={[
              { label: "Effective", value: effectiveDate },
              { label: "Jurisdiction", value: jurisdiction },
              { label: "Contact", value: contactEmail },
            ]}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                <Pill>Plain language</Pill>
                <Pill>Thin dividers</Pill>
                <Pill>Minimal clutter</Pill>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.print()}>
                  Print
                </Button>
                <Button
                  variant="ghost"
                  className="text-slate-700"
                  onClick={() => jumpTo("rights")}
                >
                  Your rights
                </Button>
              </div>
            </div>
          </HeroCard>
        </Section>

        <Section>
          <div className="grid gap-6 md:grid-cols-12">
            {/* Contents */}
            <div className="md:col-span-4">
              <Card className="sticky top-6 p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">
                    Contents
                  </div>
                  <Pill className="text-slate-600">
                    {sections.length} items
                  </Pill>
                </div>

                <Muted className="mt-2">
                  Click to jump. This layout is designed for quick scanning.
                </Muted>

                <div className="mt-4 space-y-2">
                  {sections.map((s) => (
                    <SectionLink
                      key={s.id}
                      id={s.id}
                      title={s.title}
                      active={activeId === s.id}
                      onClick={() => jumpTo(s.id)}
                    />
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="text-sm font-semibold text-slate-900">
                    Implementation note
                  </div>
                  <Muted className="mt-1">
                    Update placeholders like{" "}
                    <InlineCode>{companyName}</InlineCode>,{" "}
                    <InlineCode>{contactEmail}</InlineCode>, and your actual
                    cookie/analytics tools.
                  </Muted>
                </div>
              </Card>
            </div>

            {/* Policy */}
            <div className="md:col-span-8">
              <Card className="p-7">
                <div className="max-w-3xl">
                  <H2>Overview</H2>
                  <Lead className="mt-2">
                    This Privacy Policy explains how {companyName} (“we”, “us”)
                    collects, uses, and shares information when you use{" "}
                    {productName} (“Service”).
                  </Lead>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-xs font-medium text-slate-500">
                      Effective date
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">
                      {effectiveDate}
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      This is a template. Adjust to your actual practices and
                      jurisdiction.
                    </div>
                  </div>

                  <Divider />

                  <PolicyBlock id="summary" title="Quick summary" tag="TL;DR">
                    We collect basic account information and content you choose
                    to provide (like events or club posts). We use that
                    information to operate the Service, keep it secure, and
                    improve features. We don’t sell personal information. We
                    share information only as needed to provide the Service
                    (e.g., hosting, authentication), to comply with law, or with
                    your consent.
                  </PolicyBlock>

                  <PolicyBlock id="data" title="Information we collect">
                    The categories below are common for campus platforms. Update
                    each row to match what you actually collect.
                    <DataTable rows={collectedRows} />
                  </PolicyBlock>

                  <PolicyBlock id="use" title="How we use information">
                    We use information to:
                    <Bullets
                      items={[
                        "Provide and maintain the Service (accounts, authentication, role-based access).",
                        "Operate campus content workflows (events, clubs, moderation).",
                        "Improve performance, reliability, and user experience.",
                        "Detect, prevent, and respond to security issues and abuse.",
                        "Communicate with you about support requests or important service updates.",
                      ]}
                    />
                  </PolicyBlock>

                  <PolicyBlock
                    id="legal"
                    title="Legal bases (if applicable)"
                    tag="Optional"
                  >
                    Depending on your jurisdiction, we may process information
                    under one or more legal bases such as: contract (providing
                    the Service), legitimate interests (security, improvement),
                    consent (optional communications/cookies), or legal
                    obligation (compliance). If you operate within the
                    EU/EEA/UK, you should customize this section carefully.
                  </PolicyBlock>

                  <PolicyBlock id="sharing" title="How we share information">
                    We may share information with:
                    <Bullets
                      items={[
                        "Service providers (hosting, storage, analytics, email delivery) acting on our instructions.",
                        "Authentication providers (e.g., Google/Microsoft OAuth) when you choose to use them.",
                        "Your institution/administrators (if your account is institution-managed), consistent with role permissions.",
                        "Law enforcement or regulators when required by law or to protect rights and safety.",
                      ]}
                    />
                    We do not sell personal information. If you add
                    integrations, update this list.
                  </PolicyBlock>

                  <PolicyBlock id="cookies" title="Cookies & analytics">
                    We use cookies and similar technologies for session
                    management and security. We may also use analytics to
                    understand usage patterns.
                    <Bullets
                      items={[
                        "Strictly necessary cookies: login sessions, CSRF protection, security.",
                        "Preferences: optional UI settings (if you implement them).",
                        "Analytics: aggregate insights (pages viewed, feature usage).",
                      ]}
                    />
                    If you use specific tools (e.g., Google Analytics, PostHog),
                    name them here and provide opt-out instructions where
                    required.
                  </PolicyBlock>

                  <PolicyBlock id="security" title="Security">
                    We use reasonable technical and organizational measures to
                    protect information, such as access controls, encryption in
                    transit, and monitoring. No method of transmission or
                    storage is 100% secure—so we can’t guarantee absolute
                    security.
                  </PolicyBlock>

                  <PolicyBlock id="retention" title="Data retention">
                    We retain personal information only as long as necessary to
                    provide the Service, comply with legal obligations, resolve
                    disputes, and enforce agreements. Customize with your actual
                    retention periods (e.g., logs retained for X days).
                  </PolicyBlock>

                  <PolicyBlock id="rights" title="Your rights">
                    Depending on where you live, you may have rights to access,
                    correct, delete, or export your personal information, and to
                    object or restrict certain processing. To exercise rights,
                    contact us at{" "}
                    <span className="font-medium text-slate-900">
                      {contactEmail}
                    </span>
                    .
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                      <div className="text-sm font-semibold text-slate-900">
                        Practical note
                      </div>
                      <Muted className="mt-1">
                        If your account is managed by an institution, some
                        requests may need to go through your campus
                        administrator.
                      </Muted>
                    </div>
                  </PolicyBlock>

                  <PolicyBlock
                    id="children"
                    title="Children / student users"
                    tag="Campus note"
                  >
                    If the Service is used in an educational context, the
                    institution may control accounts and permissions. If you
                    knowingly collect information from children, ensure you
                    comply with applicable laws and institutional policies.
                    Customize this section based on your target user base and
                    jurisdiction.
                  </PolicyBlock>

                  <PolicyBlock id="changes" title="Changes to this policy">
                    We may update this Privacy Policy from time to time. If
                    changes are material, we will provide notice as required
                    (e.g., by posting an updated effective date or in-app
                    notice).
                  </PolicyBlock>

                  <PolicyBlock id="contact" title="Contact" tag="Support">
                    Questions about this Privacy Policy? Email{" "}
                    <span className="font-medium text-slate-900">
                      {contactEmail}
                    </span>
                    .
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="text-xs font-medium text-slate-500">
                        Data controller (optional)
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {companyName}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        Replace with your legal entity address and DPO/contact
                        details (if applicable).
                      </div>
                    </div>
                  </PolicyBlock>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Muted>Last updated: {effectiveDate}</Muted>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => jumpTo("summary")}
                      >
                        Back to top
                      </Button>
                      <Button variant="primary" href="/terms">
                        Terms
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Section>

        <div className="h-10" />
      </div>
    </div>
  );
}
