import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../stores/authSlice";
import GoogleButton from "./GoogleButton";
import MicrosoftButton from "./MicrosoftButton";
import PublicApi from "../../api/PublicApi";

export default function AuthSection({ isSignup, setIsSignup, captchaRef }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "student",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Enter a valid email.";
    if (!form.password || form.password.length < 6)
      return "Password must be at least 6 characters.";
    if (isSignup && !form.role) return "Please select your role.";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);

    try {
      setLoading(true);
      setError("");

      const endpoint = isSignup ? "/auth/signup" : "/auth/login";
      const token = await captchaRef.current.execute();
      if (!token) {
        setError("Captcha verification failed. Please try again.");
        setLoading(false);
        return;
      }

      const payload = isSignup
        ? { ...form, email: form.email.trim(), captcha: token }
        : { email: form.email.trim(), password: form.password, captcha: token };

      const res = await PublicApi.post(endpoint, payload);
      const { accessToken, username, avatar, role } = res.data;

      if (isSignup) {
        alert("Signup successful!");
        setIsSignup(false);
      } else {
        dispatch(
          setCredentials({ token: accessToken, username, role, avatar }),
        );
      }
    } catch (err) {
      if (err.response?.data?.message) setError(err.response.data.message);
      else if (err.response?.status === 400)
        setError("Invalid request. Please check your input.");
      else if (err.response?.status === 401)
        setError("Incorrect email or password.");
      else if (err.response?.status === 500)
        setError("Internal server error. Please try again later.");
      else setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const RoleSelect = () => (
    <div className="d-flex justify-content-center gap-3 mt-3">
      {["student", "teacher"].map((role) => (
        <div
          key={role}
          onClick={() => setForm((prev) => ({ ...prev, role }))}
          className={`role-card text-center px-4 py-3 rounded-3 border ${
            form.role === role
              ? "border-primary bg-primary-subtle"
              : "border-secondary-subtle bg-light"
          }`}
          style={{
            cursor: "pointer",
            minWidth: "120px",
            transition: "all 0.3s ease",
          }}
        >
          <i
            className={`bi ${
              role === "student" ? "bi-mortarboard" : "bi-person-badge"
            } mb-2 fs-4 ${
              form.role === role ? "text-primary" : "text-secondary"
            }`}
          ></i>
          <div
            className={`fw-semibold ${
              form.role === role ? "text-primary" : "text-muted"
            }`}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="col-12 col-md-6 p-5 position-relative overflow-hidden">
      <div className="auth-ribbons">
        <svg viewBox="0 0 800 600" preserveAspectRatio="none">
          <defs>
            <linearGradient
              id="ribbonGradient1"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#a2d2ff" />
              <stop offset="50%" stopColor="#ffc8dd" />
              <stop offset="100%" stopColor="#bde0fe" />
            </linearGradient>
            <linearGradient
              id="ribbonGradient2"
              x1="0%"
              y1="100%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#ffd6a5" />
              <stop offset="50%" stopColor="#cdb4db" />
              <stop offset="100%" stopColor="#ffafcc" />
            </linearGradient>
          </defs>
          <path
            d="M -50 150 C 200 250, 400 50, 850 250"
            fill="none"
            stroke="url(#ribbonGradient1)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.4"
          />
          <path
            d="M -50 300 C 200 400, 450 200, 850 400"
            fill="none"
            stroke="url(#ribbonGradient2)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.35"
          />
        </svg>
      </div>

      <div
        className={`auth-content fade-section ${
          isSignup ? "fade-slide-right" : "fade-slide-left"
        }`}
        key={isSignup ? "signup" : "login"}
        style={{ position: "relative", zIndex: 2 }}
      >
        <h3
          className="fw-bold mb-4 text-center"
          style={{
            color: isSignup ? "#6f42c1" : "#0d6efd",
            transition: "color 0.4s ease",
          }}
        >
          {isSignup ? "Create Account" : "Welcome Back"}
        </h3>

        <form className="d-grid gap-4" onSubmit={onSubmit}>
          <div className="position-relative">
            <i
              className="bi bi-envelope position-absolute"
              style={{
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6c757d",
              }}
            ></i>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              className="form-control border-0 border-bottom ps-4"
              placeholder="you@example.com"
              style={{
                borderRadius: 0,
                boxShadow: "none",
                background: "transparent",
              }}
            />
          </div>

          <div className="position-relative">
            <i
              className="bi bi-lock position-absolute"
              style={{
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6c757d",
              }}
            ></i>
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              type={showPw ? "text" : "password"}
              className="form-control border-0 border-bottom ps-4 pe-4"
              placeholder="Password"
              style={{
                borderRadius: 0,
                boxShadow: "none",
                background: "transparent",
              }}
            />
            <button
              type="button"
              className="btn position-absolute p-0"
              style={{
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
              }}
              onClick={() => setShowPw((prev) => !prev)}
            >
              <i
                className={`bi ${showPw ? "bi-eye-slash" : "bi-eye"} text-secondary`}
              ></i>
            </button>
          </div>

          {isSignup && <RoleSelect />}

          {error && (
            <small className="text-danger text-center fw-semibold mt-2">
              {error}
            </small>
          )}

          {!isSignup && (
            <div className="form-check mt-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="remember"
              />
              <label className="form-check-label" htmlFor="remember">
                Remember me
              </label>
            </div>
          )}

          <button
            type="submit"
            className="btn w-100 mt-3 text-white"
            disabled={loading}
            style={{
              backgroundColor: isSignup ? "#6f42c1" : "#0d6efd",
              border: "none",
              transition: "background-color 0.3s ease",
            }}
          >
            {loading ? "Processing..." : isSignup ? "Sign up" : "Log in"}
          </button>

          <div className="text-center mt-2">
            <button
              type="button"
              className="btn btn-link text-decoration-none"
              onClick={() => setIsSignup((prev) => !prev)}
              disabled={loading}
            >
              {isSignup
                ? "Already have an account? Log in"
                : "New here? Create account"}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-muted small mb-3">Or continue with</p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <GoogleButton disabled={loading} />
            <MicrosoftButton disabled={loading} />
          </div>
        </div>

        <p className="text-center text-muted small mt-4 mb-0">
          © {new Date().getFullYear()} SchoolSpace ·{" "}
          <NavLink to="/privacy" className="text-decoration-none">
            Privacy Policy
          </NavLink>
        </p>
      </div>
    </div>
  );
}
