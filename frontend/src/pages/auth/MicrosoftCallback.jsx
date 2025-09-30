import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { msalInstance, waitForMsal } from "../../auth/msalClient";
import config from "../../configs/envManager";
import { setCredentials } from "../../stores/authSlice";

export default function MicrosoftCallback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState("Completing Microsoft sign-in…");
  const [error, setError] = useState("");

  const retryMicrosoftOAuth = () => {
    waitForMsal().then(() =>
      msalInstance.loginRedirect({
        scopes: ["openid", "profile", "email"],
        prompt: "select_account",
      }),
    );
  };

  useEffect(() => {
    (async () => {
      try {
        await waitForMsal();
        setStatus("Processing redirect from Microsoft…");

        const result = await msalInstance.handleRedirectPromise();
        console.log("MSAL redirect result:", result);

        if (!result) {
          throw new Error("No login result found. Please try again.");
        }

        const idToken = result.idToken;
        if (!idToken) {
          throw new Error("Missing id_token from Microsoft login result.");
        }

        setStatus("Verifying your Microsoft account…");

        const resp = await fetch(`${config.backend_url}/auth/microsoft/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ id_token: idToken }),
        });

        if (resp.status === 401 || resp.status === 403) {
          throw new Error("Your Microsoft sign-in session is invalid or expired.");
        }
        if (!resp.ok) {
          throw new Error((await resp.text()) || "Unexpected error from server.");
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

        setStatus("✅ Login successful! Redirecting to dashboard…");
        setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
      } catch (err) {
        console.error("Microsoft verify failed", err);
        setError(err.message || "Sign-in failed. Please try again.");
      }
    })();
  }, [navigate, dispatch]);

  if (error) {
    return (
      <div className="d-flex min-vh-100 justify-content-center align-items-center bg-light">
        <div
          className="text-center p-4 rounded-4 shadow-lg bg-white"
          style={{ maxWidth: "420px", width: "100%" }}
        >
          <div className="mb-3 fs-1 text-danger">✖</div>
          <h4 className="fw-bold mb-2 text-dark">Microsoft Authentication Error</h4>
          <p className="text-muted mb-4">{error}</p>

          <div className="d-flex gap-3 justify-content-center">
            <button className="btn btn-primary px-4" onClick={retryMicrosoftOAuth}>
              Retry Microsoft Sign-In
            </button>
            <button
              className="btn btn-outline-secondary px-4"
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
        className="text-center p-4 rounded-4 shadow-sm bg-white"
        style={{ maxWidth: "420px", width: "100%" }}
      >
        <div
          className="spinner-border text-primary mb-3"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Loading…</span>
        </div>
        <p className="fw-semibold text-primary">{status}</p>
      </div>
    </div>
  );
}
