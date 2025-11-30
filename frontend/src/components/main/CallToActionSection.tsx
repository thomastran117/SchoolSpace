import React from "react";

const CallToActionSection: React.FC = () => {
  return (
    <section className="cta container text-center p-5 mt-5 rounded position-relative overflow-hidden">
      <div className="cta-content position-relative">
        <h2 className="fw-bold text-white">
          Ready to Transform Your Learning?
        </h2>
        <p className="mt-2 text-light">
          Join thousands of students and educators using SchoolSpace.
        </p>
        <button className="btn btn-light btn-lg rounded-pill px-4 mt-3 cta-btn">
          Get Started
        </button>
      </div>

      <div className="cta-bg-gradient"></div>
      <div className="cta-glow"></div>
    </section>
  );
};

export default CallToActionSection;
