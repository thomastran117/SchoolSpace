import React, { useRef, useState } from "react";
import GoogleRecaptcha, {
  type CaptchaRef,
} from "../../components/auth/GoogleRecaptcha";
import { useNavigate } from "react-router-dom";

import GoogleButton from "../../components/auth/GoogleButton";
import MicrosoftButton from "../../components/auth/MicrosoftButton";
import PublicApi from "../../api/PublicApi";

import "../../styles/auth/Auth.css";

const SignupPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher" | null>(null);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const captchaRef = useRef<CaptchaRef>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!role) {
      setError("Please select a role (Student or Teacher).");
      return;
    }

    setLoading(true);

    try {
      const token = await captchaRef.current?.execute();
      if (!token) {
        setError("Captcha validation failed. Try again.");
        setLoading(false);
        return;
      }

      await PublicApi.post("/auth/signup", {
        email,
        password,
        role,
        captcha: token,
      });

      setSuccessMessage(
        `A verification link has been sent to ${email}. Please check your inbox to activate your account.`,
      );

      setTimeout(() => {
        navigate("/auth/login");
      }, 5000);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Signup failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page position-relative">
      <div className="login-bg-gradient-1" />
      <div className="login-bg-gradient-2" />

      <div className="container py-5">
        <div className="login-card mx-auto d-flex flex-wrap">
          <div className="col-lg-6 login-left text-white d-flex flex-column justify-content-center p-5">
            <h1 className="fw-bold display-5">Create Your Account</h1>
            <p className="subtitle mt-3">
              Join SchoolSpace and access your academic tools, resources, and
              schedules—all in one place.
            </p>

            <div className="wave-right-1"></div>
            <div className="wave-right-2"></div>
            <div className="circle-outline circle-o-1"></div>
            <div className="circle-outline circle-o-2"></div>
            <div className="circle-outline circle-o-3"></div>
            <div className="circle-outline circle-o-4"></div>
            <div className="circle-outline circle-o-5"></div>
          </div>

          <div className="col-lg-6 bg-white p-5 login-right position-relative">
            <h2 className="fw-bold mb-2">Sign Up</h2>
            <p className="text-muted mb-4">
              Start your journey with SchoolSpace.
            </p>

            <form onSubmit={handleSignup} className="w-100">
              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Password</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-lock"></i>
                  </span>

                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button
                    type="button"
                    className="input-group-text toggle-view"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i
                      className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                    />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Select Role</label>

                <div className="d-flex gap-3">
                  <button
                    type="button"
                    className={`role-btn ${role === "student" ? "active-role" : ""}`}
                    onClick={() => setRole("student")}
                  >
                    <i className="bi bi-book"></i> Student
                  </button>

                  <button
                    type="button"
                    className={`role-btn ${role === "teacher" ? "active-role" : ""}`}
                    onClick={() => setRole("teacher")}
                  >
                    <i className="bi bi-mortarboard"></i> Teacher
                  </button>
                </div>
              </div>

              <div className="form-check mb-3 d-flex align-items-center">
                <input
                  type="checkbox"
                  className="form-check-input mt-0"
                  id="agreeTerms"
                  required
                />

                <label
                  htmlFor="agreeTerms"
                  className="form-check-label ms-2 d-flex align-items-center flex-wrap"
                >
                  I agree to the{" "}
                  <button
                    type="button"
                    className="btn btn-link p-0 text-primary ms-1"
                    onClick={() => navigate("/legal/terms")}
                  >
                    Terms & Conditions
                  </button>
                </label>
              </div>

              {successMessage && (
                <div className="auth-success-box mb-2">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  {successMessage}
                </div>
              )}

              {error && (
                <div className="auth-error-box mb-2">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-login-purple w-100 py-3 mb-2 d-flex justify-content-center align-items-center"
                disabled={loading}
              >
                {loading && (
                  <div
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></div>
                )}
                {loading ? "Creating account…" : "Sign Up"}
              </button>

              <GoogleRecaptcha ref={captchaRef} />
            </form>

            <div className="login-divider text-center my-4">
              <span className="divider-text">or</span>
            </div>

            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <GoogleButton disabled={loading} />
              <MicrosoftButton disabled={loading} />
            </div>

            <div className="login-signup-row mt-4">
              <span>Already have an account?</span>
              <button
                type="button"
                className="btn btn-link p-0 text-primary ms-1"
                onClick={() => navigate("/auth/login")}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
