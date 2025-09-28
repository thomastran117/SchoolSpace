import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../stores/authSlice";

export default function AuthCallback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState("Finishing sign-in…");
  const [error, setError] = useState("");

  const retryGoogleOAuth = () => {
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
        setStatus("Verifying your account…");

        const resp = await fetch(
          "http://localhost:8040/api/auth/google/verify",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ token: id_token }),
          },
        );

        if (resp.status === 401 || resp.status === 403) {
          throw new Error("Your sign-in session is invalid or expired.");
        }
        if (!resp.ok) {
          throw new Error(
            (await resp.text()) || "Unexpected error from server.",
          );
        }

        const data = await resp.json();

        dispatch(
          setCredentials({
            token: data.accessToken,
            email: data.user,
            role: data.role,
          }),
        );

        sessionStorage.setItem(
          "auth",
          JSON.stringify({ token: data.accessToken, user: data.user }),
        );

        setStatus("Login successful! Redirecting…");
        setTimeout(() => navigate("/dashboard", { replace: true }), 1200);
      } catch (err) {
        console.error("Google verify failed", err);
        setError(err.message || "Sign-in failed. Please try again.");
      }
    })();
  }, [navigate, dispatch]);

  if (error) {
    return (
      <div className="d-flex min-vh-100 justify-content-center align-items-center bg-light">
        <div
          className="text-center p-4 rounded shadow-sm bg-white"
          style={{ maxWidth: "420px" }}
        >
          <div className="mb-3 fs-2 text-danger">✖</div>
          <h5 className="fw-bold mb-2 text-dark">Authentication Error</h5>
          <p className="text-muted">{error}</p>

          <div className="d-flex gap-2 justify-content-center mt-3">
            <button className="btn btn-success" onClick={retryGoogleOAuth}>
              Retry Sign-In
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate("/auth")}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex min-vh-100 justify-content-center align-items-center bg-light">
      <div
        className="text-center p-4 rounded shadow-sm bg-white"
        style={{ maxWidth: "420px" }}
      >
        <div className="spinner-border text-success mb-3" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
        <p className="fw-semibold text-success">{status}</p>
      </div>
    </div>
  );
}
