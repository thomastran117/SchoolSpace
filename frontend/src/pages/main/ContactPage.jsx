import React, { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message submitted! (Here you can integrate backend logic)");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="contact-page bg-light">
      <section
        className="py-5 text-center text-white"
        style={{
          background: "linear-gradient(135deg, #16a34a, #15803d)",
        }}
      >
        <div className="container">
          <h1 className="fw-bold display-4">Contact Us</h1>
          <p className="lead mt-3">
            We'd love to hear from you. Get in touch with our team today.
          </p>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-5">
              <h2 className="fw-bold mb-4 text-success">Get in Touch</h2>
              <p className="text-muted mb-4">
                Whether you have questions, feedback, or just want to say hi,
                our team is here to help.
              </p>
              <div className="d-flex align-items-start mb-3">
                <i className="bi bi-envelope-fill text-success fs-4 me-3"></i>
                <div>
                  <h6 className="fw-bold mb-0">Email</h6>
                  <p className="text-muted mb-0">support@example.com</p>
                </div>
              </div>
              <div className="d-flex align-items-start mb-3">
                <i className="bi bi-telephone-fill text-success fs-4 me-3"></i>
                <div>
                  <h6 className="fw-bold mb-0">Phone</h6>
                  <p className="text-muted mb-0">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="d-flex align-items-start mb-3">
                <i className="bi bi-geo-alt-fill text-success fs-4 me-3"></i>
                <div>
                  <h6 className="fw-bold mb-0">Office</h6>
                  <p className="text-muted mb-0">123 Green Street, Ottawa, ON</p>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="card shadow-sm border-0 p-4">
                <h4 className="fw-bold mb-3">Send a Message</h4>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control rounded-pill"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control rounded-pill"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Message</label>
                    <textarea
                      className="form-control"
                      rows="5"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-success rounded-pill px-4 fw-semibold shadow-sm"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-white">
        <div className="container text-center">
          <h5 className="fw-bold text-success mb-3">Our Location</h5>
          <div className="ratio ratio-16x9 shadow rounded">
            <iframe
              src="https://maps.google.com/maps?q=Ottawa,%20ON&t=&z=13&ie=UTF8&iwloc=&output=embed"
              title="Office Location"
              allowFullScreen
            ></iframe>
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
          <h2 className="fw-bold mb-3">Let’s Work Together</h2>
          <p className="mb-4">
            Reach out and our team will get back to you as soon as possible.
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
