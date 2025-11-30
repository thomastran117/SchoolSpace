import React from "react";
import SectionCard from "./SectionCard";

const WhyUsSection: React.FC = () => {
  return (
    <section className="why container text-center mt-5">
      <div className="section-header mb-4">
        <span className="section-badge">Our Strengths</span>
        <h2 className="section-title fw-bold mt-2">Why Choose Us?</h2>
        <p className="section-subtitle text-secondary mt-2">
          Premium features crafted to support your academic journey.
        </p>
      </div>

      <div className="row g-4 justify-content-center mt-4">
        <div className="col-md-4">
          <SectionCard
            icon="bi bi-award-fill"
            title="High Quality"
            description="Tools built with performance, clarity, and reliability."
          />
        </div>

        <div className="col-md-4">
          <SectionCard
            icon="bi bi-lightning-charge-fill"
            title="Seamless Workflow"
            description="Navigate, enroll, and study without interruptions."
          />
        </div>

        <div className="col-md-4">
          <SectionCard
            icon="bi bi-people-fill"
            title="Trusted Worldwide"
            description="Used by students, teachers, and academic institutions globally."
          />
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
