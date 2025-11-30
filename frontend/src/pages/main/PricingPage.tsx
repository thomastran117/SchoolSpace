import React from "react";
import MainHeroCard from "../../components/main/MainHeroCard";
import SectionHeader from "../../components/main/SectionHeader";
import CallToActionSection from "../../components/main/CallToActionSection";

const PricingPage: React.FC = () => {
  return (
    <main className="service-page">
      <div className="service-page-gradient gradient-1" />
      <div className="service-page-gradient gradient-2" />

      <MainHeroCard
        badge="Pricing"
        title="Simple, flexible plans for schools of all sizes"
        subtitle="No hidden fees. Scale your SchoolSpace experience as your institution grows."
        primaryBtnText="Get Started"
        primaryBtnIcon="bi bi-check-circle"
      />

      <section className="service-section">
        <div className="container">
          <SectionHeader
            badge="Plans"
            title="Choose the right plan for your school"
          />

          <div className="row mt-4 g-4">
            <div className="col-md-4">
              <div className="service-card p-4">
                <h3 className="service-card-title">Free</h3>
                <p className="service-card-text">$0 / month</p>
                <ul className="service-list">
                  <li>Up to 50 students</li>
                  <li>Basic scheduling</li>
                  <li>Essential communication</li>
                  <li>Course management</li>
                </ul>
                <button className="btn btn-primary pill-btn mt-3 w-100">
                  Start Free
                </button>
              </div>
            </div>

            <div className="col-md-4">
              <div className="service-card p-4">
                <h3 className="service-card-title">Standard</h3>
                <p className="service-card-text">$29 / month</p>
                <ul className="service-list">
                  <li>Unlimited students</li>
                  <li>Full scheduling suite</li>
                  <li>Announcements & alerts</li>
                  <li>Student resources hub</li>
                </ul>
                <button className="btn btn-primary pill-btn mt-3 w-100">
                  Choose Plan
                </button>
              </div>
            </div>

            <div className="col-md-4">
              <div className="service-card p-4 featured-plan">
                <h3 className="service-card-title">Premium</h3>
                <p className="service-card-text">$59 / month</p>
                <ul className="service-list">
                  <li>Unlimited everything</li>
                  <li>Advanced admin controls</li>
                  <li>Priority support</li>
                  <li>Analytics & reporting</li>
                </ul>
                <button className="btn btn-primary pill-btn mt-3 w-100">
                  Go Premium
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CallToActionSection
        title="Need help choosing a plan?"
        subtitle="Our team can help you find the perfect match for your school."
        primaryText="Talk to Sales"
        primaryLink="/contact"
      />
    </main>
  );
};

export default PricingPage;
