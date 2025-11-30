import React from "react";
import MainHeroCard from "../../components/main/MainHeroCard";

const TermsAndConditionPage: React.FC = () => {
  return (
    <main className="service-page">
      <div className="service-page-gradient gradient-1" />
      <div className="service-page-gradient gradient-2" />

      <MainHeroCard
        badge="Terms & Conditions"
        title="SchoolSpace Terms of Service"
        subtitle="Please read these terms carefully before using SchoolSpace."
      />

      <section className="service-section">
        <div className="container">
          <div className="card p-4">
            <h3>1. Acceptance of Terms</h3>
            <p>
              By using SchoolSpace, you agree to comply with and be bound by
              these Terms and Conditions.
            </p>

            <h3 className="mt-4">2. Use of the Platform</h3>
            <p>
              You agree not to misuse the platform or use it for unlawful
              activities.
            </p>

            <h3 className="mt-4">3. Accounts & Security</h3>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials.
            </p>

            <h3 className="mt-4">4. Data & Privacy</h3>
            <p>
              All data is handled according to our Privacy Policy. We do not
              share data with third-party advertisers.
            </p>

            <h3 className="mt-4">5. Termination</h3>
            <p>
              We reserve the right to suspend or terminate access if users
              violate these terms.
            </p>

            <h3 className="mt-4">6. Limitation of Liability</h3>
            <p>
              SchoolSpace is not liable for damages arising from platform usage,
              to the extent permitted by law.
            </p>

            <h3 className="mt-4">7. Changes to These Terms</h3>
            <p>
              We may update these terms occasionally. Continued use of the
              service implies acceptance.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default TermsAndConditionPage;
