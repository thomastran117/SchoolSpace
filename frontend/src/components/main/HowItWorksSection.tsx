import React from "react";
import SectionCard from "./SectionCard";

const HowItWorksSection: React.FC = () => {
  return (
    <section className="how container text-center mt-5">
      <div className="section-header mb-4">
        <span className="section-badge">Quick Guide</span>
        <h2 className="section-title fw-bold mt-2">How It Works</h2>
        <p className="section-subtitle text-secondary mt-2">
          Follow these simple steps to get started.
        </p>
      </div>

      <div className="row g-4 justify-content-center mt-4">
        <div className="col-md-4 position-relative">
          <SectionCard
            icon="bi bi-search"
            title="Discover Courses"
            description="Browse programs that match your goals and interests."
          />
        </div>

        <div className="col-md-4 position-relative">
          <SectionCard
            icon="bi bi-check2-circle"
            title="Enroll Instantly"
            description="Secure your spot with real-time availability."
          />
        </div>

        <div className="col-md-4 position-relative">
          <SectionCard
            icon="bi bi-book-half"
            title="Start Learning"
            description="Access your coursework and tools immediately."
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
