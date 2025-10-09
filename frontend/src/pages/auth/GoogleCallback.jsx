import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../stores/authSlice";
import SecondaryApi from "../../api/SecondaryApi";
import config from "../../configs/envManager";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState("Completing Google sign-in…");
  const [error, setError] = useState("");

  const retryGoogleOAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${config.frontend_url}/auth/google`;
    const scope = "openid email profile";

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "id_token",
      scope,
      nonce: crypto.randomUUID(),
      prompt: "select_account",
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.substring(1));
    const id_token = hash.get("id_token");

    if (!id_token) {
      setError("No sign-in token found. Please try signing in again.");
      return;
    }

    (async () => {
      try {
        setStatus("Verifying your Google account…");

        const resp = await SecondaryApi.post("/auth/google/verify", {
          token: id_token,
        });

        const { accessToken, user, role } = resp.data;

        dispatch(
          setCredentials({
            token: accessToken,
            email: user,
            role,
          }),
        );

        setStatus("✅ Login successful! Redirecting to dashboard…");
        setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
      } catch (err) {
        console.error("Google verify failed", err);

        if (err.response?.status === 401 || err.response?.status === 403) {
          setError("Your sign-in session is invalid or expired.");
        } else if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError(err.message || "Sign-in failed. Please try again.");
        }
      }
    })();
  }, [navigate, dispatch]);

  return (
    <div
      className="d-flex min-vh-100 justify-content-center align-items-center"
      style={{
        background: "linear-gradient(135deg, #fef7f7, #f7faff, #ffffff)",
      }}
    >
      <div
        className="text-center p-5 rounded-5 shadow-lg bg-white border border-light"
        style={{ maxWidth: "500px", width: "100%" }}
      >
        {error ? (
          <>
            <div className="mb-4 fs-1 text-danger">⚠️</div>
            <h3 className="fw-bold mb-3 text-dark">Google Sign-In Failed</h3>
            <p className="text-muted mb-4 fs-5">{error}</p>

            <div className="d-flex gap-3 justify-content-center">
              <button
                className="btn btn-danger btn-lg px-5"
                onClick={retryGoogleOAuth}
              >
                Retry Google Sign-In
              </button>
              <button
                className="btn btn-outline-secondary btn-lg px-5"
                onClick={() => navigate("/auth")}
              >
                Back to Sign In
              </button>
            </div>
          </>
        ) : (
          <>
            <div
              className="spinner-border text-primary mb-4"
              role="status"
              style={{ width: "4rem", height: "4rem" }}
            >
              <span className="visually-hidden">Loading…</span>
            </div>
            <p className="fw-semibold text-primary fs-5">{status}</p>
          </>
        )}
      </div>
    </div>
  );
}
