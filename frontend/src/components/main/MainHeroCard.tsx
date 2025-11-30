import React from "react";
import "../../styles/main/HomeHeroCard.css";

interface MainHeroCardProps {
  badge?: string;
  title: string;
  subtitle?: string;
  primaryBtnText?: string;
  primaryBtnIcon?: string;
  primaryBtnLink?: string;
  secondaryBtnText?: string;
  secondaryBtnIcon?: string;
  secondaryBtnLink?: string;
}

const MainHeroCard: React.FC<MainHeroCardProps> = ({
  badge = "Empowering Students & Educators",
  title,
  subtitle,
  primaryBtnText,
  primaryBtnIcon,
  primaryBtnLink = "#",
  secondaryBtnText,
  secondaryBtnIcon,
  secondaryBtnLink = "#",
}) => {
  return (
    <section className="hero-card container text-center p-5 rounded position-relative overflow-hidden">
      {badge && <div className="hero-badge mx-auto mb-3">{badge}</div>}

      <div className="hero-content position-relative">
        <h1 className="hero-title fw-bold">
          {title}
          <span className="title-underline"></span>
        </h1>

        {subtitle && <p className="hero-subtitle mt-3">{subtitle}</p>}

        {(primaryBtnText || secondaryBtnText) && (
          <div className="hero-buttons d-flex justify-content-center gap-3 mt-4">
            {primaryBtnText && (
              <a
                href={primaryBtnLink}
                className="btn btn-accent btn-lg rounded-pill px-4 d-flex align-items-center gap-2"
              >
                {primaryBtnIcon && <i className={primaryBtnIcon}></i>}
                {primaryBtnText}
              </a>
            )}

            {secondaryBtnText && (
              <a
                href={secondaryBtnLink}
                className="btn btn-outline-accent btn-lg rounded-pill px-4 d-flex align-items-center gap-2"
              >
                {secondaryBtnIcon && <i className={secondaryBtnIcon}></i>}
                {secondaryBtnText}
              </a>
            )}
          </div>
        )}
      </div>

      <div className="hero-bg-gradient"></div>
      <div className="hero-bg-shape-1"></div>
      <div className="hero-bg-shape-2"></div>
      <div className="hero-ring"></div>
    </section>
  );
};

export default MainHeroCard;
