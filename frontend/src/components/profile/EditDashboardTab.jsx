import React from "react";

const EditDashboard = () => {
  return (
    <div
      className="text-center py-5 px-3 shadow-sm rounded-4 border-0 position-relative"
      style={{
        background: "linear-gradient(180deg, #ffffff, #f9fafb)",
        animation: "fadeIn 0.5s ease",
      }}
    >
      <div
        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
        style={{
          width: "60px",
          height: "60px",
          background: "linear-gradient(135deg, #6366f1, #818cf8)",
          color: "white",
          boxShadow: "0 4px 10px rgba(99, 102, 241, 0.25)",
        }}
      >
        <i className="bi bi-gear-wide-connected fs-3"></i>
      </div>

      <h5
        className="fw-semibold mb-2"
        style={{
          color: "#4f46e5",
          letterSpacing: "0.5px",
        }}
      >
        Advanced Settings
      </h5>

      <p
        className="text-muted mb-0"
        style={{
          maxWidth: "400px",
          margin: "0 auto",
          fontSize: "0.95rem",
        }}
      >
        Dashboard customization and advanced configuration options are coming
        soon.
      </p>

      <div
        className="small text-secondary mt-3"
        style={{
          opacity: 0.7,
          fontStyle: "italic",
        }}
      >
        Stay tuned for upcoming features.
      </div>
    </div>
  );
};

export default EditDashboard;
