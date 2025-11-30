import React from "react";
import MainHeroCard from "../../components/main/MainHeroCard";

const PrivacyPage: React.FC = () => {
  return (
    <main className="service-page">
      <div className="service-page-gradient gradient-1" />
      <div className="service-page-gradient gradient-2" />

      <MainHeroCard
        badge="Privacy Policy"
        title="Your privacy matters at SchoolSpace"
        subtitle="We are committed to protecting your information and ensuring transparency."
      />

      <section className="service-section">
        <div className="container">
          <div className="card p-4">
            <h3>Information We Collect</h3>
            <p>
              We only collect data necessary to deliver educational tools and
              enhance your SchoolSpace experience.
            </p>

            <h3 className="mt-4">How We Use Your Information</h3>
            <p>
              We use your data solely to provide core platform features such as
              communication, scheduling, and account authentication.
            </p>

            <h3 className="mt-4">Data Protection</h3>
            <p>
              All information is securely stored, encrypted, and never shared
              with third-party advertisers.
            </p>

            <h3 className="mt-4">Your Rights</h3>
            <p>
              You may request access, correction, or removal of your data at any
              time.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default PrivacyPage;
