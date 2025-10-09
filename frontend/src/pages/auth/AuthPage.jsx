import { useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../stores/authSlice";
import GoogleButton from "../../components/auth/GoogleButton";
import MicrosoftButton from "../../components/auth/MicrosoftButton";
import SecondaryApi from "../../api/SecondaryApi";
import Captcha from "../../components/auth/GoogleCaptcha";
import "../../styles/auth.css";

export default function AuthPage() {
  const dispatch = useDispatch();
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "student",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const captchaRef = useRef();

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
        ? {
            email: form.email.trim(),
            password: form.password,
            role: form.role,
            captcha: token,
          }
        : {
            email: form.email.trim(),
            password: form.password,
            captcha: token,
          };

      const res = await SecondaryApi.post(endpoint, payload);

      const data = res.data;

      if (isSignup) {
        alert("Signup successful!");
        setIsSignup(false);
      } else {
        dispatch(
          setCredentials({
            token: data.accessToken,
            email: data.user,
            role: data.role,
          }),
        );
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 400) {
        setError("Invalid request. Please check your input.");
      } else if (err.response?.status === 401) {
        setError("Incorrect email or password.");
      } else if (err.response?.status === 500) {
        setError("Internal server error. Please try again later.");
      } else {
        setError(err.message || "Authentication failed.");
      }
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

  // --- UI ---
  return (
    <main
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background:
          "linear-gradient(135deg, #dbe8ff 0%, #edf3ff 50%, #e0edff 100%)",
      }}
    >
      <div
        className="p-1 rounded-4 shadow-lg position-relative"
        style={{
          background:
            "linear-gradient(135deg, #0d6efd, #6f42c1, #ff6f61, #ffc107)",
          backgroundSize: "300% 300%",
          animation: "borderShift 8s ease infinite",
          width: "100%",
          maxWidth: "900px",
        }}
      >
        <div
          className="rounded-4 bg-white position-relative overflow-hidden"
          style={{
            zIndex: 2,
            padding: "0",
          }}
        >
          {/* background blobs */}
          <div
            className="position-absolute rounded-circle"
            style={{
              top: "-50px",
              left: "-50px",
              width: "150px",
              height: "150px",
              background: "rgba(13,110,253,0.12)",
              filter: "blur(40px)",
              zIndex: 0,
            }}
          ></div>
          <div
            className="position-absolute rounded-circle"
            style={{
              bottom: "-60px",
              right: "-40px",
              width: "180px",
              height: "180px",
              background: "rgba(111,66,193,0.12)",
              filter: "blur(40px)",
              zIndex: 0,
            }}
          ></div>

          <div className="row g-0 position-relative" style={{ zIndex: 1 }}>
            {/* left illustration */}
            <div className="col-md-6 d-none d-md-flex justify-content-center align-items-center bg-light-subtle">
              <img
                src="https://cdn.dribbble.com/users/1003944/screenshots/15817552/media/ea568c474ffebf5b54b978c706ba0a6e.png"
                alt="Illustration"
                className="img-fluid"
                style={{ maxWidth: "80%", objectFit: "contain" }}
              />
            </div>

            {/* right form */}
            <div className="col-12 col-md-6 p-5">
              <div
                className={`auth-content fade-section ${
                  isSignup ? "fade-slide-right" : "fade-slide-left"
                }`}
                key={isSignup ? "signup" : "login"}
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
                        className={`bi ${
                          showPw ? "bi-eye-slash" : "bi-eye"
                        } text-secondary`}
                      ></i>
                    </button>
                  </div>

                  {isSignup && <RoleSelect />}

                  {/* inline small error message */}
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
                    {loading
                      ? "Processing..."
                      : isSignup
                        ? "Sign up"
                        : "Log in"}
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

                {/* OAuth */}
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
          </div>
        </div>
      </div>
      <Captcha ref={captchaRef} />
    </main>
  );
}
