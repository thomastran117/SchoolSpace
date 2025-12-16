import { motion } from "framer-motion";
import {
  AcademicCapIcon,
  ChartBarIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

function MetricBar({ value }: { value: number }) {
  return (
    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
      <span
        className="block h-full rounded-full bg-gradient-to-r from-purple-400 to-fuchsia-400"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function TestimonialCard({
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

function PricingCard({
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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-violet-700 to-fuchsia-700 text-white">
      <section
        className="
          relative max-w-7xl mx-auto px-6 pt-28 pb-44
          grid lg:grid-cols-2 gap-20 items-center
        "
      >
        {/* Gradient blobs */}
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-purple-600/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 -right-40 w-[420px] h-[420px] bg-fuchsia-600/30 rounded-full blur-3xl animate-pulse" />

        {/* Left: Copy */}
        <div className="relative z-10">
          <span
            className="
              inline-flex items-center px-4 py-1.5 rounded-full
              bg-white/10 text-sm mb-6 text-purple-100
            "
          >
            🎓 Built for modern academic platforms
          </span>

          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-white">
            Power smarter
            <br />
            <span className="text-purple-300">academic management</span>
          </h1>

          <p className="mt-6 text-lg text-white/70 max-w-xl">
            SchoolSpace is a premium SaaS platform for managing courses,
            students, performance insights, and institutional analytics — all in
            one place.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <button
              className="
                px-8 py-4 rounded-xl font-semibold
                bg-gradient-to-r from-purple-500 to-fuchsia-500
                text-white shadow-lg shadow-purple-500/30
                hover:scale-[1.03] transition
              "
            >
              Start Free Trial
            </button>

            <button
              className="
                px-8 py-4 rounded-xl
                bg-white/10 text-white
                border border-white/20
                hover:bg-white/20 transition
              "
            >
              Watch Demo
            </button>
          </div>
        </div>

        {/* Right: Metric / Product Card */}
        <div className="relative z-10">
          <div
            className="
              rounded-3xl p-8
              bg-white/10 backdrop-blur-xl
              border border-white/20
              shadow-[0_40px_120px_rgba(168,85,247,0.35)]
            "
          >
            <div className="flex items-center justify-between mb-6">
              <span
                className="
                  px-3 py-1 rounded-full text-xs font-semibold
                  bg-purple-500/20 text-purple-200
                "
              >
                Live Academic Metrics
              </span>

              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
              </span>
            </div>

            <div className="space-y-2 mb-8">
              <p className="text-4xl font-extrabold text-white">18,742</p>
              <p className="text-sm text-white/60">
                Active Students This Semester
              </p>
            </div>

            <div className="space-y-4">
              <MetricBar value={82} />
              <MetricBar value={67} />
              <MetricBar value={91} />
            </div>
          </div>
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
      <section className="relative bg-gradient-to-r from-purple-700 to-fuchsia-700 py-28 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_60%)]" />

        <div className="relative max-w-4xl mx-auto px-6 text-white">
          <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Ready to elevate your academic platform?
          </h3>

          <p className="mt-6 text-lg text-purple-100 max-w-2xl mx-auto">
            Join forward-thinking institutions using SchoolSpace to streamline
            operations, empower educators, and support student success.
          </p>

          <div className="mt-10">
            <button
              className="
        px-12 py-4 rounded-xl
        bg-white text-purple-700 font-semibold
        shadow-xl shadow-purple-900/30
        hover:bg-purple-50 hover:scale-[1.03]
        transition
      "
            >
              Start Your Free Trial
            </button>
          </div>

          <p className="mt-4 text-sm text-purple-200">
            No credit card required
          </p>
        </div>
      </section>
    </div>
  );
}
