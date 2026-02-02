import { useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  CheckCircle2,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { signup, verify } from "../../services/AuthService";
import GoogleRecaptcha, {
  type CaptchaRef,
} from "../../components/auth/GoogleRecaptcha";
import MicrosoftButton from "../../components/auth/MicrosoftButton";
import GoogleButton from "../../components/auth/GoogleButton";
import Error from "../../components/shared/Error";

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

  const captchaRef = useRef<CaptchaRef>(null);

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

      const data = await signup({
        email,
        password,
        role,
        captcha: token,
      });

      setShowVerifyModal(true);
    } catch (err: any) {
      const serverError =
        err?.response?.data?.error ??
        err?.response?.data?.message ??
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

      const data = await verify({
        email,
        code: verificationCode,
        captcha: token,
      });
    } catch (err: any) {
      setVerifyError(err?.response?.data?.message ?? "Invalid code");
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-indigo-500 to-fuchsia-500" />
      <div className="absolute inset-0 bg-white/20" />

      {/* Decorative blobs */}
      <div className="absolute -top-48 -right-48 w-[600px] h-[600px] bg-purple-400/35 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-24 w-[420px] h-[420px] bg-fuchsia-400/30 rounded-full blur-3xl" />
      <div className="absolute bottom-[-40%] left-1/2 w-[720px] h-[720px] bg-indigo-400/30 rounded-full blur-3xl" />

      <div className="relative z-10 min-h-screen flex items-center py-16 lg:py-24">
        <div className="w-full max-w-7xl px-6 lg:pl-20">
          <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-16 items-center">
            {/* -------- Left: Signup Form -------- */}
            <section className="bg-white/65 backdrop-blur-xl border border-white/40 rounded-2xl px-10 py-14">
              {/* Header */}
              <div className="mb-8">
                <span className="inline-block mb-3 text-sm font-medium text-purple-700">
                  Get started
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900">
                  Create your account
                </h2>
                <p className="mt-2 text-slate-700">
                  Join SchoolSpace in under a minute.
                </p>
              </div>

              {/* OAuth */}
              <div className="grid grid-cols-2 gap-3">
                <GoogleButton />
                <MicrosoftButton />
              </div>

              {/* Divider */}
              <div className="my-8 flex items-center gap-4">
                <div className="h-[2px] flex-1 rounded-full bg-slate-400/70" />
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  OR
                </span>
                <div className="h-[2px] flex-1 rounded-full bg-slate-400/70" />
              </div>

              {error ? (
                <Error message={error} title="Signup failed"onDismiss={() => setError(null)} />
              ) : null}

              {/* Form */}
              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    I am a
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("student")}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition cursor-pointer ${
                        role === "student"
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-slate-300 bg-white/70 hover:bg-white"
                      }`}
                    >
                      <GraduationCap size={16} />
                      Student
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole("teacher")}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition cursor-pointer ${
                        role === "teacher"
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-slate-300 bg-white/70 hover:bg-white"
                      }`}
                    >
                      <BookOpen size={16} />
                      Teacher
                    </button>
                  </div>
                </div>

                {/* Email */}
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
                      className="w-full rounded-lg border border-slate-300 bg-white/70 py-2.5 pl-10 pr-4 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                    />
                  </div>
                </div>

                {/* Password */}
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
                      className="w-full rounded-lg border border-slate-300 bg-white/70 py-2.5 pl-10 pr-12 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 py-2.5 text-white font-medium hover:brightness-110 transition disabled:opacity-60 cursor-pointer"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </form>

              <p className="mt-7 text-sm text-slate-700">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-purple-700 font-medium hover:underline"
                >
                  Sign in
                </a>
              </p>
            </section>

            {/* -------- Right: Context -------- */}
            <aside className="hidden lg:block">
              <h1 className="text-4xl font-extrabold text-white leading-tight max-w-xl">
                Built for students
                <br />
                <span className="text-white/90">and educators alike</span>
              </h1>

              <p className="mt-6 text-white/90 max-w-lg">
                Whether you're learning or teaching, SchoolSpace gives you the
                tools to organize, compare, and succeed.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  "Students explore and track programs",
                  "Teachers manage and showcase courses",
                  "One shared academic platform",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-white/90"
                  >
                    <CheckCircle2 size={18} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </div>

      <GoogleRecaptcha ref={captchaRef} />

      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <h3 className="text-2xl font-extrabold text-slate-900">
              Verify your email
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              Enter the 6-digit code sent to{" "}
              <span className="font-medium">{email}</span>
            </p>

            {/* Code Input */}
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={verificationCode}
              onChange={(e) =>
                setVerificationCode(e.target.value.replace(/\D/g, ""))
              }
              className="mt-6 w-full rounded-xl border border-slate-300 px-4 py-3
                        text-center text-2xl tracking-[0.6em] font-bold
                        focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30
                        outline-none"
              placeholder="••••••"
            />

            {verifyError && (
              <p className="mt-3 text-sm text-red-600">{verifyError}</p>
            )}

            <button
              onClick={handleVerifyCode}
              disabled={verifyLoading || verificationCode.length !== 6}
              className="mt-6 w-full rounded-lg bg-gradient-to-r
                        from-purple-600 via-indigo-600 to-fuchsia-600
                        py-2.5 text-white font-medium
                        hover:brightness-110 transition
                        disabled:opacity-50"
            >
              {verifyLoading ? "Verifying..." : "Verify & Continue"}
            </button>

            <button
              onClick={() => setShowVerifyModal(false)}
              className="mt-4 w-full text-sm text-slate-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
