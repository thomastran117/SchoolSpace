import React from "react";

interface StepCardProps {
  index: number;
  title: string;
  text: string;
}

const StepCard: React.FC<StepCardProps> = ({ index, title, text }) => {
  return (
    <div className="step-card">
      <span className="step-index">{String(index).padStart(2, "0")}</span>
      <h3 className="step-title">{title}</h3>
      <p className="step-text">{text}</p>
    </div>
  );
};

export default StepCard;
