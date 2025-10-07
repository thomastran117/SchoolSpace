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
    <div className="services-page bg-gradient-to-br from-white via-emerald-50 to-white text-gray-800">
      <section className="py-20 text-center text-white bg-gradient-to-br from-emerald-500 to-green-700 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-3">Our Services</h1>
          <p className="text-lg text-white/90">
            Empowering your business with innovative and tailored solutions.
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((s, idx) => (
            <div
              key={idx}
              className="text-center bg-white rounded-2xl shadow-md hover:shadow-lg transition p-8 border border-gray-100"
            >
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-3xl">
                <i className={s.icon}></i>
              </div>
              <h5 className="font-bold text-lg mb-2">{s.title}</h5>
              <p className="text-gray-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto space-y-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <img
              src="https://via.placeholder.com/600x400"
              alt="Custom Development"
              className="rounded-xl shadow-md w-full"
            />
            <div>
              <h2 className="text-2xl font-bold text-emerald-600 mb-3">
                Custom Development
              </h2>
              <p className="text-gray-600 leading-relaxed">
                From concept to launch, we build tailored digital solutions that
                fit your business goals. Our agile process ensures flexibility
                and faster delivery.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-center lg:flex-row-reverse">
            <img
              src="https://via.placeholder.com/600x400"
              alt="Scalable Cloud"
              className="rounded-xl shadow-md w-full"
            />
            <div>
              <h2 className="text-2xl font-bold text-emerald-600 mb-3">
                Scalable Cloud
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We design cloud-native systems with scalability and security in
                mind, empowering your business to grow without limits.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-emerald-600">
            Trusted by Clients
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <Testimonial
              quote="They built our platform from scratch and delivered beyond our expectations. Highly recommended!"
              author="Sarah W."
              role="Startup Founder"
            />
            <Testimonial
              quote="Their cloud migration service helped us cut costs and scale faster. Fantastic team."
              author="John D."
              role="CTO"
            />
            <Testimonial
              quote="Professional, reliable, and always focused on results. A true partner in our success."
              author="Emma R."
              role="Business Manager"
            />
          </div>
        </div>
      </section>

      <section className="py-20 text-center text-white bg-gradient-to-br from-green-700 to-emerald-600 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">
            Let’s Build Something Great
          </h2>
          <p className="text-white/90 mb-8">
            Reach out to us today and see how we can bring your ideas to life.
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-emerald-600 font-semibold rounded-full px-6 py-3 shadow-md hover:bg-emerald-50 transition"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}

function Testimonial({ quote, author, role }) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-6 h-full border border-gray-100">
      <p className="text-gray-600 mb-4 italic">“{quote}”</p>
      <h6 className="font-semibold text-gray-800">
        — {author}, <span className="text-gray-500">{role}</span>
      </h6>
    </div>
  );
}
