import React from "react";
import MainHeroCard from "../../components/main/MainHeroCard";
import SectionHeader from "../../components/main/SectionHeader";
import CallToActionSection from "../../components/main/CallToActionSection";

const ContactPage: React.FC = () => {
  return (
    <main className="service-page">
      <div className="service-page-gradient gradient-1" />
      <div className="service-page-gradient gradient-2" />

      <MainHeroCard
        badge="Contact Us"
        title="We'd love to hear from you"
        subtitle="Whether you're a school, educator, or student — our team is here to help."
        primaryBtnText="Send Message"
        primaryBtnIcon="bi bi-envelope-fill"
        primaryBtnLink="#contact-form"
      />

      <section className="service-section">
        <div className="container">
          <SectionHeader
            badge="Get in Touch"
            title="Reach out to our support team"
            subtitle="We respond within 24 hours on weekdays."
          />

          <div className="row mt-4 justify-content-center">
            <div className="col-lg-8">
              <div className="card p-4">
                <form id="contact-form">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Your Name"
                      />
                    </div>

                    <div className="col-md-6">
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Your Email"
                      />
                    </div>

                    <div className="col-12">
                      <textarea
                        className="form-control"
                        rows={5}
                        placeholder="Your Message"
                      />
                    </div>

                    <div className="col-12 mt-3">
                      <button className="btn btn-primary pill-btn w-100">
                        Send Message
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CallToActionSection
        title="Prefer speaking directly?"
        subtitle="Our team is available for calls or live demo meetings."
        primaryText="Book a Call"
        primaryLink="/demo"
      />
    </main>
  );
};

export default ContactPage;
