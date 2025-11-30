import React from "react";
import SectionCard from "./SectionCard";

const ServicesSection: React.FC = () => {
  return (
    <section className="services container text-center mt-5">
      <div className="section-header mb-4">
        <span className="section-badge">What We Provide</span>
        <h2 className="section-title fw-bold mt-2">Services We Offer</h2>
        <p className="section-subtitle text-secondary mt-2">
          Powerful tools to help you learn, enroll, and succeed — all in one
          place.
        </p>
      </div>

      <div className="row g-4 mt-4 justify-content-center">
        <div className="col-md-4">
          <SectionCard
            icon="bi bi-journal-check"
            title="Course Discovery"
            description="Explore a curated catalog of courses tailored to your academic journey."
          />
        </div>

        <div className="col-md-4">
          <SectionCard
            icon="bi bi-mortarboard-fill"
            title="Instant Enrollment"
            description="Enroll instantly with real-time availability and seat tracking."
          />
        </div>

        <div className="col-md-4">
          <SectionCard
            icon="bi bi-stars"
            title="Personalized Learning"
            description="Get recommendations based on your interests and academic performance."
          />
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
