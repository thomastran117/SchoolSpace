import React from "react";
import MainHeroCard from "../../components/main/MainHeroCard";
import SectionHeader from "../../components/main/SectionHeader";
import CallToActionSection from "../../components/main/CallToActionSection";
import "../../styles/main/FAQPage.css";

const FrequentlyAskedPage: React.FC = () => {
  return (
    <main className="service-page">
      <div className="service-page-gradient gradient-1" />
      <div className="service-page-gradient gradient-2" />

      <MainHeroCard
        badge="FAQ"
        title="Frequently Asked Questions"
        subtitle="Quick answers to common questions about SchoolSpace."
        primaryBtnText="Contact Support"
        primaryBtnIcon="bi bi-headset"
        primaryBtnLink="/contact"
      />

      <section className="service-section">
        <div className="container">
          <SectionHeader
            badge="Help Center"
            title="Find the answers you're looking for"
            subtitle="If you still need help, feel free to reach out anytime."
          />

          <div className="accordion premium-accordion mt-4" id="faqAccordion">
            <div className="accordion-item">
              <h2 className="accordion-header" id="faq1">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapse1"
                >
                  What is SchoolSpace?
                </button>
              </h2>
              <div
                id="collapse1"
                className="accordion-collapse collapse"
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body">
                  SchoolSpace is a modern academic platform that centralizes
                  communication, scheduling, and resources for students,
                  teachers, and administrators.
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header" id="faq2">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapse2"
                >
                  Is SchoolSpace free to use?
                </button>
              </h2>
              <div
                id="collapse2"
                className="accordion-collapse collapse"
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body">
                  Yes, we offer a free plan for smaller groups. Larger schools
                  may upgrade for enhanced features and admin controls.
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header" id="faq3">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapse3"
                >
                  Do you offer support?
                </button>
              </h2>
              <div
                id="collapse3"
                className="accordion-collapse collapse"
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body">
                  Absolutely. We provide support for all users, and premium
                  customers receive priority assistance.
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header" id="faq4">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapse4"
                >
                  Does SchoolSpace work on mobile?
                </button>
              </h2>
              <div
                id="collapse4"
                className="accordion-collapse collapse"
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body">
                  Yes—SchoolSpace works seamlessly on all devices, including
                  phones, tablets, and desktops.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CallToActionSection
        title="Still need help?"
        subtitle="Our support team is here to assist you anytime."
        primaryText="Contact Support"
        primaryLink="/contact"
      />
    </main>
  );
};

export default FrequentlyAskedPage;
