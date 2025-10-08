import React from "react";

export default function AboutPage() {
  const team = [
    {
      name: "Alice Johnson",
      role: "CEO & Founder",
      img: "https://via.placeholder.com/150",
    },
    {
      name: "Michael Smith",
      role: "CTO",
      img: "https://via.placeholder.com/150",
    },
    {
      name: "Sofia Martinez",
      role: "Lead Designer",
      img: "https://via.placeholder.com/150",
    },
    {
      name: "James Lee",
      role: "Head of Marketing",
      img: "https://via.placeholder.com/150",
    },
  ];

  return (
    <div className="about-page bg-light">
      <section
        className="py-5 text-center text-white"
        style={{
          background: "linear-gradient(135deg, #16a34a, #15803d)",
        }}
      >
        <div className="container">
          <h1 className="fw-bold display-4">About Us</h1>
          <p className="lead mt-3">
            Learn more about our mission, our journey, and the people behind the
            vision.
          </p>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <img
                src="https://via.placeholder.com/600x400"
                className="img-fluid rounded shadow"
                alt="Our story"
              />
            </div>
            <div className="col-lg-6">
              <h2 className="fw-bold mb-3 text-success">Our Story</h2>
              <p className="text-muted">
                We started with a simple idea: to create technology that
                empowers people and drives positive change. Today, our platform
                supports thousands of users worldwide, offering secure,
                innovative, and user-friendly solutions.
              </p>
              <p className="text-muted">
                Our team believes in transparency, integrity, and building tools
                that make a real difference. Every feature we design has one
                purpose — to serve you better.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-white">
        <div className="container text-center">
          <h2 className="fw-bold mb-4 text-success">Quick Facts</h2>
          <div className="row g-4">
            <div className="col-md-3">
              <div className="card shadow-sm border-0 p-4">
                <h3 className="fw-bold text-success">10K+</h3>
                <p className="text-muted">Active Users</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm border-0 p-4">
                <h3 className="fw-bold text-success">50+</h3>
                <p className="text-muted">Team Members</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm border-0 p-4">
                <h3 className="fw-bold text-success">20+</h3>
                <p className="text-muted">Countries Served</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm border-0 p-4">
                <h3 className="fw-bold text-success">5 Years</h3>
                <p className="text-muted">Of Experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container text-center">
          <h2 className="fw-bold mb-4 text-success">Meet the Team</h2>
          <div className="row g-4">
            {team.map((member, idx) => (
              <div className="col-md-6 col-lg-3" key={idx}>
                <div className="card h-100 border-0 shadow-sm p-3">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="rounded-circle mx-auto mb-3"
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                    }}
                  />
                  <h5 className="fw-bold">{member.name}</h5>
                  <p className="text-muted">{member.role}</p>
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
          <h2 className="fw-bold mb-3">Join Us on Our Journey</h2>
          <p className="mb-4">
            Be part of our mission and discover how we can grow together.
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
