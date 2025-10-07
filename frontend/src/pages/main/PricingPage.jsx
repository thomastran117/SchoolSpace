import React from "react";

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      features: ["Basic features", "Community support", "Limited usage"],
      button: { text: "Get Started", link: "/signup", type: "outline" },
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
      button: { text: "Start Pro", link: "/signup", type: "solid" },
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
      button: { text: "Contact Sales", link: "/contact", type: "outline" },
    },
  ];

  return (
    <div className="pricing-page bg-gradient-to-br from-white via-emerald-50 to-white text-gray-800">
      <section className="py-20 text-center text-white bg-gradient-to-br from-emerald-500 to-green-700 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-3">Pricing</h1>
          <p className="text-lg text-white/90">
            Choose a plan that fits your needs. Simple, transparent pricing.
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-8 text-center bg-white shadow-md hover:shadow-lg transition border ${
                plan.highlight
                  ? "border-emerald-500 ring-2 ring-emerald-300 shadow-xl"
                  : "border-gray-100"
              }`}
            >
              <h5
                className={`text-xl font-bold mb-2 ${
                  plan.highlight ? "text-emerald-600" : "text-gray-700"
                }`}
              >
                {plan.name}
              </h5>
              <h2 className="text-4xl font-bold mb-2">
                {plan.price}
                <span className="text-gray-400 text-base">{plan.period}</span>
              </h2>

              <ul className="text-left mt-6 mb-8 space-y-2 text-gray-600">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-emerald-500">✅</span> {f}
                  </li>
                ))}
              </ul>

              <a
                href={plan.button.link}
                className={`inline-block rounded-full px-6 py-3 font-semibold transition ${
                  plan.button.type === "solid"
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "border border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                {plan.button.text}
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 text-center text-white bg-gradient-to-br from-green-700 to-emerald-600 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-white/90 mb-8">
            Pick your plan today and unlock all the features you need.
          </p>
          <a
            href="/signup"
            className="inline-block bg-white text-emerald-600 font-semibold rounded-full px-6 py-3 shadow-md hover:bg-emerald-50 transition"
          >
            Get Started
          </a>
        </div>
      </section>
    </div>
  );
}
