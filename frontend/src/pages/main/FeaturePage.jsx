import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function FeaturesPage() {
  const features = [
    {
      icon: "bi bi-lightning-fill",
      title: "Fast Performance",
      text: "Our platform is optimized for speed, ensuring quick load times and smooth interactions.",
    },
    {
      icon: "bi bi-shield-check",
      title: "Secure by Design",
      text: "We use advanced security practices to keep your data safe at all times.",
    },
    {
      icon: "bi bi-people-fill",
      title: "User Friendly",
      text: "A simple, intuitive interface built for everyone, from beginners to experts.",
    },
    {
      icon: "bi bi-phone-fill",
      title: "Mobile Ready",
      text: "Seamlessly optimized for mobile, tablet, and desktop experiences.",
    },
  ];

  return (
    <div className="features-page bg-light">
      <section
        className="py-5 text-center text-white"
        style={{
          background: "linear-gradient(135deg, #16a34a, #15803d)",
        }}
      >
        <div className="container">
          <h1 className="fw-bold display-4">Our Features</h1>
          <p className="lead mt-3 text-light">
            Discover what makes our platform powerful, secure, and easy to use.
          </p>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            {features.map((f, idx) => (
              <div className="col-md-6 col-lg-3" key={idx}>
                <div className="card h-100 border-0 shadow-sm text-center p-4">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{
                      width: "70px",
                      height: "70px",
                      backgroundColor: "rgba(22, 163, 74, 0.12)",
                      color: "#16a34a",
                      fontSize: "2rem",
                    }}
                  >
                    <i className={f.icon}></i>
                  </div>
                  <h5 className="fw-bold">{f.title}</h5>
                  <p className="text-muted">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="py-5 text-center text-white"
        style={{
          background: "linear-gradient(135deg, #15803d, #166534)",
        }}
      >
        <div className="container">
          <h2 className="fw-bold mb-3">Ready to get started?</h2>
          <p className="mb-4">
            Experience all these features and more by joining us today.
          </p>
          <a
            href="/get-started"
            className="btn btn-light text-success fw-semibold rounded-pill px-4 py-2 shadow-sm"
          >
            Get Started
          </a>
        </div>
      </section>
    </div>
  );
}
