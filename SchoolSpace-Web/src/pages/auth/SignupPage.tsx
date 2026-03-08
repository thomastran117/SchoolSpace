import { useRef, useState } from "react";
import { useMemo } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  CheckCircle2,
  Circle,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { Link } from "react-router-dom";
import { signup, verify } from "../../services/AuthService";
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

type Role = "student" | "teacher";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const captchaRef = useRef<CaptchaRef>(null);

  const passwordRules = useMemo(() => {
    const p = password;
    return [
      { label: "At least 8 characters", met: p.length >= 8 },
      { label: "One uppercase letter", met: /[A-Z]/.test(p) },
      { label: "One lowercase letter", met: /[a-z]/.test(p) },
      { label: "One number", met: /\d/.test(p) },
      { label: "One special character", met: /[^A-Za-z0-9]/.test(p) },
    ];
  }, [password]);

  const passwordValid = passwordRules.every((r) => r.met);

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

      await signup({
        email,
        password,
        role,
        captcha: token,
      });

      setShowVerifyModal(true);
    } catch (err: unknown) {
      const serverError =
        (err as { response?: { data?: { error?: string; message?: string } } })
          ?.response?.data?.error ??
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        "Signup failed";

      setError(serverError);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setVerifyError(null);
    setVerifyLoading(true);

    try {
      const token = await captchaRef.current?.execute();
      if (!token) {
        setVerifyError("Captcha validation failed.");
        return;
      }

      await verify({
        email,
        code: verificationCode,
        captcha: token,
      });

      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setVerifyError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Invalid code",
      );
    } finally {
      setVerifyLoading(false);
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
              Get started
            </Eyebrow>

            <H2 className="text-2xl md:text-3xl">Create your account</H2>
            <Muted className="mt-2">Join SchoolSpace in under a minute.</Muted>

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
              <Error
                message={error}
                title="Signup failed"
                onDismiss={() => setError(null)}
              />
            ) : null}

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                      role === "student"
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <GraduationCap size={16} />
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("teacher")}
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                      role === "teacher"
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <BookOpen size={16} />
                    Teacher
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <div className="relative mt-1">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    required
                    placeholder="you@school.edu"
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    required
                    placeholder="••••••••"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-12 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-2 rounded-lg"
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

                {password.length > 0 && (
                  <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                    {passwordRules.map((rule) => (
                      <li
                        key={rule.label}
                        className={`flex items-center gap-1.5 text-xs ${
                          rule.met ? "text-green-600" : "text-slate-400"
                        }`}
                      >
                        {rule.met ? (
                          <CheckCircle2 size={14} className="shrink-0" />
                        ) : (
                          <Circle size={14} className="shrink-0" />
                        )}
                        {rule.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
                />
                <span>
                  I agree to the{" "}
                  <Link
                    to="/terms-and-conditions"
                    target="_blank"
                    className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    target="_blank"
                    className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                title={loading ? "Creating account..." : "Create account"}
                loading={loading}
                disabled={loading || !agreedToTerms || !passwordValid}
                className="w-full rounded-2xl h-12"
              />
            </form>

            <Muted className="mt-6">
              Already have an account?{" "}
              <Link
                to="/auth/login"
                className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Sign in
              </Link>
            </Muted>
          </Card>

          {/* Context panel – expanded, home-style */}
          <aside className="hidden md:flex md:flex-col md:gap-4">
            <Card className="flex-1 p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
                    Built for students and educators
                  </h2>
                  <Lead className="mt-2 max-w-md">
                    One shared academic platform. Whether you're learning or
                    teaching, SchoolSpace gives you the tools to organize,
                    compare, and succeed.
                  </Lead>
                </div>
                <Pill className="bg-indigo-50 text-indigo-700 border-indigo-100 shrink-0">
                  Free to start
                </Pill>
              </div>

              <div className="mt-6 grid gap-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Why join
                </div>
                <ul className="space-y-3">
                  {[
                    "Students explore and track programs across institutions",
                    "Teachers manage and showcase courses and materials",
                    "One account for courses, clubs, and campus life",
                    "Clean dashboards and simple navigation",
                    "Role-based access—switch between student and educator",
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
                  Create your account in under a minute. No credit card
                  required—just your email and a password.
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </Section>

      <GoogleRecaptcha ref={captchaRef} />

      {/* Verify email modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <Card className="relative w-full max-w-md p-6 md:p-8 shadow-xl">
            <H2 className="text-xl md:text-2xl">Verify your email</H2>
            <Muted className="mt-2">
              Enter the 6-digit code sent to{" "}
              <span className="font-medium text-slate-700">{email}</span>
            </Muted>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={verificationCode}
              onChange={(e) =>
                setVerificationCode(e.target.value.replace(/\D/g, ""))
              }
              className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-2xl font-bold tracking-[0.6em] text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/20"
              placeholder="••••••"
            />

            {verifyError ? (
              <p className="mt-3 text-sm text-red-600">{verifyError}</p>
            ) : null}

            <div className="mt-6 flex flex-col gap-3">
              <Button
                variant="primary"
                size="lg"
                title={verifyLoading ? "Verifying..." : "Verify & Continue"}
                loading={verifyLoading}
                disabled={verifyLoading || verificationCode.length !== 6}
                className="w-full rounded-2xl h-12"
                onClick={handleVerifyCode}
              />
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                className="text-sm text-slate-500 hover:underline"
              >
                Cancel
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
