import React from "react";
import MainHeroCard from "../../components/main/MainHeroCard";
import SectionHeader from "../../components/main/SectionHeader";
import "../../styles/main/ServicePage.css";

const AuthPage: React.FC = () => {
  return (
    <main className="service-page">
      <div className="service-page-gradient gradient-1" />
      <div className="service-page-gradient gradient-2" />

      <MainHeroCard
        badge="Welcome"
        title="Access Your SchoolSpace Account"
        subtitle="Choose an option below to continue to your personalized dashboard."
        primaryBtnText="Log In"
        primaryBtnIcon="bi bi-box-arrow-in-right"
        primaryBtnLink="/auth/login"
        secondaryBtnText="Sign Up"
        secondaryBtnIcon="bi bi-person-plus-fill"
        secondaryBtnLink="/auth/signup"
      />

      <section className="service-section">
        <div className="container">
          <SectionHeader
            badge="Start Here"
            title="Choose how you'd like to continue"
            subtitle="SchoolSpace offers a secure and modern login experience."
          />

          <div className="row g-4 justify-content-center mt-4">
            <div className="col-md-5">
              <div className="card p-4 text-center auth-card">
                <h3 className="fw-bold mb-3">Returning User</h3>
                <p className="text-muted">
                  Already have an account? Log in to access your classes,
                  schedule, updates, and resources.
                </p>
                <a
                  href="/auth/login"
                  className="btn btn-primary pill-btn mt-3 w-100"
                >
                  Log In
                </a>
              </div>
            </div>

            <div className="col-md-5">
              <div className="card p-4 text-center auth-card">
                <h3 className="fw-bold mb-3">New Here?</h3>
                <p className="text-muted">
                  Create your SchoolSpace account and join a connected academic
                  community.
                </p>
                <a
                  href="/auth/signup"
                  className="btn btn-outline-primary pill-btn mt-3 w-100"
                >
                  Sign Up
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AuthPage;
