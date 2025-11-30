import React from "react";
import "../../styles/main/HomeHeroCard.css";

const MainHeroCard: React.FC = () => {
  return (
    <section className="hero-card container text-center p-5 rounded position-relative overflow-hidden">
      <div className="hero-badge mx-auto mb-3">
        Empowering Students & Educators
      </div>

      <div className="hero-content position-relative">
        <h1 className="hero-title fw-bold">
          SchoolSpace
          <span className="title-underline"></span>
        </h1>

        <p className="hero-subtitle mt-3">
          Discover courses, enroll instantly, and enjoy education — all in one
          place.
        </p>

        <div className="hero-buttons d-flex justify-content-center gap-3 mt-4">
          <button className="btn btn-accent btn-lg rounded-pill px-4 d-flex align-items-center gap-2">
            <i className="bi bi-play-circle-fill"></i> Get Started
          </button>
          <button className="btn btn-outline-accent btn-lg rounded-pill px-4 d-flex align-items-center gap-2">
            <i className="bi bi-info-circle"></i> How It Works
          </button>
        </div>
      </div>

      <div className="hero-bg-gradient"></div>
      <div className="hero-bg-shape-1"></div>
      <div className="hero-bg-shape-2"></div>
      <div className="hero-ring"></div>
    </section>
  );
};

export default MainHeroCard;
