import { useRef, useState } from "react";
import { Eye, EyeOff, Mail, Lock, CheckCircle2 } from "lucide-react";
import { login } from "../../services/AuthService";
import GoogleRecaptcha, {
  type CaptchaRef,
} from "../../components/auth/GoogleRecaptcha";

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

      const data = await login({
        email,
        password,
        remember: rememberMe,
        captcha: token,
      });

      console.log(data);

      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-indigo-500 to-fuchsia-500" />
      <div className="absolute inset-0 bg-white/20" />

      {/* Decorative blobs */}
      <div className="absolute -top-48 -right-48 w-[600px] h-[600px] bg-purple-400/35 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-24 w-[420px] h-[420px] bg-fuchsia-400/30 rounded-full blur-3xl" />
      <div className="absolute bottom-[-40%] left-1/2 w-[720px] h-[720px] bg-indigo-400/30 rounded-full blur-3xl" />

      <div className="relative z-10 min-h-screen flex items-center py-16 lg:py-24">
        <div className="w-full max-w-7xl px-6 lg:pl-20">
          <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-16 items-center">
            {/* -------- Left: Auth Form -------- */}
            <section
              className="
                bg-white/65 backdrop-blur-xl
                border border-white/40
                rounded-2xl
                px-10 py-14
              "
            >
              {/* Brand */}
              <div className="mb-8">
                <span className="inline-block mb-3 text-sm font-medium text-purple-700">
                  Welcome back
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900">
                  Sign in to your account
                </h2>
                <p className="mt-2 text-slate-700">Continue to SchoolSpace.</p>
              </div>

              {/* OAuth */}
              <div className="space-y-3">
                <button className="w-full cursor-pointer rounded-lg border border-slate-300 bg-white/70 py-2.5 text-sm font-medium hover:bg-white transition">
                  Continue with Google
                </button>
                <button className="w-full cursor-pointer rounded-lg border border-slate-300 bg-white/70 py-2.5 text-sm font-medium hover:bg-white transition">
                  Continue with Microsoft
                </button>
              </div>

              {/* Divider */}
              <div className="my-8 flex items-center gap-4">
                <div className="h-[2px] flex-1 rounded-full bg-slate-400/70" />
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  OR
                </span>
                <div className="h-[2px] flex-1 rounded-full bg-slate-400/70" />
              </div>

              {/* Form */}
              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Email */}
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
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="
                        w-full rounded-lg
                        border border-slate-300
                        bg-white/70
                        py-2.5 pl-10 pr-4 text-sm
                        focus:border-purple-500
                        focus:ring-2 focus:ring-purple-500/20
                        outline-none
                      "
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Password
                  </label>

                  <div className="relative mt-1">
                    {/* Left icon */}
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    {/* Input */}
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      placeholder="••••••••"
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="
        w-full rounded-lg
        border border-slate-300
        bg-white/70
        py-2.5 pl-10 pr-12 text-sm
        focus:border-purple-500
        focus:ring-2 focus:ring-purple-500/20
        outline-none
      "
                    />

                    {/* Toggle visibility */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="
        absolute right-3 top-1/2 -translate-y-1/2
        text-slate-400 hover:text-slate-600
        cursor-pointer
        focus:outline-none
      "
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Remember / Forgot */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 cursor-pointer"
                    />
                    Remember me
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-purple-700 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="
                        w-full rounded-lg
                        bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600
                        py-2.5 text-white font-medium
                        hover:brightness-110
                        transition
                        disabled:opacity-60
                        cursor-pointer
                    "
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <p className="mt-7 text-sm text-slate-700">
                Don’t have an account?{" "}
                <a
                  href="/register"
                  className="text-purple-700 font-medium hover:underline"
                >
                  Sign up
                </a>
              </p>
            </section>

            {/* -------- Right: Context / Value -------- */}
            <aside className="hidden lg:block">
              <h1 className="text-4xl font-extrabold text-white leading-tight max-w-xl">
                Your academic journey,
                <br />
                <span className="text-white/90">organized in one place</span>
              </h1>

              <p className="mt-6 text-white/90 max-w-lg">
                SchoolSpace helps students explore programs, compare schools,
                and make confident academic decisions with clarity.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  "Browse and compare courses across institutions",
                  "Track programs, deadlines, and shortlists",
                  "Built for students, advisors, and administrators",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-white/90"
                  >
                    <CheckCircle2 className="mt-0.5 text-white" size={18} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </div>
      <GoogleRecaptcha ref={captchaRef} />
    </div>
  );
}
