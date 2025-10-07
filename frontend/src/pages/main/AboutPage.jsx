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
    <div className="about-page">
      <section className="py-20 text-center text-white bg-gradient-to-br from-emerald-500 to-green-700 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-3">About Us</h1>
          <p className="text-lg opacity-90">
            Learn more about our mission, our journey, and the people behind the
            vision.
          </p>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-white via-emerald-50 to-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <img
            src="https://via.placeholder.com/600x400"
            alt="Our story"
            className="rounded-xl shadow-xl w-full object-cover"
          />
          <div>
            <h2 className="text-3xl font-bold text-emerald-600 mb-4">
              Our Story
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              We started with a simple idea: to create technology that empowers
              people and drives positive change. Today, our platform supports
              thousands of users worldwide, offering secure, innovative, and
              user-friendly solutions.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our team believes in transparency, integrity, and building tools
              that make a real difference. Every feature we design has one
              purpose — to serve you better.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white text-center">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-emerald-600 mb-10">
            Quick Facts
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { stat: "10K+", label: "Active Users" },
              { stat: "50+", label: "Team Members" },
              { stat: "20+", label: "Countries Served" },
              { stat: "5 Years", label: "Of Experience" },
            ].map((fact, i) => (
              <div
                key={i}
                className="bg-white shadow-md rounded-xl py-8 px-4 hover:shadow-lg transition"
              >
                <h3 className="text-2xl font-bold text-emerald-600">
                  {fact.stat}
                </h3>
                <p className="text-gray-500 mt-2">{fact.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-b from-emerald-50 via-white to-emerald-50 text-center">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-emerald-600 mb-10">
            Meet the Team
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {team.map((member, idx) => (
              <div
                key={idx}
                className="bg-white shadow-md hover:shadow-lg rounded-xl p-6 transition flex flex-col items-center"
              >
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-28 h-28 rounded-full object-cover mb-4 border-4 border-emerald-100"
                />
                <h5 className="text-lg font-semibold">{member.name}</h5>
                <p className="text-gray-500 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 text-center text-white bg-gradient-to-br from-green-700 to-emerald-600 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">Join Us on Our Journey</h2>
          <p className="text-white/90 mb-8">
            Be part of our mission and discover how we can grow together.
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
