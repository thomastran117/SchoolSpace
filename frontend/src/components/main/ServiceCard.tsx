import React from "react";

interface ServiceCardProps {
  letter: string;
  title: string;
  text: string;
  features: string[];
  delay?: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  letter,
  title,
  text,
  features,
  delay = 0,
}) => {
  return (
    <div
      className={`service-card lift-in ${delay > 0 ? `delay-${delay}` : ""}`}
    >
      <div className="service-icon">
        <span className="icon-dot" />
        <span className="icon-letter">{letter}</span>
      </div>

      <h3 className="service-card-title">{title}</h3>
      <p className="service-card-text">{text}</p>

      <ul className="service-list">
        {features.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default ServiceCard;
