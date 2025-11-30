import React from "react";

const ReviewSection: React.FC = () => {
  return (
    <section className="testimonial container text-center mt-5 position-relative overflow-hidden">
      <div className="section-header mb-4">
        <span className="section-badge">Testimonials</span>
        <h2 className="section-title fw-bold mt-2">What Our Users Say</h2>
        <p className="section-subtitle text-secondary mt-2">
          Real feedback from students and educators benefiting from SchoolSpace.
        </p>
      </div>

      <div className="testimonial-card enhanced p-5 rounded position-relative overflow-hidden mx-auto mt-4">
        <i className="bi bi-chat-quote-fill testimonial-quote-icon"></i>
        <p className="testimonial-text fw-semibold mt-3">
          “SchoolSpace has completely transformed how I enroll in courses. It's
          intuitive, fast, and incredibly helpful.”
        </p>
        <h6 className="fw-bold mt-3">— Alex T.</h6>
      </div>

      <div className="testimonial-bg-gradient"></div>
    </section>
  );
};

export default ReviewSection;
