import React from "react";

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      features: [
        "Basic features",
        "Community support",
        "Limited usage",
      ],
      button: { text: "Get Started", link: "/signup", style: "outline-success" },
    },
    {
      name: "Pro",
      price: "$19",
      period: "/month",
      features: [
        "All Free features",
        "Priority support",
        "Unlimited projects",
        "Advanced integrations",
      ],
      highlight: true,
      button: { text: "Start Pro", link: "/signup", style: "success" },
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      features: [
        "All Pro features",
        "Dedicated manager",
        "Custom solutions",
        "24/7 support",
      ],
      button: { text: "Contact Sales", link: "/contact", style: "outline-success" },
    },
  ];

  return (
    <div className="pricing-page bg-light">
      <section
        className="py-5 text-center text-white"
        style={{
          background: "linear-gradient(135deg, #16a34a, #15803d)",
        }}
      >
        <div className="container">
          <h1 className="fw-bold display-4">Pricing</h1>
          <p className="lead mt-3">
            Choose a plan that fits your needs. Simple, transparent pricing.
          </p>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            {plans.map((plan, idx) => (
              <div className="col-md-6 col-lg-4" key={idx}>
                <div
                  className={`card h-100 border-0 shadow-sm text-center p-4 ${
                    plan.highlight ? "border border-2 border-success shadow" : ""
                  }`}
                >
                  <h5
                    className={`fw-bold mb-3 ${
                      plan.highlight ? "text-success" : ""
                    }`}
                  >
                    {plan.name}
                  </h5>
                  <h2 className="fw-bold mb-0">
                    {plan.price}{" "}
                    <small className="text-muted fs-6">{plan.period}</small>
                  </h2>
                  <ul className="list-unstyled my-4 text-start">
                    {plan.features.map((f, i) => (
                      <li key={i} className="mb-2">
                        ✅ {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={plan.button.link}
                    className={`btn btn-${plan.button.style} fw-semibold rounded-pill px-4`}
                  >
                    {plan.button.text}
                  </a>
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
            Pick your plan today and unlock all the features you need.
          </p>
          <a
            href="/signup"
            className="btn btn-light text-success fw-semibold rounded-pill px-4 py-2 shadow-sm"
          >
            Get Started
          </a>
        </div>
      </section>
    </div>
  );
}
