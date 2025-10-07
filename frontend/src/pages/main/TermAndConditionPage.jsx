import React, { useEffect, useState } from "react";

export default function TermsOfService({
  companyName = "Acme, Inc.",
  lastUpdated = "August 22, 2025",
  contactEmail = "support@example.com",
}) {
  const [affixed, setAffixed] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
    { id: "thirdparty", title: "Third-Party Services" },
    { id: "termination", title: "Termination" },
    { id: "disclaimers", title: "Disclaimers" },
    { id: "limitation", title: "Limitation of Liability" },
    { id: "indemnity", title: "Indemnification" },
    { id: "governinglaw", title: "Governing Law & Disputes" },
    { id: "misc", title: "Miscellaneous" },
    { id: "contact", title: "Contact" },
  ];

  useEffect(() => {
    const handleScroll = () => setAffixed(window.scrollY > 120);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="bg-gradient-to-br from-white via-emerald-50 to-white text-gray-800 py-16 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-3 inline-block">
            Legal
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            Terms of Service
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
              id="tosSideNav"
              className="flex flex-col p-4 text-sm space-y-1"
              aria-label="Terms sections"
            >
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block px-3 py-2 rounded-lg hover:bg-blue-50 text-gray-600 hover:text-blue-700 transition"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </aside>

          <section className="lg:col-span-3 bg-white shadow-md border border-gray-100 rounded-xl p-6 md:p-10 leading-relaxed space-y-8">
            <Section id="introduction" title="Introduction">
              <p>
                These Terms of Service (the "Terms") govern your access to and
                use of <strong>{companyName}</strong>'s websites, applications,
                and services. By accessing or using the Services, you agree to
                be bound by these Terms.
              </p>
            </Section>

            <Section id="acceptance" title="Acceptance of Terms">
              <p>
                By creating an account, accessing, or using the Services, you
                confirm that you can form a binding contract with {companyName}.
              </p>
            </Section>

            <Section id="changes" title="Changes to the Terms">
              <p>
                We may modify these Terms from time to time. Material changes
                will be indicated by updating the date above. Continued use
                constitutes acceptance.
              </p>
            </Section>

            <Section id="eligibility" title="Eligibility & Accounts">
              <ul className="list-disc ml-5 space-y-1">
                <li>You must be of legal age to use our Services.</li>
                <li>
                  You’re responsible for safeguarding your account credentials.
                </li>
                <li>
                  Provide accurate info; accounts with false data may be
                  suspended.
                </li>
              </ul>
            </Section>

            <Section id="use" title="Permitted & Prohibited Use">
              <p>When using the Services, you agree not to:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Violate laws or regulations.</li>
                <li>Infringe intellectual property or privacy rights.</li>
                <li>Introduce malware or disrupt servers.</li>
                <li>Scrape or harvest data without consent.</li>
              </ul>
            </Section>

            <Section id="content" title="User Content & IP">
              <p>
                You retain ownership of content you upload. You grant{" "}
                {companyName} a non-exclusive license to use and display it to
                operate the Services.
              </p>
            </Section>

            <Section
              id="subscriptions"
              title="Subscriptions, Billing & Refunds"
            >
              <ul className="list-disc ml-5 space-y-1">
                <li>Paid features may be offered on a subscription basis.</li>
                <li>Fees are disclosed at purchase and are non-refundable.</li>
                <li>We may change pricing with reasonable notice.</li>
              </ul>
            </Section>

            <Section id="privacy" title="Privacy & Data">
              <p>
                See our Privacy Policy for how we collect and use personal
                information.
              </p>
            </Section>

            <Section id="security" title="Security">
              <p>
                We use reasonable safeguards to protect your data, but no system
                is entirely secure. Use your own virus protection.
              </p>
            </Section>

            <Section id="thirdparty" title="Third-Party Services">
              <p>
                The Services may link to third-party products or sites not
                controlled by {companyName}. We are not responsible for their
                content or policies.
              </p>
            </Section>

            <Section id="termination" title="Termination">
              <p>
                We may suspend or terminate your access to the Services if you
                breach these Terms. Some sections survive termination.
              </p>
            </Section>

            <Section id="disclaimers" title="Disclaimers">
              <p className="mb-2">
                THE SERVICES ARE PROVIDED “AS IS” WITHOUT WARRANTIES OF ANY
                KIND, EXPRESS OR IMPLIED.
              </p>
              <p>
                {companyName} does not guarantee the Services will be
                uninterrupted, secure, or error-free.
              </p>
            </Section>

            <Section id="limitation" title="Limitation of Liability">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, {companyName} SHALL NOT
                BE LIABLE FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.
              </p>
            </Section>

            <Section id="indemnity" title="Indemnification">
              <p>
                You agree to indemnify and hold harmless {companyName} and its
                affiliates from claims arising from your use of the Services.
              </p>
            </Section>

            <Section id="governinglaw" title="Governing Law & Disputes">
              <p>
                These Terms are governed by the laws applicable to {companyName}
                ’s principal business location.
              </p>
            </Section>

            <Section id="misc" title="Miscellaneous">
              <ul className="list-disc ml-5 space-y-1">
                <li>
                  <strong>Entire Agreement:</strong> These Terms are the full
                  agreement between you and {companyName}.
                </li>
                <li>
                  <strong>Severability:</strong> Invalid terms don’t affect the
                  rest.
                </li>
                <li>
                  <strong>No Waiver:</strong> Failure to enforce is not a
                  waiver.
                </li>
                <li>
                  <strong>Assignment:</strong> You may not assign these Terms
                  without consent.
                </li>
              </ul>
            </Section>

            <Section id="contact" title="Contact">
              <p>
                Questions? Contact us at{" "}
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-blue-600 underline"
                >
                  {contactEmail}
                </a>
                .
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="px-5 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Contact {companyName}
              </button>
            </Section>

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                🖨️ Print
              </button>
              <a
                href="#introduction"
                className="px-5 py-2 rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
              >
                Back to top
              </a>
            </div>
          </section>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-3">Contact {companyName}</h3>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Your email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Message
                </label>
                <textarea
                  rows="4"
                  placeholder="How can we help?"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <p className="text-sm text-gray-500">
                This demo form does not submit anywhere.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled
                  className="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold cursor-not-allowed opacity-80"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function Section({ id, title, children }) {
  return (
    <section id={id}>
      <h2 className="text-xl font-semibold mb-2 text-blue-700">
        <a href={`#${id}`} className="hover:underline">
          {title}
        </a>
      </h2>
      <div className="text-gray-700 space-y-2">{children}</div>
    </section>
  );
}
