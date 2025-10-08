import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { msalInstance, microsoftScopes, waitForMsal } from "../auth/msalClient";
import { useDispatch } from "react-redux";
import config from "../configs/envManager";
import { setCredentials } from "../stores/authSlice";

export default function AuthPage() {
  const dispatch = useDispatch();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", role: "student" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msalReady, setMsalReady] = useState(false);
  const isSignup = mode === "signup";

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await waitForMsal();
        if (active) setMsalReady(true);
      } catch {
        if (active) {
          setError("Microsoft sign-in not available.");
          setMsalReady(false);
        }
      }
    })();
    return () => (active = false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Enter a valid email.";
    if (!form.password || form.password.length < 6)
      return "Password must be at least 6 characters.";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);
    try {
      setLoading(true);
      setError("");
      const payload = isSignup
        ? { email: form.email.trim(), password: form.password, role: form.role }
        : { email: form.email.trim(), password: form.password };

      const endpoint = isSignup
        ? `${config.backend_url}/auth/signup`
        : `${config.backend_url}/auth/login`;

      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!resp.ok) throw new Error(await resp.text() || "Request failed");

      if (isSignup) {
        alert("Signup successful!");
      } else {
        const data = await resp.json();
        dispatch(setCredentials({ token: data.accessToken, email: data.user, role: data.role }));
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(isSignup ? "login" : "signup");
    setForm({ email: "", password: "", role: "student" });
    setError("");
    setShowPw(false);
  };

  const handleGoogleOAuth = async () => {
    try {
      if (!window.google) throw new Error("Google Identity not loaded");
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = `${config.frontend_url}/auth/google`;
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "id_token",
        scope: "openid email profile",
        nonce: crypto.randomUUID(),
        prompt: "select_account",
      });
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    } catch (err) {
      setError(err.message || "Google sign-in failed.");
    }
  };

  const handleMicrosoftOAuth = async () => {
    await waitForMsal();
    await msalInstance.loginRedirect({ scopes: microsoftScopes, prompt: "select_account" });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 p-6">
      <div className="w-full max-w-md relative bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Accent blobs */}
        <div className="absolute -top-16 -right-20 w-60 h-60 bg-gradient-to-br from-green-300 via-emerald-400 to-teal-400 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-br from-emerald-400 via-green-300 to-teal-300 opacity-20 rounded-full blur-3xl"></div>

        <div className="relative p-8">
          {/* Header */}
          <h2 className="text-3xl font-bold text-center text-emerald-700 mb-1">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-center text-gray-600 mb-6">
            {isSignup
              ? "Join our vibrant community today!"
              : "Sign in to continue your journey."}
          </p>

          {/* OAuth Buttons (unified design) */}
          <div className="flex flex-col gap-3 mb-6">
            <button
              onClick={handleGoogleOAuth}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-white text-gray-700 font-medium shadow-md hover:shadow-lg active:shadow-sm transition-all duration-150 border border-transparent"
            >
              {GoogleIcon}
              Continue with Google
            </button>
            <button
              onClick={handleMicrosoftOAuth}
              disabled={loading || !msalReady}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-white text-gray-700 font-medium shadow-md hover:shadow-lg active:shadow-sm transition-all duration-150 border border-transparent"
            >
              {MicrosoftIcon}
              Continue with Microsoft
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2 my-5">
            <div className="flex-grow border-t border-gray-200" />
            <span className="text-sm text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-700 p-2 text-sm rounded mb-3 border border-red-100">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full mt-1 px-3 py-2 rounded-md border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full mt-1 px-3 py-2 rounded-md border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-600"
                >
                  <i className={`bi ${showPw ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>
            </div>

            {isSignup && (
              <div>
                <label className="text-sm font-medium text-gray-700">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 rounded-md border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="assistant">Assistant</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2 rounded-md bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white font-semibold hover:opacity-95 shadow-md transition-all duration-150"
            >
              {loading ? "Processing..." : isSignup ? "Sign Up" : "Login"}
            </button>
          </form>

          {/* Switch Mode */}
          <div className="mt-5 text-center text-sm text-gray-600">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-emerald-600 hover:underline font-medium"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                New here?{" "}
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-emerald-600 hover:underline font-medium"
                >
                  Create account
                </button>
              </>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Your Company ·{" "}
            <NavLink
              to="/privacy"
              className="underline text-emerald-600 hover:text-emerald-700"
            >
              Privacy
            </NavLink>
          </p>
        </div>
      </div>
    </main>
  );
}

// Unified icons
const GoogleIcon = (
  <svg className="w-5 h-5" viewBox="0 0 533.5 544.3">
    <path fill="#EA4335" d="M533.5 278.4c0-18.5..." />
  </svg>
);

const MicrosoftIcon = (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#F25022" d="M11.5 11.5H2.5V2.5h9z" />
    <path fill="#7FBA00" d="M21.5 11.5h-9V2.5h9z" />
    <path fill="#00A4EF" d="M11.5 21.5H2.5v-9h9z" />
    <path fill="#FFB900" d="M21.5 21.5h-9v-9h9z" />
  </svg>
);
