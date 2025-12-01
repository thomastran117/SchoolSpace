import React, { useRef, useState } from "react";
import GoogleRecaptcha, {
  type CaptchaRef,
} from "../../components/auth/GoogleRecaptcha";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../stores/authSlice";
import type { AppDispatch } from "../../stores";
import { useNavigate } from "react-router-dom";

import GoogleButton from "../../components/auth/GoogleButton";
import MicrosoftButton from "../../components/auth/MicrosoftButton";
import PublicApi from "../../api/PublicApi";

import "../../styles/auth/Auth.css";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const captchaRef = useRef<CaptchaRef>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = await captchaRef.current?.execute();
      if (!token) {
        setError("Captcha validation failed. Try again.");
        setLoading(false);
        return;
      }

      const res = await PublicApi.post("/auth/login", {
        email,
        password,
        remember,
        captcha: token,
      });

      const { accessToken, username, role, avatar } = res.data;
      dispatch(setCredentials({ accessToken, username, role, avatar }));
      navigate("/dashboard");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed. Please try again.";
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
            <h1 className="fw-bold display-5">Welcome Back</h1>
            <p className="subtitle mt-3">
              Your academic hub for schedules, resources, announcements, and
              more.
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
            <div className="ribbon-bg-1"></div>
            <div className="ribbon-bg-2"></div>

            <h2 className="fw-bold mb-2">Sign in to SchoolSpace</h2>
            <p className="text-muted mb-4">
              Log in with your registered email.
            </p>

            <form onSubmit={handleLogin} className="w-100">
              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0"
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
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control border-start-0"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="input-group-text bg-white border-start-0 toggle-view"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i
                      className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                    ></i>
                  </button>
                </div>
              </div>

              <div className="login-remember-row mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberMe"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <label htmlFor="rememberMe" className="form-check-label">
                    Remember me
                  </label>
                </div>

                <button
                  type="button"
                  className="btn btn-link p-0 text-primary"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot password?
                </button>
              </div>

              <div className="error-placeholder mb-2">
                {error && (
                  <div className="auth-error-box">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {error}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-login-purple w-100 py-3 mb-2 d-flex justify-content-center align-items-center"
                disabled={loading}
              >
                {loading && (
                  <div
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    style={{ color: "white" }}
                  ></div>
                )}
                {loading ? "Signing in…" : "Login"}
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
              <span>New here?</span>
              <button
                type="button"
                className="btn btn-link p-0 text-primary ms-1"
                onClick={() => navigate("/auth/signup")}
              >
                Create an account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
