import React from "react";

interface SectionHeaderProps {
  badge: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  title,
  subtitle,
  center = true,
}) => {
  return (
    <div className={`section-header ${center ? "text-center" : ""}`}>
      <div className="badge-pill badge-soft">
        <span className="badge-dot" />
        <span className="badge-text">{badge}</span>
      </div>

      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  );
};

export default SectionHeader;
