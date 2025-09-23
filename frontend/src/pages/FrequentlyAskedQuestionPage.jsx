import React from "react";

export default function FaqPage() {
  const faqs = [
    {
      q: "What is your service about?",
      a: "We provide modern web, mobile, and cloud solutions tailored to businesses of all sizes.",
    },
    {
      q: "How do I get started?",
      a: "You can sign up for free and explore our platform. Upgrade to Pro or Enterprise as your needs grow.",
    },
    {
      q: "Do you offer customer support?",
      a: "Yes! We provide community support for free users and priority 24/7 support for Pro and Enterprise customers.",
    },
    {
      q: "Can I change my plan later?",
      a: "Absolutely. You can upgrade, downgrade, or cancel at any time through your account dashboard.",
    },
    {
      q: "Is my data secure?",
      a: "We use industry-standard security practices, including encryption and regular audits, to keep your data safe.",
    },
  ];

  return (
    <div className="faq-page bg-light">
      <section
        className="py-5 text-center text-white"
        style={{
          background: "linear-gradient(135deg, #16a34a, #15803d)",
        }}
      >
        <div className="container">
          <h1 className="fw-bold display-4">Frequently Asked Questions</h1>
          <p className="lead mt-3">
            Find answers to the most common questions about our services.
          </p>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="accordion" id="faqAccordion">
            {faqs.map((item, idx) => (
              <div className="accordion-item border-0 shadow-sm mb-3" key={idx}>
                <h2 className="accordion-header" id={`heading${idx}`}>
                  <button
                    className="accordion-button collapsed fw-semibold"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse${idx}`}
                    aria-expanded="false"
                    aria-controls={`collapse${idx}`}
                  >
                    {item.q}
                  </button>
                </h2>
                <div
                  id={`collapse${idx}`}
                  className="accordion-collapse collapse"
                  aria-labelledby={`heading${idx}`}
                  data-bs-parent="#faqAccordion"
                >
                  <div className="accordion-body text-muted">{item.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5 bg-white text-center">
        <div className="container">
          <h2 className="fw-bold mb-3 text-success">Still have questions?</h2>
          <p className="mb-4 text-muted">
            Can’t find the answer you’re looking for? Reach out to our support
            team.
          </p>
          <a
            href="/contact"
            className="btn btn-success fw-semibold rounded-pill px-4 py-2 shadow-sm"
          >
            Contact Us
          </a>
        </div>
      </section>

      <section
        className="py-5 text-center text-white"
        style={{
          background: "linear-gradient(135deg, #15803d, #166534)",
        }}
      >
        <div className="container">
          <h2 className="fw-bold mb-3">We’re Here to Help</h2>
          <p className="mb-4">
            Whether you’re just starting out or scaling up, our team is ready to
            support you.
          </p>
          <a
            href="/get-started"
            className="btn btn-light text-success fw-semibold rounded-pill px-4 py-2 shadow-sm"
          >
            Get Started
          </a>
        </div>
      </section>
    </div>
  );
}
