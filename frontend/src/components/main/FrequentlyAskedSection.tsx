import React from "react";

const FrequentlyAskedSection: React.FC = () => {
  return (
    <section className="faq container mt-5 text-center">
      <div className="section-header mb-4">
        <span className="section-badge">Support</span>
        <h2 className="section-title fw-bold mt-2">
          Frequently Asked Questions
        </h2>
        <p className="section-subtitle text-secondary mt-2">
          Everything you need to know about SchoolSpace.
        </p>
      </div>

      <div className="faq-wrapper mx-auto mt-4">
        <div className="accordion" id="faqAccordion">
          <div className="accordion-item faq-card">
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed fw-semibold"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#faq1"
              >
                Is SchoolSpace free to use?
              </button>
            </h2>
            <div id="faq1" className="accordion-collapse collapse">
              <div className="accordion-body text-secondary">
                Yes! All core features including course browsing, enrollment,
                and dashboard management are free.
              </div>
            </div>
          </div>

          <div className="accordion-item faq-card mt-3">
            <h2 className="accordion-header">
              <button
                className="accordion-button fw-semibold collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#faq2"
              >
                Do I need an account to enroll?
              </button>
            </h2>
            <div id="faq2" className="accordion-collapse collapse">
              <div className="accordion-body text-secondary">
                Yes, an account is required so we can securely track your course
                progress and history.
              </div>
            </div>
          </div>

          <div className="accordion-item faq-card mt-3">
            <h2 className="accordion-header">
              <button
                className="accordion-button fw-semibold collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#faq3"
              >
                How does personalized learning work?
              </button>
            </h2>
            <div id="faq3" className="accordion-collapse collapse">
              <div className="accordion-body text-secondary">
                SchoolSpace intelligently analyzes your academic interests and
                history to match you with ideal courses.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FrequentlyAskedSection;
