import React, { useState } from "react";

export default function FaqPage() {
  const faqs = [
    {
      q: "What is your service about?",
      a: "We provide modern web, mobile, and cloud solutions tailored to businesses of all sizes.",
    },
    {
      q: "How do I get started?",
      a: "You can sign up for free and explore our platform. Upgrade to Pro or Enterprise as your needs grow.",
    },
    {
      q: "Do you offer customer support?",
      a: "Yes! We provide community support for free users and priority 24/7 support for Pro and Enterprise customers.",
    },
    {
      q: "Can I change my plan later?",
      a: "Absolutely. You can upgrade, downgrade, or cancel at any time through your account dashboard.",
    },
    {
      q: "Is my data secure?",
      a: "We use industry-standard security practices, including encryption and regular audits, to keep your data safe.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="faq-page">
      <section className="py-20 text-center text-white bg-gradient-to-br from-emerald-500 to-green-700 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-white/90">
            Find answers to the most common questions about our services.
          </p>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-white via-emerald-50 to-white">
        <div className="max-w-3xl mx-auto">
          {faqs.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition mb-4 overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full text-left flex items-center justify-between px-6 py-4 focus:(outline-none ring-2 ring-emerald-400) transition"
              >
                <span className="text-gray-800 font-semibold">{item.q}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-5 h-5 text-emerald-600 transform transition-transform duration-300 ${
                    openIndex === idx ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div
                className={`px-6 transition-all duration-300 ease-in-out ${
                  openIndex === idx
                    ? "max-h-40 opacity-100 py-2"
                    : "max-h-0 opacity-0 overflow-hidden"
                }`}
              >
                <p className="text-gray-600 leading-relaxed">{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-white text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-emerald-600 mb-3">
            Still have questions?
          </h2>
          <p className="text-gray-500 mb-6">
            Can’t find the answer you’re looking for? Reach out to our support
            team.
          </p>
          <a
            href="/contact"
            className="inline-block bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-full px-6 py-3 shadow-md hover:opacity-90 transition"
          >
            Contact Us
          </a>
        </div>
      </section>

      <section className="py-20 text-center text-white bg-gradient-to-br from-green-700 to-emerald-600 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">We’re Here to Help</h2>
          <p className="text-white/90 mb-8">
            Whether you’re just starting out or scaling up, our team is ready to
            support you.
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
