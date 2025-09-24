import React, { useEffect, useRef, useState } from "react";

export default function TermsOfService({
  companyName = "Acme, Inc.",
  lastUpdated = "August 22, 2025",
  contactEmail = "support@example.com",
}) {
  const contentRef = useRef(null);
  const [affixed, setAffixed] = useState(false);

  useEffect(() => {
    if (window.bootstrap && contentRef.current) {
      new window.bootstrap.ScrollSpy(document.body, {
        target: "#tosSideNav",
        offset: 100,
      });
    }

    const onScroll = () => {
      setAffixed(window.scrollY > 120);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "acceptance", title: "Acceptance of Terms" },
    { id: "changes", title: "Changes to the Terms" },
    { id: "eligibility", title: "Eligibility & Accounts" },
    { id: "use", title: "Permitted & Prohibited Use" },
    { id: "content", title: "User Content & IP" },
    { id: "subscriptions", title: "Subscriptions, Billing & Refunds" },
    { id: "privacy", title: "Privacy & Data" },
    { id: "security", title: "Security" },
    { id: "thirdparty", title: "Third‑Party Services" },
    { id: "termination", title: "Termination" },
    { id: "disclaimers", title: "Disclaimers" },
    { id: "limitation", title: "Limitation of Liability" },
    { id: "indemnity", title: "Indemnification" },
    { id: "governinglaw", title: "Governing Law & Disputes" },
    { id: "misc", title: "Miscellaneous" },
    { id: "contact", title: "Contact" },
  ];

  return (
    <main className="bg-light py-5" ref={contentRef}>
      <div className="container">
        {/* Header */}
        <header className="mb-4 text-center">
          <span className="badge text-bg-primary rounded-pill mb-3">Legal</span>
          <h1 className="display-5 fw-bold mb-2">Terms of Service</h1>
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
              id="tosSideNav"
              className={`card border-0 shadow-sm ${affixed ? "position-sticky" : ""}`}
              style={affixed ? { top: 88 } : {}}
            >
              <div className="card-body p-3">
                <nav
                  className="nav nav-pills flex-column small"
                  aria-label="Terms sections"
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

          {/* Content */}
          <section className="col-lg-9">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 p-md-5">
                <Section id="introduction" title="Introduction">
                  <p>
                    These Terms of Service (the "Terms") govern your access to
                    and use of <strong>{companyName}</strong>'s websites,
                    applications, and services (collectively, the "Services").
                    By accessing or using the Services, you agree to be bound by
                    these Terms.
                  </p>
                </Section>

                <Section id="acceptance" title="Acceptance of Terms">
                  <p>
                    By creating an account, accessing, or using the Services,
                    you confirm that you can form a binding contract with{" "}
                    {companyName}, and you agree to comply with these Terms and
                    all applicable laws.
                  </p>
                </Section>

                <Section id="changes" title="Changes to the Terms">
                  <p>
                    We may modify these Terms from time to time. Material
                    changes will be notified by updating the date above and,
                    where appropriate, by additional notice within the Services.
                    Continued use after changes constitutes acceptance of the
                    updated Terms.
                  </p>
                </Section>

                <Section id="eligibility" title="Eligibility & Accounts">
                  <ul>
                    <li>
                      You must be at least the age of majority in your
                      jurisdiction.
                    </li>
                    <li>
                      You are responsible for safeguarding your account
                      credentials and for all activities under your account.
                    </li>
                    <li>
                      Provide accurate information and keep it up‑to‑date; we
                      may suspend or terminate accounts with inaccurate
                      information.
                    </li>
                  </ul>
                </Section>

                <Section id="use" title="Permitted & Prohibited Use">
                  <p>When using the Services, you agree not to:</p>
                  <ul>
                    <li>Violate any applicable law or regulation.</li>
                    <li>Infringe intellectual property or privacy rights.</li>
                    <li>
                      Introduce malware, disrupt servers, or attempt
                      unauthorized access.
                    </li>
                    <li>
                      Scrape or harvest data except as explicitly permitted.
                    </li>
                    <li>
                      Use the Services for unlawful, harmful, or abusive
                      activities.
                    </li>
                  </ul>
                </Section>

                <Section id="content" title="User Content & IP">
                  <p>
                    You retain ownership of content you submit ("User Content").
                    You grant {companyName} a worldwide, non‑exclusive,
                    royalty‑free license to host, store, reproduce, modify, and
                    display User Content for the purpose of operating and
                    improving the Services. See our Privacy section for how we
                    handle personal data.
                  </p>
                </Section>

                <Section
                  id="subscriptions"
                  title="Subscriptions, Billing & Refunds"
                >
                  <ul>
                    <li>
                      Paid features may be offered on a subscription basis.
                    </li>
                    <li>
                      Fees, billing cycles, and cancellation terms will be
                      disclosed at purchase. Unless required by law, fees are
                      non‑refundable.
                    </li>
                    <li>
                      We may change pricing with reasonable prior notice to you.
                    </li>
                  </ul>
                </Section>

                <Section id="privacy" title="Privacy & Data">
                  <p>
                    Our collection and use of personal information are described
                    in our Privacy Policy. By using the Services, you consent to
                    such processing as described therein and in these Terms.
                  </p>
                </Section>

                <Section id="security" title="Security">
                  <p>
                    We use commercially reasonable safeguards to protect the
                    Services; however, no method of transmission or storage is
                    completely secure. You are responsible for configuring your
                    information technology and using your own virus protection.
                  </p>
                </Section>

                <Section id="thirdparty" title="Third‑Party Services">
                  <p>
                    The Services may link to or integrate with third‑party
                    websites, products, or services that are not owned or
                    controlled by {companyName}. We are not responsible for
                    their content, policies, or practices.
                  </p>
                </Section>

                <Section id="termination" title="Termination">
                  <p>
                    We may suspend or terminate your access to the Services at
                    any time, with or without cause or notice, including if you
                    breach these Terms. Upon termination, certain provisions
                    will survive, including ownership, warranty disclaimers, and
                    limitations of liability.
                  </p>
                </Section>

                <Section id="disclaimers" title="Disclaimers">
                  <p className="mb-2">
                    THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
                    WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED,
                    INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
                    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
                    NON‑INFRINGEMENT.
                  </p>
                  <p>
                    {companyName} does not warrant that the Services will be
                    uninterrupted, secure, or free from errors or harmful
                    components.
                  </p>
                </Section>

                <Section id="limitation" title="Limitation of Liability">
                  <p>
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, {companyName} AND
                    ITS AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT,
                    INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR
                    ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY
                    OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER
                    INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF
                    THE SERVICES.
                  </p>
                </Section>

                <Section id="indemnity" title="Indemnification">
                  <p>
                    You agree to defend, indemnify, and hold harmless{" "}
                    {companyName}, its affiliates, and their respective
                    officers, directors, employees, and agents from and against
                    any claims, liabilities, damages, losses, and expenses,
                    including without limitation reasonable legal and accounting
                    fees, arising out of or in any way connected with your use
                    of the Services or your breach of these Terms.
                  </p>
                </Section>

                <Section id="governinglaw" title="Governing Law & Disputes">
                  <p>
                    These Terms are governed by the laws of your principal place
                    of business for
                    {companyName}, without regard to its conflicts of laws
                    rules. Disputes will be resolved in the courts located in
                    that jurisdiction unless otherwise required by applicable
                    law.
                  </p>
                </Section>

                <Section id="misc" title="Miscellaneous">
                  <ul>
                    <li>
                      <strong>Entire Agreement.</strong> These Terms constitute
                      the entire agreement between you and {companyName}{" "}
                      regarding the Services.
                    </li>
                    <li>
                      <strong>Severability.</strong> If any provision is held
                      invalid, the remaining provisions remain in full force and
                      effect.
                    </li>
                    <li>
                      <strong>No Waiver.</strong> Failure to enforce any right
                      will not be deemed a waiver of such right.
                    </li>
                    <li>
                      <strong>Assignment.</strong> You may not assign these
                      Terms without our prior written consent.
                    </li>
                  </ul>
                </Section>

                <Section id="contact" title="Contact">
                  <p>
                    Questions? We're here to help. Reach us at{" "}
                    <a href={`mailto:${contactEmail}`}>{contactEmail}</a> or use
                    the button below.
                  </p>

                  <button
                    className="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#contactModal"
                    type="button"
                  >
                    Contact {companyName}
                  </button>
                </Section>

                {/* Actions */}
                <div className="d-flex flex-wrap gap-2 mt-4">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => window.print()}
                  >
                    <i className="bi bi-printer me-2" aria-hidden="true"></i>
                    Print
                  </button>
                  <a className="btn btn-outline-primary" href="#introduction">
                    Back to top
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div
        className="modal fade"
        id="contactModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Contact {companyName}</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="mb-3">
                  <label htmlFor="contactEmail" className="form-label">
                    Your email
                  </label>
                  <input
                    id="contactEmail"
                    type="email"
                    className="form-control"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="contactMsg" className="form-label">
                    Message
                  </label>
                  <textarea
                    id="contactMsg"
                    className="form-control"
                    rows={4}
                    placeholder="How can we help?"
                    required
                  />
                </div>
                <div className="form-text">
                  This demo form does not submit anywhere.
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button type="button" className="btn btn-primary" disabled>
                Send
              </button>
            </div>
          </div>
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
