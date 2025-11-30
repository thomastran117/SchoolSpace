import React from "react";

interface PersonaCardProps {
  label: string;
  text: string;
  features: string[];
}

const PersonaCard: React.FC<PersonaCardProps> = ({ label, text, features }) => {
  return (
    <div className="persona-card">
      <div className="persona-header">
        <span className="persona-label">{label}</span>
      </div>

      <p className="persona-text">{text}</p>

      <ul className="persona-list">
        {features.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default PersonaCard;
