import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { msalInstance, microsoftScopes, waitForMsal } from "../auth/msalClient";
import "../styles/auth.css";
export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msalReady, setMsalReady] = useState(false);

  const isSignup = mode === "signup";

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await waitForMsal();
        if (alive) setMsalReady(true);
      } catch (e) {
        if (alive) {
          setError("Microsoft sign-in not available (MSAL init failed).");
          setMsalReady(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    setError("");
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Enter a valid email.";
    if (!form.password || form.password.length < 6)
      return "Password must be at least 6 characters.";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      };

      const endpoint = isSignup
        ? "http://localhost:8040/api/auth/signup"
        : "http://localhost:8040/api/auth/login";

      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const msg = await resp.text();
        throw new Error(msg || `Request failed (${resp.status})`);
      }

      const data = await resp.json();
      console.log("Auth success:", data);
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(isSignup ? "login" : "signup");
    setForm({ name: "", email: "", password: "", confirm: "" });
    setError("");
    setShowPw(false);
  };

  const handleGoogleOAuth = async () => {
    try {
      setError("");
      setLoading(true);

      if (!window.google)
        throw new Error("Google Identity Services not loaded");

      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = "http://localhost:3040/auth/callback";
      const scope = "openid email profile";

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "id_token",
        scope,
        nonce: crypto.randomUUID(),
        prompt: "select_account",
      });

      const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

      window.location.href = url;
    } catch (err) {
      setError(err.message || "Google sign-in failed.");
      setLoading(false);
    }
  };

  const handleMicrosoftOAuth = async () => {
    try {
      setError("");
      setLoading(true);
      await waitForMsal();

      const loginResult = await msalInstance.loginPopup({
        scopes: microsoftScopes,
        prompt: "select_account",
      });

      const idToken = loginResult.idToken;
      if (!idToken)
        throw new Error("Microsoft sign-in failed: missing id_token");

      const resp = await fetch(
        "http://localhost:8040/api/auth/microsoft/verify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ id_token: idToken }),
        },
      );

      if (!resp.ok) {
        const msg = await resp.text();
        throw new Error(msg || `Verify failed (${resp.status})`);
      }

      const data = await resp.json();
      console.log("Microsoft OAuth success:", data);
    } catch (err) {
      setError(err?.message || "Microsoft sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-vh-100 d-flex align-items-center bg-gradient">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 auth-wrapper d-flex">
            {/* Left column - form */}
            <div className="col-12 col-md-6 auth-form">
              <div className="mb-4 text-center">
                <h2 className="auth-title">
                  {isSignup ? "Create Account" : "Sign In"}
                </h2>
                <p className="auth-subtitle mb-0">
                  {isSignup
                    ? "Join us and get started!"
                    : "Welcome back, please login."}
                </p>
              </div>

              {error && <div className="alert alert-danger py-2">{error}</div>}

              {/* OAuth buttons */}
              <div className="d-grid gap-2 mb-3">
                <button
                  type="button"
                  className="btn btn-oauth btn-google"
                  onClick={handleGoogleOAuth}
                  disabled={loading}
                >
                  {GoogleIcon}
                  Continue with Google
                </button>
                <button
                  type="button"
                  className="btn btn-oauth btn-microsoft"
                  onClick={handleMicrosoftOAuth}
                  disabled={loading || !msalReady}
                >
                  {MicrosoftIcon}
                  {msalReady
                    ? "Continue with Microsoft"
                    : "Microsoft (loading…)"}
                </button>
              </div>

              <div className="d-flex align-items-center my-3">
                <hr className="flex-grow-1" />
                <span className="mx-2 text-secondary small">or</span>
                <hr className="flex-grow-1" />
              </div>

              {/* Auth form */}
              <form onSubmit={onSubmit} className="d-grid gap-3">
                <div>
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <div className="input-group input-with-icon">
                    <span className="input-group-text">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="input-group input-with-icon">
                    <span className="input-group-text">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type={showPw ? "text" : "password"}
                      className="form-control"
                      id="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      minLength={6}
                      required
                    />
                    <button
                      className="btn btn-outline-secondary toggle-password"
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                    >
                      <i
                        className={`bi ${showPw ? "bi-eye-slash" : "bi-eye"}`}
                      ></i>
                    </button>
                  </div>
                </div>
              </form>

              <div className="text-center mt-3">
                <span
                  className="switch-mode"
                  onClick={switchMode}
                  disabled={loading}
                >
                  {isSignup
                    ? "Already have an account? Sign in"
                    : "New here? Create account"}
                </span>
              </div>

              <div className="text-center mt-4 text-secondary small">
                © {new Date().getFullYear()} Your Company ·{" "}
                <NavLink to="/privacy">Privacy</NavLink>
              </div>
            </div>

            <div className="col-6 d-none d-md-block auth-image" />
          </div>
        </div>
      </div>
    </main>
  );
}

const GoogleIcon = (
  <svg
    className="icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 533.5 544.3"
    aria-hidden="true"
  >
    <path
      fill="#4285F4"
      d="M533.5 278.4c0-18.5-1.5-37-4.7-54.9H272v103.9h147.5c-6.4 34.7-25.7 64-54.8 83.7v69.4h88.4c51.6-47.6 80.4-117.8 80.4-202.1z"
    />
    <path
      fill="#34A853"
      d="M272 544.3c73.9 0 135.9-24.5 181.2-66.2l-88.4-69.4c-24.6 16.6-56.1 26.3-92.8 26.3-71.3 0-131.7-48.1-153.4-112.8H28v70.7c45.2 89.1 138.7 151.4 244 151.4z"
    />
    <path
      fill="#FBBC05"
      d="M118.6 322.2c-10.9-32.6-10.9-67.6 0-100.2V151.3H28c-38.2 76.2-38.2 165.5 0 241.7l90.6-70.8z"
    />
    <path
      fill="#EA4335"
      d="M272 107.7c39.9-.6 78.1 14.7 107.2 42.9l79.6-79.6C408 24.6 343.6-.7 272 0 166.7 0 73.2 62.3 28 151.3l90.6 70.7C140.3 155.8 200.7 107.7 272 107.7z"
    />
  </svg>
);

const MicrosoftIcon = (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#F25022" d="M11.5 11.5H2.5V2.5h9z" />
    <path fill="#7FBA00" d="M21.5 11.5h-9V2.5h9z" />
    <path fill="#00A4EF" d="M11.5 21.5H2.5v-9h9z" />
    <path fill="#FFB900" d="M21.5 21.5h-9v-9h9z" />
  </svg>
);
