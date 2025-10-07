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
    <div className="contact-page">
      <section className="py-20 text-center text-white bg-gradient-to-br from-emerald-500 to-green-700 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-3">Contact Us</h1>
          <p className="text-lg opacity-90">
            We'd love to hear from you. Get in touch with our team today.
          </p>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-white via-emerald-50 to-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl font-bold text-emerald-600 mb-6">
              Get in Touch
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Whether you have questions, feedback, or just want to say hi, our
              team is here to help.
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-emerald-600 mt-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.94 6.34A1 1 0 0 1 3.9 6h12.2a1 1 0 0 1 .96.34l-7.06 5.88a1 1 0 0 1-1.28 0L2.94 6.34z" />
                  <path d="M18 8.12v5.38a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 13.5V8.12l6.48 5.4a3 3 0 0 0 3.04 0L18 8.12z" />
                </svg>
                <div>
                  <h6 className="font-semibold text-gray-800">Email</h6>
                  <p className="text-gray-500">support@example.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-emerald-600 mt-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h1.5a2.25 2.25 0 0 0 2.25-2.25v-1.372a1.125 1.125 0 0 0-.852-1.092l-4.548-1.137a1.125 1.125 0 0 0-1.216.417l-.97 1.293a11.25 11.25 0 0 1-5.278-5.278l1.293-.97a1.125 1.125 0 0 0 .417-1.216L6.714 3.852A1.125 1.125 0 0 0 5.622 3H4.25A2.25 2.25 0 0 0 2 5.25v1.5z"
                  />
                </svg>
                <div>
                  <h6 className="font-semibold text-gray-800">Phone</h6>
                  <p className="text-gray-500">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-emerald-600 mt-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z"
                  />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                <div>
                  <h6 className="font-semibold text-gray-800">Office</h6>
                  <p className="text-gray-500">123 Green Street, Ottawa, ON</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-xl rounded-xl p-8">
            <h4 className="text-2xl font-semibold mb-6 text-gray-800">
              Send a Message
            </h4>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-full border border-gray-300 focus:(outline-none ring-2 ring-emerald-400) transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-full border border-gray-300 focus:(outline-none ring-2 ring-emerald-400) transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  rows="5"
                  value={form.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:(outline-none ring-2 ring-emerald-400) transition resize-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-full shadow-md hover:opacity-90 transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h5 className="text-2xl font-bold text-emerald-600 mb-6">
            Our Location
          </h5>
          <div className="aspect-video rounded-xl shadow-lg overflow-hidden">
            <iframe
              src="https://maps.google.com/maps?q=Ottawa,%20ON&t=&z=13&ie=UTF8&iwloc=&output=embed"
              title="Office Location"
              allowFullScreen
              className="w-full h-full border-none"
            ></iframe>
          </div>
        </div>
      </section>

      <section className="py-20 text-center text-white bg-gradient-to-br from-green-700 to-emerald-600 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">Let’s Work Together</h2>
          <p className="text-white/90 mb-8">
            Reach out and our team will get back to you as soon as possible.
          </p>
          <a
            href="/get-started"
            className="inline-block bg-white text-emerald-600 font-semibold rounded-full px-6 py-3 shadow-md hover:bg-emerald-50 transition"
          >
            Get Started
          </a>
        </div>
      </section>
    </div>
  );
}
