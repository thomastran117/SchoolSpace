import { useRef, useState } from "react";
import { Eye, EyeOff, Mail, Lock, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { login } from "../../services/AuthService";
import GoogleRecaptcha, {
  type CaptchaRef,
} from "../../components/auth/GoogleRecaptcha";
import MicrosoftButton from "../../components/auth/MicrosoftButton";
import GoogleButton from "../../components/auth/GoogleButton";
import Error from "../../components/shared/Error";
import { Section } from "@common/Section";
import { Card } from "@common/Card";
import { Button } from "@common/Button";
import { Eyebrow, H2, Lead, Muted } from "@common/Text";
import { Pill } from "@common/Pill";
import { StatCard } from "@components/main/StatCard";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const captchaRef = useRef<CaptchaRef>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = await captchaRef.current?.execute();
      if (!token) {
        setError("Captcha validation failed. Try again.");
        setLoading(false);
        return;
      }

      await login({
        email,
        password,
        remember: rememberMe,
        captcha: token,
      });

      window.location.href = "/dashboard";
    } catch (err: unknown) {
      const serverError =
        (err as { response?: { data?: { error?: string; message?: string } } })
          ?.response?.data?.error ??
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        "Invalid email or password";

      setError(serverError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Soft background accents – same as home */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-50 via-white to-indigo-50 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[520px] translate-x-1/4 translate-y-1/4 rounded-full bg-indigo-50 blur-3xl" />
      </div>

      <Section className="pt-12 md:pt-16">
        <div className="grid items-stretch gap-10 md:grid-cols-2">
          {/* Form card */}
          <Card className="p-6 md:p-8">
            <Eyebrow className="mb-4">
              <span className="h-2 w-2 rounded-full bg-indigo-600" />
              Welcome back
            </Eyebrow>

            <H2 className="text-2xl md:text-3xl">Sign in to your account</H2>
            <Muted className="mt-2">Continue to SchoolSpace.</Muted>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <GoogleButton />
              <MicrosoftButton />
            </div>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 rounded-full bg-slate-200" />
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Or
              </span>
              <div className="h-px flex-1 rounded-full bg-slate-200" />
            </div>

            {error ? (
              <Error message={error} onDismiss={() => setError(null)} />
            ) : null}

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <div className="relative mt-1">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    value={email}
                    placeholder="you@school.edu"
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    required
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative mt-1">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    placeholder="••••••••"
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    required
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-12 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-2 rounded-lg"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-slate-700">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
                  />
                  Remember me
                </label>
                <Link
                  to="/forgot-password"
                  className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                title={loading ? "Signing in..." : "Sign in"}
                loading={loading}
                disabled={loading}
                className="w-full rounded-2xl h-12"
              />
            </form>

            <Muted className="mt-6">
              Don't have an account?{" "}
              <Link
                to="/auth/signup"
                className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Sign up
              </Link>
            </Muted>
          </Card>

          {/* Context panel – expanded, home-style */}
          <aside className="hidden md:flex md:flex-col md:gap-4">
            <Card className="flex-1 p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
                    Your academic journey, organized
                  </h2>
                  <Lead className="mt-2 max-w-md">
                    One place for courses, clubs, and campus life. SchoolSpace
                    brings clarity to academic management—for students, staff,
                    and administrators.
                  </Lead>
                </div>
                <Pill className="bg-indigo-50 text-indigo-700 border-indigo-100 shrink-0">
                  SSO-ready
                </Pill>
              </div>

              <div className="mt-6 grid gap-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  What you get
                </div>
                <ul className="space-y-3">
                  {[
                    "Browse and compare courses across institutions",
                    "Track programs, deadlines, and shortlists",
                    "Built for students, advisors, and administrators",
                    "Clean dashboards and simple navigation",
                    "Role-based access and audit-friendly tools",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-slate-700"
                    >
                      <CheckCircle2
                        className="mt-0.5 shrink-0 text-indigo-600"
                        size={18}
                      />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <StatCard
                  label="Institutions"
                  value="100+"
                  hint="Trust SchoolSpace"
                />
                <StatCard
                  label="Active users"
                  value="50k+"
                  hint="Every month"
                />
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="text-sm font-semibold text-slate-900">
                  Simple, modern portal
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Sign in once and access courses, clubs, announcements, and
                  deadlines in one calm, consistent interface.
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </Section>
      <GoogleRecaptcha ref={captchaRef} />
    </div>
  );
}
