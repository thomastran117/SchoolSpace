import { motion } from "framer-motion";
import {
  AcademicCapIcon,
  ChartBarIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-violet-700 to-fuchsia-700 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-fuchsia-400/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-32 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-extrabold tracking-tight"
          >
            SchoolSpace
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 max-w-2xl mx-auto text-lg text-purple-100"
          >
            A modern platform for managing courses, students, and insights —
            built for universities and schools that value clarity and scale.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex justify-center gap-4"
          >
            <button className="px-8 py-3 rounded-xl bg-white text-purple-700 font-semibold shadow-lg hover:bg-purple-50 transition">
              Get Started
            </button>
            <button className="px-8 py-3 rounded-xl border border-white/30 text-white hover:bg-white/10 transition">
              View Demo
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white text-gray-900 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-purple-700">
              Everything your institution needs
            </h2>
            <p className="mt-4 text-gray-600 max-w-3xl mx-auto">
              SchoolSpace brings clarity, structure, and intelligence to
              academic management. From course planning to student engagement
              and performance analytics, everything lives in one secure,
              scalable platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard
              icon={AcademicCapIcon}
              title="Course Management"
              description="Design structured curricula, manage prerequisites, assign instructors, and publish updates in real time. Built to scale across departments and faculties."
            />
            <FeatureCard
              icon={UsersIcon}
              title="Student Insights"
              description="Understand enrollment trends, track academic progress, and identify at-risk students using intuitive dashboards designed for administrators and advisors."
            />
            <FeatureCard
              icon={ChartBarIcon}
              title="Analytics & Reporting"
              description="Generate actionable reports across semesters, programs, and cohorts. Export insights to support strategic decisions and accreditation requirements."
            />
          </div>
        </div>
      </section>

      {/* Trust Logos */}
      <section className="bg-gray-50 py-20 text-gray-900">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Trusted by modern institutions
          </p>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            {["University A", "College B", "Institute C", "Academy D"].map(
              (name) => (
                <div
                  key={name}
                  className="h-16 flex items-center justify-center rounded-xl bg-white shadow-sm text-gray-400 font-semibold"
                >
                  {name}
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-24 text-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-purple-700">
              Loved by educators and administrators
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Institutions choose SchoolSpace for its clarity, reliability, and
              thoughtful design.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <TestimonialCard
              quote="SchoolSpace completely transformed how we manage courses and enrollment. The dashboards give us instant clarity."
              author="Director of Academics"
              role="Director of Academics"
              organization="University A"
            />
            <TestimonialCard
              quote="Our advisors finally have the insights they need to support students proactively. The platform feels modern and intuitive."
              author="Student Success Lead"
              role="Director of Academics"
              organization="College B"
            />
            <TestimonialCard
              quote="Implementation was seamless, and the reporting tools have saved us countless hours every semester."
              author="Registrar"
              role="Director of Academics"
              organization="Institute C"
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 py-24 text-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-purple-700">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Flexible plans designed for institutions of all sizes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <PricingCard
              title="Starter"
              price="$99"
              description="For small schools and pilot programs"
              features={[
                "Up to 1,000 students",
                "Core course management",
                "Basic analytics",
              ]}
            />
            <PricingCard
              title="Professional"
              price="$299"
              highlighted
              description="Best for growing institutions"
              features={[
                "Up to 10,000 students",
                "Advanced analytics",
                "Priority support",
              ]}
            />
            <PricingCard
              title="Enterprise"
              price="Custom"
              description="For large universities"
              features={[
                "Unlimited students",
                "Custom integrations",
                "Dedicated support",
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-700 to-fuchsia-700 py-24 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h3 className="text-3xl md:text-4xl font-bold">
            Ready to transform your academic platform?
          </h3>
          <p className="mt-4 text-purple-100">
            Join institutions already using SchoolSpace to streamline their
            operations.
          </p>

          <div className="mt-10">
            <button className="px-10 py-4 rounded-xl bg-white text-purple-700 font-semibold shadow-xl hover:bg-purple-50 transition">
              Start Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-purple-900 py-10 text-center text-purple-200">
        <p>© {new Date().getFullYear()} SchoolSpace. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="bg-white rounded-2xl shadow-xl p-8 text-center"
    >
      <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-xl bg-purple-100 text-purple-700">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="mt-6 text-xl font-semibold text-gray-900">{title}</h4>
      <p className="mt-3 text-gray-600">{description}</p>
    </motion.div>
  );
}

type TestimonialCardProps = {
  quote: string;
  author: string;
  role: string;
  organization: string;
};

export function TestimonialCard({
  quote,
  author,
  role,
  organization,
}: {
  quote: string;
  author: string;
  role: string;
  organization: string;
}) {
  return (
    <div className="bg-gray-50 rounded-2xl p-8 shadow-sm hover:shadow-md transition text-gray-900">
      <p className="text-gray-700 italic leading-relaxed">“{quote}”</p>

      <div className="mt-6">
        <p className="font-semibold text-gray-900">{author}</p>
        <p className="text-sm text-gray-500">
          {role} · {organization}
        </p>
      </div>
    </div>
  );
}

export function PricingCard({
  title,
  price,
  description,
  features,
  highlighted = false,
}: {
  title: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl p-8 bg-white shadow-xl border transition text-gray-900
        ${highlighted ? "border-purple-600 scale-105" : "border-gray-200"}
      `}
    >
      {highlighted && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2
                         bg-purple-600 text-white text-xs font-semibold
                         px-4 py-1 rounded-full shadow"
        >
          Most Popular
        </span>
      )}

      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>

      <div className="mt-6">
        <span className="text-4xl font-bold text-purple-700">{price}</span>
        {price !== "Custom" && <span className="text-gray-500"> / month</span>}
      </div>

      <ul className="mt-6 space-y-3 text-gray-700">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span className="text-purple-600 font-bold">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        className={`mt-8 w-full py-3 rounded-xl font-semibold transition
          ${
            highlighted
              ? "bg-purple-600 text-white hover:bg-purple-700"
              : "bg-purple-50 text-purple-700 hover:bg-purple-100"
          }
        `}
      >
        Choose Plan
      </button>
    </div>
  );
}
