import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../stores/authSlice";
import PublicApi from "../../api/PublicApi";
import environment from "../../configuration/Environment";
import "../../styles/auth/Callback.css";

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [status, setStatus] = useState("Completing Google sign-in…");
  const [error, setError] = useState<string | null>(null);

  const retryGoogleOAuth = () => {
    const params = new URLSearchParams({
      client_id: environment.google_client,
      redirect_uri: `${environment.frontend_url}/auth/google`,
      response_type: "id_token",
      scope: "openid email profile",
      nonce: crypto.randomUUID(),
      prompt: "select_account",
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  useEffect(() => {
    let active = true;

    const processOAuth = async () => {
      const hash = new URLSearchParams(window.location.hash.substring(1));
      const id_token = hash.get("id_token");

      if (!id_token) {
        if (active) setError("No sign-in token found. Please try again.");
        return;
      }

      if (active) setStatus("Verifying your Google account…");

      try {
        const resp = await PublicApi.post("/auth/google/verify", { id_token });

        const { accessToken, username, avatar, role } = resp.data;

        if (active) {
          dispatch(setCredentials({ accessToken, username, role, avatar }));
          setStatus("Success! Redirecting you to your dashboard…");
        }

        setTimeout(() => {
          if (active) navigate("/dashboard", { replace: true });
        }, 1200);
      } catch (err: any) {
        if (!active) return;

        if (err.response?.status === 401 || err.response?.status === 403) {
          setError("Your Google sign-in session is invalid or expired.");
        } else if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError(err.message || "Sign-in failed. Please try again.");
        }
      }
    };

    processOAuth();

    return () => {
      active = false;
    };
  }, [navigate, dispatch]);

  return (
    <div className="callback-page">
      <div className="callback-gradient gradient-1" />
      <div className="callback-gradient gradient-2" />

      <div className="callback-card fade-in">
        {!error ? (
          <div className="loader-wrapper">
            <div className="loader-circle" />

            <h3 className="callback-status mt-4">{status}</h3>
            <p className="callback-subtext">
              Please wait while we complete your secure sign-in.
            </p>
          </div>
        ) : (
          <div className="callback-error-wrapper">
            <div className="error-icon mb-3">⚠️</div>

            <h3 className="callback-error-title">Google Sign-In Failed</h3>
            <p className="callback-error-text">{error}</p>

            <div className="callback-btn-row mt-4">
              <button
                className="btn btn-primary pill-btn px-4"
                onClick={retryGoogleOAuth}
              >
                Retry Google Sign-In
              </button>

              <button
                className="btn btn-outline-primary pill-btn px-4"
                onClick={() => navigate("/auth")}
              >
                Back to Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
