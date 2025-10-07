import React, { useEffect, useRef, useState } from "react";

export default function PrivacyPolicy({
  companyName = "Acme, Inc.",
  lastUpdated = "August 22, 2025",
  contactEmail = "privacy@example.com",
  dpoEmail = "dpo@example.com",
  companyAddress = "123 Example Street, City, Country",
}) {
  const [affixed, setAffixed] = useState(false);

  const sections = [
    { id: "intro", title: "Introduction" },
    { id: "scope", title: "Scope" },
    { id: "datawecollect", title: "Data We Collect" },
    { id: "howweuse", title: "How We Use Data" },
    { id: "legalbases", title: "Legal Bases (GDPR)" },
    { id: "cookies", title: "Cookies & Similar Tech" },
    { id: "analytics", title: "Analytics & Ads" },
    { id: "sharing", title: "Data Sharing & Transfers" },
    { id: "retention", title: "Data Retention" },
    { id: "yourrights", title: "Your Rights" },
    { id: "security", title: "Security" },
    { id: "breach", title: "Data Breach Notifications" },
    { id: "children", title: "Children’s Privacy" },
    { id: "dnt", title: "Do Not Track" },
    { id: "changes", title: "Changes to This Policy" },
    { id: "contact", title: "Contact Us" },
  ];

  useEffect(() => {
    const handleScroll = () => setAffixed(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="bg-gradient-to-br from-white via-emerald-50 to-white text-gray-800 py-16 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-3 inline-block">
            Privacy
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            Privacy Policy
          </h1>
          <p className="text-gray-500">
            Last updated{" "}
            <time dateTime={new Date(lastUpdated).toISOString()}>
              {lastUpdated}
            </time>
          </p>
        </header>

        <div className="grid lg:grid-cols-4 gap-8">
          <aside
            className={`${
              affixed ? "sticky top-20" : ""
            } hidden lg:block bg-white shadow-sm rounded-xl border border-gray-100 h-fit`}
          >
            <nav
              id="ppSideNav"
              className="flex flex-col p-4 text-sm space-y-1"
              aria-label="Privacy sections"
            >
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block px-3 py-2 rounded-lg hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 transition"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </aside>

          <section className="lg:col-span-3 bg-white shadow-md border border-gray-100 rounded-xl p-6 md:p-10 leading-relaxed space-y-8">
            <Section id="intro" title="Introduction">
              <p>
                This Privacy Policy explains how <strong>{companyName}</strong>{" "}
                ("we", "us", or "our") collects, uses, discloses, and safeguards
                information when you use our websites, apps, and related
                services (collectively, the "Services"). By using the Services,
                you acknowledge that you have read and understood this Policy.
              </p>
            </Section>

            <Section id="scope" title="Scope">
              <p>
                This Policy applies to personal information processed by{" "}
                {companyName}. It does not apply to third-party sites or
                services that we do not own or control.
              </p>
            </Section>

            <Section id="datawecollect" title="Data We Collect">
              <ul className="list-disc ml-5 space-y-1">
                <li>
                  <strong>Account & Contact Data:</strong> name, email,
                  password, phone, address.
                </li>
                <li>
                  <strong>Usage Data:</strong> pages viewed, IP, device,
                  browser.
                </li>
                <li>
                  <strong>Transaction Data:</strong> order history, payment
                  status.
                </li>
                <li>
                  <strong>User Content:</strong> uploads, reviews, messages.
                </li>
                <li>
                  <strong>Location Data:</strong> when allowed via device
                  settings.
                </li>
              </ul>
            </Section>

            <Section id="howweuse" title="How We Use Data">
              <ul className="list-disc ml-5 space-y-1">
                <li>Provide, operate, and improve the Services.</li>
                <li>Process accounts, transactions, and support.</li>
                <li>Personalize content and measure engagement.</li>
                <li>Detect and prevent abuse or security incidents.</li>
                <li>Comply with legal obligations.</li>
                <li>With your consent, send marketing communications.</li>
              </ul>
            </Section>

            <Section id="legalbases" title="Legal Bases (GDPR)">
              <ul className="list-disc ml-5 space-y-1">
                <li>
                  <strong>Contract</strong> — provide requested Services.
                </li>
                <li>
                  <strong>Legitimate Interests</strong> — improve & secure our
                  Services.
                </li>
                <li>
                  <strong>Consent</strong> — optional analytics or marketing.
                </li>
                <li>
                  <strong>Legal Obligation</strong> — comply with laws.
                </li>
              </ul>
            </Section>

            <Section id="cookies" title="Cookies & Similar Tech">
              <p>
                We use cookies and similar technologies to remember preferences,
                analyze traffic, and improve performance.
              </p>
            </Section>

            <Section id="analytics" title="Analytics & Ads">
              <p>
                We may use analytics tools to understand usage and improve the
                experience, and advertising partners for relevant ads.
              </p>
            </Section>

            <Section id="sharing" title="Data Sharing & Transfers">
              <ul className="list-disc ml-5 space-y-1">
                <li>
                  <strong>Vendors & Service Providers</strong> — for hosting,
                  analytics, etc.
                </li>
                <li>
                  <strong>Legal & Safety</strong> — to comply with laws or
                  protect rights.
                </li>
                <li>
                  <strong>Business Transfers</strong> — during mergers or
                  acquisitions.
                </li>
                <li>
                  <strong>International Transfers</strong> — safeguarded per
                  GDPR.
                </li>
              </ul>
            </Section>

            <Section id="retention" title="Data Retention">
              <p>
                We keep data only as long as needed for legal and business
                purposes, then securely delete or anonymize it.
              </p>
            </Section>

            <Section id="yourrights" title="Your Rights">
              <p>You may have rights such as:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Access, correct, or delete your data.</li>
                <li>Portability and restriction of processing.</li>
                <li>Withdraw consent or object to processing.</li>
              </ul>

              <div className="overflow-x-auto mt-4">
                <table className="min-w-full text-left border-collapse border border-gray-200 text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="border border-gray-200 px-3 py-2">
                        Request
                      </th>
                      <th className="border border-gray-200 px-3 py-2">
                        How to Make It
                      </th>
                      <th className="border border-gray-200 px-3 py-2">
                        Verification
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr>
                      <td className="border border-gray-200 px-3 py-2">
                        Access / Portability
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        Email{" "}
                        <a
                          href={`mailto:${contactEmail}`}
                          className="text-emerald-600 underline"
                        >
                          {contactEmail}
                        </a>{" "}
                        with subject “Data Access”.
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        We may verify your identity first.
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-3 py-2">
                        Deletion
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        Email{" "}
                        <a
                          href={`mailto:${contactEmail}`}
                          className="text-emerald-600 underline"
                        >
                          {contactEmail}
                        </a>{" "}
                        with subject “Delete My Data”.
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        Some data may be kept for compliance.
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-3 py-2">
                        Marketing Opt-Out
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        Use unsubscribe links or contact us.
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        Processed within a reasonable time.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            <Section id="security" title="Security">
              <p>
                We use technical and organizational safeguards appropriate to
                the risk, but no system is 100% secure.
              </p>
            </Section>

            <Section id="breach" title="Data Breach Notifications">
              <p>
                If a breach occurs, we’ll notify you and authorities as required
                by law.
              </p>
            </Section>

            <Section id="children" title="Children’s Privacy">
              <p>
                Our Services are not intended for children under 13. We don’t
                knowingly collect data from minors.
              </p>
            </Section>

            <Section id="dnt" title="Do Not Track">
              <p>
                We currently do not respond to DNT signals due to the absence of
                an industry standard.
              </p>
            </Section>

            <Section id="changes" title="Changes to This Policy">
              <p>
                We may update this Policy periodically. Material changes will be
                announced on this page.
              </p>
            </Section>

            <Section id="contact" title="Contact Us">
              <address className="not-italic mb-3 text-gray-700">
                <div>
                  <strong>{companyName}</strong>
                </div>
                <div>{companyAddress}</div>
                <div>
                  Privacy inquiries:{" "}
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-emerald-600 underline"
                  >
                    {contactEmail}
                  </a>
                </div>
                <div>
                  DPO:{" "}
                  <a
                    href={`mailto:${dpoEmail}`}
                    className="text-emerald-600 underline"
                  >
                    {dpoEmail}
                  </a>
                </div>
              </address>

              <div className="flex flex-wrap gap-3">
                <button
                  className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                  onClick={() => window.print()}
                >
                  Print
                </button>
                <a
                  href="#intro"
                  className="px-5 py-2 rounded-full border border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition"
                >
                  Back to top
                </a>
              </div>
            </Section>
          </section>
        </div>
      </div>
    </main>
  );
}

function Section({ id, title, children }) {
  return (
    <section id={id}>
      <h2 className="text-xl font-semibold mb-2 text-emerald-700">
        <a href={`#${id}`} className="hover:underline">
          {title}
        </a>
      </h2>
      <div className="text-gray-700 space-y-2">{children}</div>
    </section>
  );
}
