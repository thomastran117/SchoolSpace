import React from "react";

interface SectionCardProps {
  icon: string;
  title: string;
  description: string;
}

const SectionCard: React.FC<SectionCardProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <div className="section-card enhanced p-4 rounded position-relative overflow-hidden">
      <div className="section-card-icon mb-3">
        <i className={icon}></i>
      </div>

      <h5 className="fw-semibold">{title}</h5>

      <p className="text-secondary small mt-2">{description}</p>
    </div>
  );
};

export default SectionCard;
