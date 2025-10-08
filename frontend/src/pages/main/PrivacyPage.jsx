import React, { useEffect, useRef, useState } from "react";

export default function PrivacyPolicy({
  companyName = "Acme, Inc.",
  lastUpdated = "August 22, 2025",
  contactEmail = "privacy@example.com",
  dpoEmail = "dpo@example.com",
  companyAddress = "123 Example Street, City, Country",
}) {
  const contentRef = useRef(null);
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
    if (window.bootstrap && contentRef.current) {
      new window.bootstrap.ScrollSpy(document.body, {
        target: "#ppSideNav",
        offset: 100,
      });
    }
    const onScroll = () => setAffixed(window.scrollY > 120);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="bg-light py-5" ref={contentRef}>
      <div className="container">
        {/* Header */}
        <header className="mb-4 text-center">
          <span className="badge text-bg-success rounded-pill mb-3">
            Privacy
          </span>
          <h1 className="display-5 fw-bold mb-2">Privacy Policy</h1>
          <p className="text-muted mb-0">
            Last updated{" "}
            <time dateTime={new Date(lastUpdated).toISOString()}>
              {lastUpdated}
            </time>
          </p>
        </header>

        <div className="row g-4">
          {/* Side Navigation */}
          <aside className="col-lg-3">
            <div
              id="ppSideNav"
              className={`card border-0 shadow-sm ${affixed ? "position-sticky" : ""}`}
              style={affixed ? { top: 88 } : {}}
            >
              <div className="card-body p-3">
                <nav
                  className="nav nav-pills flex-column small"
                  aria-label="Privacy sections"
                >
                  {sections.map((s) => (
                    <a key={s.id} className="nav-link" href={`#${s.id}`}>
                      {s.title}
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <section className="col-lg-9">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 p-md-5">
                <Section id="intro" title="Introduction">
                  <p>
                    This Privacy Policy explains how{" "}
                    <strong>{companyName}</strong> ("we", "us", or "our")
                    collects, uses, discloses, and safeguards information when
                    you use our websites, apps, and related services
                    (collectively, the "Services"). By using the Services, you
                    acknowledge that you have read and understood this Policy.
                  </p>
                </Section>

                <Section id="scope" title="Scope">
                  <p>
                    This Policy applies to personal information processed by{" "}
                    {companyName} in connection with the Services. It does not
                    apply to third‑party sites or services that we do not own or
                    control.
                  </p>
                </Section>

                <Section id="datawecollect" title="Data We Collect">
                  <ul>
                    <li>
                      <strong>Account & Contact Data</strong> (e.g., name,
                      email, password, phone, address).
                    </li>
                    <li>
                      <strong>Usage Data</strong> (e.g., pages viewed, buttons
                      clicked, referring URLs, device identifiers, IP, browser
                      type, operating system, language, app version).
                    </li>
                    <li>
                      <strong>Transaction Data</strong> (e.g., order history,
                      subscription status, partial payment info—never full card
                      numbers if we use a PCI‑compliant processor).
                    </li>
                    <li>
                      <strong>User Content</strong> (e.g., uploads, messages,
                      reviews) that you choose to provide.
                    </li>
                    <li>
                      <strong>Location Data</strong> (approximate or precise)
                      when you allow it through device settings.
                    </li>
                  </ul>
                </Section>

                <Section id="howweuse" title="How We Use Data">
                  <ul>
                    <li>Provide, operate, and improve the Services.</li>
                    <li>
                      Create and manage accounts; process transactions and
                      customer support.
                    </li>
                    <li>Personalize content and measure engagement.</li>
                    <li>
                      Detect, prevent, and respond to security incidents and
                      abuse.
                    </li>
                    <li>
                      Comply with legal obligations and enforce our terms.
                    </li>
                    <li>
                      With your consent, send marketing communications (you may
                      opt out any time).
                    </li>
                  </ul>
                </Section>

                <Section id="legalbases" title="Legal Bases (GDPR)">
                  <p>
                    Where the GDPR applies, we rely on the following bases for
                    processing:
                  </p>
                  <ul>
                    <li>
                      <strong>Contract</strong> — to provide the Services you
                      request.
                    </li>
                    <li>
                      <strong>Legitimate Interests</strong> — e.g., to secure,
                      improve, and market our Services in a way that respects
                      your rights.
                    </li>
                    <li>
                      <strong>Consent</strong> — for optional cookies,
                      marketing, and certain location/analytics processing.
                    </li>
                    <li>
                      <strong>Legal Obligation</strong> — to comply with
                      applicable laws.
                    </li>
                  </ul>
                </Section>

                <Section id="cookies" title="Cookies & Similar Tech">
                  <p>
                    We use cookies, local storage, and similar technologies to
                    remember settings, maintain sessions, and analyze traffic.
                  </p>
                </Section>

                <Section id="analytics" title="Analytics & Ads">
                  <p>
                    We may use analytics tools to understand usage and improve
                    performance. We may also work with advertising partners for
                    interest‑based ads.
                  </p>
                </Section>

                <Section id="sharing" title="Data Sharing & Transfers">
                  <ul>
                    <li>
                      <strong>Vendors & Service Providers</strong> that process
                      data on our behalf (e.g., hosting, payments, analytics)
                      under contracts that restrict their use of the data.
                    </li>
                    <li>
                      <strong>Legal & Safety</strong> disclosures when required
                      by law or to protect rights, property, and safety.
                    </li>
                    <li>
                      <strong>Business Transfers</strong> in connection with a
                      merger, acquisition, financing, or sale of assets.
                    </li>
                    <li>
                      <strong>International Transfers</strong> may occur; where
                      applicable, we implement appropriate safeguards such as
                      standard contractual clauses.
                    </li>
                  </ul>
                </Section>

                <Section id="retention" title="Data Retention">
                  <p>
                    We keep personal data only as long as necessary for the
                    purposes described in this Policy, to comply with legal
                    obligations, resolve disputes, and enforce agreements.
                    Retention periods vary by data type and context.
                  </p>
                </Section>

                <Section id="yourrights" title="Your Rights">
                  <p>
                    Depending on your location, you may have rights such as:
                  </p>
                  <ul>
                    <li>Access, correct, update, or delete your data.</li>
                    <li>Portability (receive a copy in a usable format).</li>
                    <li>Object to or restrict certain processing.</li>
                    <li>
                      Withdraw consent where processing is based on consent.
                    </li>
                    <li>
                      Appeal decisions and lodge complaints with a supervisory
                      authority.
                    </li>
                  </ul>

                  <div className="table-responsive">
                    <table className="table table-sm align-middle">
                      <thead>
                        <tr>
                          <th scope="col">Request</th>
                          <th scope="col">How to Make It</th>
                          <th scope="col">Verification</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Access / Portability</td>
                          <td>
                            Email{" "}
                            <a href={`mailto:${contactEmail}`}>
                              {contactEmail}
                            </a>{" "}
                            with subject “Data Access”.
                          </td>
                          <td>
                            We may ask for account email verification or
                            additional info.
                          </td>
                        </tr>
                        <tr>
                          <td>Deletion</td>
                          <td>
                            Email{" "}
                            <a href={`mailto:${contactEmail}`}>
                              {contactEmail}
                            </a>{" "}
                            with subject “Delete My Data”.
                          </td>
                          <td>
                            We may need to retain certain data as required by
                            law.
                          </td>
                        </tr>
                        <tr>
                          <td>Opt‑out of Marketing</td>
                          <td>
                            Use unsubscribe links in emails or contact us.
                          </td>
                          <td>Processed within a reasonable timeframe.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Section>

                <Section id="security" title="Security">
                  <p>
                    We implement administrative, technical, and physical
                    safeguards appropriate to the risk. No method of
                    transmission over the Internet or method of electronic
                    storage is 100% secure.
                  </p>
                </Section>

                <Section id="breach" title="Data Breach Notifications">
                  <p>
                    In the event of a data breach affecting your personal
                    information, we will notify you and/or relevant authorities
                    as required by applicable law.
                  </p>
                </Section>

                <Section id="children" title="Children’s Privacy">
                  <p>
                    Our Services are not directed to children under the age of
                    13 (or as defined by local law). We do not knowingly collect
                    personal data from children without appropriate parental
                    consent.
                  </p>
                </Section>

                <Section id="dnt" title="Do Not Track">
                  <p>
                    Some browsers offer a “Do Not Track” (DNT) signal. Because
                    no common industry standard is adopted, we do not respond to
                    DNT signals at this time. We will update this notice if that
                    changes.
                  </p>
                </Section>

                <Section id="changes" title="Changes to This Policy">
                  <p>
                    We may update this Policy from time to time. Material
                    changes will be indicated by updating the “Last updated”
                    date above and, when appropriate, additional notice within
                    the Services.
                  </p>
                </Section>

                <Section id="contact" title="Contact Us">
                  <address className="mb-3">
                    <div>
                      <strong>{companyName}</strong>
                    </div>
                    <div>{companyAddress}</div>
                    <div>
                      Privacy inquiries:{" "}
                      <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                    </div>
                    <div>
                      Data Protection Officer:{" "}
                      <a href={`mailto:${dpoEmail}`}>{dpoEmail}</a>
                    </div>
                  </address>

                  <div className="d-flex flex-wrap gap-2">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => window.print()}
                    >
                      Print
                    </button>
                    <a className="btn btn-outline-primary" href="#intro">
                      Back to top
                    </a>
                  </div>
                </Section>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Section({ id, title, children }) {
  return (
    <section id={id} className="pt-4 mb-4">
      <h2 className="h4 fw-bold mb-3">
        <a
          href={`#${id}`}
          className="link-underline link-underline-opacity-0 link-dark"
        >
          {title}
        </a>
      </h2>
      <div className="text-body-secondary lh-lg">{children}</div>
    </section>
  );
}
