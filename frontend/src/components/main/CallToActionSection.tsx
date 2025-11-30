import React from "react";
import "../../styles/main/CallToAction.css";

interface CallToActionProps {
  title: string;
  subtitle?: string;
  primaryText: string;
  primaryLink?: string;
  secondaryText?: string;
  secondaryLink?: string;
}

const CallToActionSection: React.FC<CallToActionProps> = ({
  title,
  subtitle,
  primaryText,
  primaryLink = "#",
  secondaryText,
  secondaryLink = "#",
}) => {
  return (
    <section className="cta-section container text-center p-5 mt-5 rounded position-relative overflow-hidden">
      <div className="cta-content position-relative">
        <h2 className="cta-title fw-bold text-white">{title}</h2>

        {subtitle && <p className="cta-subtitle mt-2 text-light">{subtitle}</p>}

        <div className="cta-buttons d-flex justify-content-center gap-3 mt-4">
          <a
            href={primaryLink}
            className="btn btn-light btn-lg rounded-pill px-4 cta-btn-primary"
          >
            {primaryText}
          </a>

          {secondaryText && (
            <a
              href={secondaryLink}
              className="btn btn-outline-light btn-lg rounded-pill px-4 cta-btn-secondary"
            >
              {secondaryText}
            </a>
          )}
        </div>
      </div>

      <div className="cta-bg-gradient"></div>
      <div className="cta-bg-glow"></div>
      <div className="cta-ring"></div>
    </section>
  );
};

export default CallToActionSection;
