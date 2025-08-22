import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSignup = mode === "signup";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    setError("");
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Enter a valid email.";
    if (!form.password || form.password.length < 6) return "Password must be at least 6 characters.";
    if (isSignup) {
      if (!form.name.trim()) return "Enter your name.";
      if (form.password !== form.confirm) return "Passwords do not match.";
    }
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    try {
      setLoading(true); setError("");
      const payload = { name: form.name.trim(), email: form.email.trim(), password: form.password };
      await onAuth?.(mode, payload);
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally { setLoading(false); }
  };

  const switchMode = () => {
    setMode(isSignup ? "login" : "signup");
    setForm({ name: "", email: "", password: "", confirm: "" });
    setError(""); setShowPw(false);
  };

  const handleOAuth = (provider) => {
    if (provider === "microsoft") {
      window.location.href = `http://localhost:8040/api/auth/microsoft/start`;
    } else if (provider === "google") {
      window.location.href = `http://localhost:8040/api/auth/google/start`;
    }
  };

  return (
    <main className="min-vh-100 d-flex align-items-center bg-light">
      <style>{`
        .auth-card { max-width: 440px; }
        .btn-google { border-color: #e5e7eb; }
        .btn-google:hover { background: #f8fafc; }
        .btn-microsoft { border-color: #e5e7eb; }
        .btn-microsoft:hover { background: #f8fafc; }
        .icon { width: 18px; height: 18px; }
      `}</style>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 auth-card">
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
              <div className="mb-3 text-center">
                <h2 className="fw-bold m-0">{isSignup ? "Create account" : "Sign in"}</h2>
                <div className="text-secondary small mt-1">Welcome {isSignup ? "aboard" : "back"}</div>
              </div>

              {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}

              {/* OAuth buttons */}
              <div className="d-grid gap-2 mb-3">
                <button type="button" className="btn btn-light border btn-google rounded-pill d-flex align-items-center justify-content-center gap-2" onClick={() => handleOAuth("google")}>
                  {GoogleIcon}
                  Continue with Google
                </button>
                <button type="button" className="btn btn-light border btn-microsoft rounded-pill d-flex align-items-center justify-content-center gap-2" onClick={() => handleOAuth("microsoft")}>
                  {MicrosoftIcon}
                  Continue with Microsoft
                </button>
              </div>

              <div className="d-flex align-items-center my-2">
                <hr className="flex-grow-1" /><span className="mx-2 text-secondary small">or</span><hr className="flex-grow-1" />
              </div>

              {/* Form */}
              <form onSubmit={onSubmit} className="d-grid gap-3">
                {isSignup && (
                  <div>
                    <label htmlFor="name" className="form-label">Full name</label>
                    <input type="text" className="form-control" id="name" name="name" value={form.name} onChange={handleChange} autoComplete="name" required />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="form-label">Email</label>
                  <input type="email" className="form-control" id="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" required />
                </div>

                <div>
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="input-group">
                    <input type={showPw ? "text" : "password"} className="form-control" id="password" name="password" value={form.password} onChange={handleChange} minLength={6} autoComplete={isSignup ? "new-password" : "current-password"} required />
                    <button className="btn btn-outline-secondary" type="button" onClick={() => setShowPw((s) => !s)}>{showPw ? "Hide" : "Show"}</button>
                  </div>
                </div>

                {isSignup && (
                  <div>
                    <label htmlFor="confirm" className="form-label">Confirm password</label>
                    <input type={showPw ? "text" : "password"} className="form-control" id="confirm" name="confirm" value={form.confirm} onChange={handleChange} minLength={6} autoComplete="new-password" required />
                  </div>
                )}

                {!isSignup && (
                  <div className="d-flex justify-content-between align-items-center small">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="remember" />
                      <label className="form-check-label" htmlFor="remember">Remember me</label>
                    </div>
                    <NavLink to="/forgot" className="text-decoration-none">Forgot password?</NavLink>
                  </div>
                )}

                <button className="btn btn-success w-100 rounded-pill" type="submit" disabled={loading}>
                  {loading ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
                </button>
              </form>

              <div className="text-center mt-3">
                <button className="btn btn-link text-decoration-none" onClick={switchMode}>
                  {isSignup ? "Have an account? Sign in" : "New here? Create account"}
                </button>
              </div>

              <div className="text-center mt-1 text-secondary small">
                © {new Date().getFullYear()} Your Company · <NavLink to="/privacy">Privacy</NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const GoogleIcon = (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-1.6 3.5-5.4 3.5-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.6 1.4l2.4-2.3C16.9 3 14.7 2 12 2 6.9 2 2.7 6.2 2.7 11.3S6.9 20.7 12 20.7c5.7 0 9.4-4 9.4-9.5 0-.6-.1-1-.2-1.5H12z"/><path fill="#34A853" d="M3.9 7.6l3.2 2.3C8 7.4 9.8 6.1 12 6.1c1.8 0 3 .8 3.6 1.4l2.4-2.3C16.9 3 14.7 2 12 2 8 2 4.6 4.2 3.9 7.6z"/><path fill="#4A90E2" d="M12 20.7c2.7 0 5-.9 6.6-2.5l-3.1-2.6c-.9.6-2.2 1-3.5 1-2.6 0-4.8-1.7-5.6-4.1l-3.3 2.5C4.7 18.9 8 20.7 12 20.7z"/><path fill="#FBBC05" d="M20.6 11.2c0-.5-.1-.9-.2-1.4H12v3.9h5.4c-.3 1.4-1.6 2.3-3.4 2.3-.9 0-2.1-.4-2.9-1.2l-3.3 2.5c1.5 2.7 4 4.4 6.8 4.4 3.5 0 6.6-1.9 7.9-5 1-2.3 1.1-4.2 1.1-5.1z"/></svg>
);

const MicrosoftIcon = (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="#F25022" d="M11.5 11.5H2.5V2.5h9z"/><path fill="#7FBA00" d="M21.5 11.5h-9V2.5h9z"/><path fill="#00A4EF" d="M11.5 21.5H2.5v-9h9z"/><path fill="#FFB900" d="M21.5 21.5h-9v-9h9z"/></svg>
);
