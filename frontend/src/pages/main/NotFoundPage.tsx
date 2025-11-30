import React from "react";
import MainHeroCard from "../../components/main/MainHeroCard";

const NotFoundPage: React.FC = () => {
  return (
    <main className="service-page">
      <div className="service-page-gradient gradient-1" />
      <div className="service-page-gradient gradient-2" />

      <MainHeroCard
        badge="404"
        title="Page Not Found"
        subtitle="The page you’re looking for doesn’t exist or has been moved."
        primaryBtnText="Go Home"
        primaryBtnIcon="bi bi-house-fill"
        primaryBtnLink="/"
        secondaryBtnText="Contact Support"
        secondaryBtnIcon="bi bi-headset"
        secondaryBtnLink="/contact"
      />

      <section className="service-section">
        <div className="container text-center">
          <div className="card p-4 mx-auto" style={{ maxWidth: "600px" }}>
            <h3 className="fw-bold">Oops!</h3>
            <p className="text-muted">
              The link may be broken or the page may have been removed.
            </p>
            <p className="mt-2">Use the button above to return to safety.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default NotFoundPage;
