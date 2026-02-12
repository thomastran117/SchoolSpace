import { useMemo, useState } from "react";

import { Section } from "@common/Section";
import { Card } from "@common/Card";
import { HeroCard } from "@common/HeroCard";
import { Pill } from "@common/Pill";
import { Breadcrumb } from "@common/BreadCrumb";
import { Button } from "@common/Button";
import { H2, Lead, Muted } from "@common/Text";
import { BadgeDot } from "@common/BadgeDot";
import InlineCode from "@common/InlineCode";
import SectionLink from "@common/SectionLink";
import Divider from "@common/Divider";
import TermBlock from "@/components/main/TermBlock";
import Bullets from "@common/Bullets";

export default function TermsAndConditionsPage() {
  const effectiveDate = "February 3, 2026";
  const companyName = "SchoolSpace";
  const productName = "SchoolSpace Platform";
  const contactEmail = "support@school.com";
  const jurisdiction = "Ontario, Canada";

  const sections = useMemo(
    () => [
      { id: "intro", title: "1. Agreement to Terms" },
      { id: "eligibility", title: "2. Eligibility & Accounts" },
      { id: "acceptable", title: "3. Acceptable Use" },
      { id: "content", title: "4. User Content" },
      { id: "privacy", title: "5. Privacy" },
      { id: "payments", title: "6. Payments (if applicable)" },
      { id: "ip", title: "7. Intellectual Property" },
      { id: "thirdparty", title: "8. Third-Party Services" },
      { id: "availability", title: "9. Availability & Changes" },
      { id: "termination", title: "10. Suspension & Termination" },
      { id: "disclaimers", title: "11. Disclaimers" },
      { id: "liability", title: "12. Limitation of Liability" },
      { id: "indemnity", title: "13. Indemnification" },
      { id: "law", title: "14. Governing Law" },
      { id: "contact", title: "15. Contact" },
    ],
    [],
  );

  const [activeId, setActiveId] = useState(sections[0]?.id ?? "intro");

  const jumpTo = (id: string) => {
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Calm top gradient wash */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-gradient-to-b from-indigo-50 via-white to-transparent" />

      <div className="relative">
        <Section className="pt-10 md:pt-12" containerClassName="space-y-6">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Terms", current: true },
            ]}
          />

          <HeroCard
            tone="soft"
            eyebrow={
              <span className="inline-flex items-center gap-2">
                <BadgeDot />
                Legal • Terms & Conditions
              </span>
            }
            badge={{ text: "Template", variant: "info" }}
            title="Terms & Conditions"
            subtitle="Clear, admin-friendly terms with minimal clutter. Replace placeholders with your official legal text."
            primaryAction={{
              label: "Contact support",
              href: "/contact",
              variant: "primary",
            }}
            secondaryAction={{
              label: "Privacy policy",
              href: "/privacy",
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
                <Pill>Muted slate text</Pill>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.print()}>
                  Print
                </Button>
                <Button
                  variant="ghost"
                  className="text-slate-700"
                  onClick={() => jumpTo("contact")}
                >
                  Need help?
                </Button>
              </div>
            </div>
          </HeroCard>
        </Section>

        <Section>
          <div className="grid gap-6 md:grid-cols-12">
            {/* Table of contents */}
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
                  Click to jump. This page is designed for readability and calm
                  scanning.
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
                    Placeholders
                  </div>
                  <Muted className="mt-1">
                    Search for <InlineCode>SchoolSpace</InlineCode> and update
                    all values.
                  </Muted>
                </div>
              </Card>
            </div>

            {/* Terms content */}
            <div className="md:col-span-8">
              <Card className="p-7">
                <div className="max-w-3xl">
                  <H2>Overview</H2>
                  <Lead className="mt-2">
                    These Terms govern use of {productName} (“Service”),
                    operated by {companyName}
                    (“we”, “us”). By accessing or using the Service, you agree
                    to these Terms.
                  </Lead>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-xs font-medium text-slate-500">
                      Effective date
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">
                      {effectiveDate}
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      This is a template. Consider having counsel review before
                      publishing.
                    </div>
                  </div>

                  <Divider />

                  <TermBlock id="intro" title="1. Agreement to Terms">
                    If you access or use the Service, you confirm that you have
                    read, understood, and agree to be bound by these Terms. If
                    you do not agree, do not use the Service.
                  </TermBlock>

                  <TermBlock id="eligibility" title="2. Eligibility & Accounts">
                    You must provide accurate account information and maintain
                    the security of your credentials. You are responsible for
                    activity under your account.
                    <Bullets
                      items={[
                        "Keep your password secure and do not share access.",
                        "Notify us promptly of suspected unauthorized use.",
                        "You may be required to verify your email or identity for certain features.",
                      ]}
                    />
                  </TermBlock>

                  <TermBlock id="acceptable" title="3. Acceptable Use">
                    You agree not to misuse the Service. Examples of prohibited
                    conduct include:
                    <Bullets
                      items={[
                        "Attempting to gain unauthorized access to accounts, systems, or data.",
                        "Uploading malware, scraping, or interfering with normal operation.",
                        "Using the Service to harass, abuse, or violate others’ rights.",
                        "Violating applicable laws or campus/university policies.",
                      ]}
                    />
                    We may suspend or terminate access for violations.
                  </TermBlock>

                  <TermBlock id="content" title="4. User Content">
                    You may post or upload content (e.g., event details, club
                    descriptions, images). You retain ownership of your content,
                    but you grant us a license to host, store, reproduce, and
                    display it as necessary to operate the Service.
                    <Bullets
                      items={[
                        "You must have rights to any content you upload.",
                        "We may remove content that violates these Terms or applicable policies.",
                        "You are responsible for your content’s accuracy and legality.",
                      ]}
                    />
                  </TermBlock>

                  <TermBlock id="privacy" title="5. Privacy">
                    Our handling of personal information is described in our
                    Privacy Policy. By using the Service, you consent to the
                    collection and use of information as described there. If
                    your use is through an institution, additional institutional
                    policies may apply.
                  </TermBlock>

                  <TermBlock id="payments" title="6. Payments (if applicable)">
                    If the Service includes paid features, you agree to provide
                    valid payment information and authorize charges. Fees are
                    generally non-refundable unless required by law or
                    explicitly stated.
                    <Bullets
                      items={[
                        "Taxes may apply depending on jurisdiction.",
                        "We may change pricing with prior notice when feasible.",
                        "Chargebacks or fraud may result in account restrictions.",
                      ]}
                    />
                  </TermBlock>

                  <TermBlock id="ip" title="7. Intellectual Property">
                    The Service, including design, components, branding, and
                    non-user content, is owned by {companyName} or its licensors
                    and is protected by intellectual property laws. You may not
                    copy, modify, or distribute our materials without
                    permission.
                  </TermBlock>

                  <TermBlock id="thirdparty" title="8. Third-Party Services">
                    The Service may integrate with third parties (e.g., OAuth
                    providers, analytics, email). Your use of third-party
                    services is governed by their terms and privacy policies. We
                    are not responsible for third-party services.
                  </TermBlock>

                  <TermBlock
                    id="availability"
                    title="9. Availability & Changes"
                  >
                    We aim to keep the Service available, but it may be
                    interrupted due to maintenance, updates, or unforeseen
                    issues. We may modify or discontinue features at any time.
                    Where practical, we will provide notice of material changes.
                  </TermBlock>

                  <TermBlock
                    id="termination"
                    title="10. Suspension & Termination"
                  >
                    We may suspend or terminate your access if you violate these
                    Terms, if required by law, or to protect the Service and
                    users. You may stop using the Service at any time. Certain
                    sections (e.g., IP, disclaimers, limitation of liability)
                    survive termination.
                  </TermBlock>

                  <TermBlock id="disclaimers" title="11. Disclaimers">
                    The Service is provided on an “as is” and “as available”
                    basis. To the maximum extent permitted by law, we disclaim
                    warranties of merchantability, fitness for a particular
                    purpose, and non-infringement. We do not warrant that the
                    Service will be uninterrupted or error-free.
                  </TermBlock>

                  <TermBlock id="liability" title="12. Limitation of Liability">
                    To the maximum extent permitted by law, {companyName} will
                    not be liable for any indirect, incidental, special,
                    consequential, or punitive damages, or loss of profits or
                    data, arising from or related to your use of the Service.
                    Our total liability for claims relating to the Service is
                    limited to the amount you paid (if any) in the preceding 12
                    months, or a minimal amount required by law.
                  </TermBlock>

                  <TermBlock id="indemnity" title="13. Indemnification">
                    You agree to indemnify and hold harmless {companyName} from
                    claims, liabilities, damages, and expenses (including
                    reasonable legal fees) arising from your use of the Service,
                    your content, or your violation of these Terms.
                  </TermBlock>

                  <TermBlock id="law" title="14. Governing Law">
                    These Terms are governed by the laws of {jurisdiction},
                    without regard to conflict of laws rules. Any disputes will
                    be resolved in the courts located in that jurisdiction,
                    unless applicable law requires otherwise.
                  </TermBlock>

                  <TermBlock id="contact" title="15. Contact">
                    Questions about these Terms? Contact us at{" "}
                    <span className="font-medium text-slate-900">
                      {contactEmail}
                    </span>
                    .
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                      <div className="text-sm font-semibold text-slate-900">
                        Suggested footer
                      </div>
                      <Muted className="mt-1">
                        “If you are using the Service on behalf of an
                        institution, you represent that you have authority to
                        bind that institution to these Terms.”
                      </Muted>
                    </div>
                  </TermBlock>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Muted>Last updated: {effectiveDate}</Muted>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => jumpTo("intro")}>
                        Back to top
                      </Button>
                      <Button variant="primary" href="/privacy">
                        Privacy policy
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
