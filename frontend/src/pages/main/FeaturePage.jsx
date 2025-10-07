import React from "react";

export default function FeaturesPage() {
  const features = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8 text-emerald-600"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M11.3 1L4 9h4v6l7.3-8H11.3z" />
        </svg>
      ),
      title: "Fast Performance",
      text: "Our platform is optimized for speed, ensuring quick load times and smooth interactions.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8 text-emerald-600"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M5.5 9.5l2 2 4.5-4.5L10.5 5l-3 3-1.5-1.5z" />
          <path d="M8 0a8 8 0 1 0 8 8A8 8 0 0 0 8 0zm0 14.5A6.5 6.5 0 1 1 14.5 8 6.5 6.5 0 0 1 8 14.5z" />
        </svg>
      ),
      title: "Secure by Design",
      text: "We use advanced security practices to keep your data safe at all times.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8 text-emerald-600"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M8 8a3 3 0 1 0-3-3 3 3 0 0 0 3 3z" />
          <path d="M14 13a6 6 0 1 0-12 0z" />
        </svg>
      ),
      title: "User Friendly",
      text: "A simple, intuitive interface built for everyone, from beginners to experts.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8 text-emerald-600"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M11 1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2z" />
          <path d="M8 14a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
        </svg>
      ),
      title: "Mobile Ready",
      text: "Seamlessly optimized for mobile, tablet, and desktop experiences.",
    },
  ];

  return (
    <div className="features-page">
      <section className="py-20 text-center text-white bg-gradient-to-br from-emerald-500 to-green-700 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-3">Our Features</h1>
          <p className="text-lg text-white/90">
            Discover what makes our platform powerful, secure, and easy to use.
          </p>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-white via-emerald-50 to-white">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="text-center bg-white rounded-xl shadow-md hover:shadow-lg transition p-8 flex flex-col items-center"
            >
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-emerald-100 mb-4">
                {f.icon}
              </div>
              <h5 className="text-lg font-semibold mb-2 text-gray-800">
                {f.title}
              </h5>
              <p className="text-gray-500 text-sm leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 text-center text-white bg-gradient-to-br from-green-700 to-emerald-600 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-white/90 mb-8">
            Experience all these features and more by joining us today.
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
