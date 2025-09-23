import React from "react";

export default function ServicesPage() {
  const services = [
    {
      icon: "bi bi-code-slash",
      title: "Web Development",
      text: "Custom websites and web apps designed for performance, security, and scalability.",
    },
    {
      icon: "bi bi-phone",
      title: "Mobile Solutions",
      text: "Cross-platform mobile apps that deliver seamless user experiences on iOS and Android.",
    },
    {
      icon: "bi bi-cloud-check",
      title: "Cloud Integration",
      text: "Deploy, scale, and manage your business applications with modern cloud technologies.",
    },
    {
      icon: "bi bi-graph-up-arrow",
      title: "Data & Analytics",
      text: "Leverage data insights and AI-driven solutions to grow smarter and faster.",
    },
  ];

  return (
    <div className="services-page bg-light">
      {/* Hero Section */}
      <section
        className="py-5 text-center text-white"
        style={{
          background: "linear-gradient(135deg, #16a34a, #15803d)",
        }}
      >
        <div className="container">
          <h1 className="fw-bold display-4">Our Services</h1>
          <p className="lead mt-3">
            Empowering your business with innovative and tailored solutions.
          </p>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            {services.map((s, idx) => (
              <div className="col-md-6 col-lg-3" key={idx}>
                <div className="card h-100 border-0 shadow-sm text-center p-4">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{
                      width: "70px",
                      height: "70px",
                      backgroundColor: "rgba(22,163,74,0.12)",
                      color: "#16a34a",
                      fontSize: "2rem",
                    }}
                  >
                    <i className={s.icon}></i>
                  </div>
                  <h5 className="fw-bold">{s.title}</h5>
                  <p className="text-muted">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5 bg-white">
        <div className="container">
          <div className="row align-items-center g-5 mb-5">
            <div className="col-lg-6">
              <img
                src="https://via.placeholder.com/600x400"
                alt="Custom Development"
                className="img-fluid rounded shadow"
              />
            </div>
            <div className="col-lg-6">
              <h2 className="fw-bold text-success">Custom Development</h2>
              <p className="text-muted">
                From concept to launch, we build tailored digital solutions that
                fit your business goals. Our agile process ensures flexibility
                and faster delivery.
              </p>
            </div>
          </div>
          <div className="row align-items-center g-5 flex-lg-row-reverse">
            <div className="col-lg-6">
              <img
                src="https://via.placeholder.com/600x400"
                alt="Scalable Cloud"
                className="img-fluid rounded shadow"
              />
            </div>
            <div className="col-lg-6">
              <h2 className="fw-bold text-success">Scalable Cloud</h2>
              <p className="text-muted">
                We design cloud-native systems with scalability and security in
                mind, empowering your business to grow without limits.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container text-center">
          <h2 className="fw-bold mb-4 text-success">Trusted by Clients</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card shadow-sm border-0 p-4 h-100">
                <p className="text-muted">
                  “They built our platform from scratch and delivered beyond our
                  expectations. Highly recommended!”
                </p>
                <h6 className="fw-bold mb-0">— Sarah W., Startup Founder</h6>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm border-0 p-4 h-100">
                <p className="text-muted">
                  “Their cloud migration service helped us cut costs and scale
                  faster. Fantastic team.”
                </p>
                <h6 className="fw-bold mb-0">— John D., CTO</h6>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm border-0 p-4 h-100">
                <p className="text-muted">
                  “Professional, reliable, and always focused on results. A true
                  partner in our success.”
                </p>
                <h6 className="fw-bold mb-0">— Emma R., Business Manager</h6>
              </div>
            </div>
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
          <h2 className="fw-bold mb-3">Let’s Build Something Great</h2>
          <p className="mb-4">
            Reach out to us today and see how we can bring your ideas to life.
          </p>
          <a
            href="/contact"
            className="btn btn-light text-success fw-semibold rounded-pill px-4 py-2 shadow-sm"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}
