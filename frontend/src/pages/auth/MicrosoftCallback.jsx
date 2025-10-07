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

        setStatus("✅ Login successful! Redirecting to dashboard…");
        setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
      } catch (err) {
        console.error("Microsoft verify failed", err);
        setError(err.message || "Sign-in failed. Please try again.");
      }
    })();
  }, [navigate, dispatch]);

  return (
    <div
      className="d-flex min-vh-100 justify-content-center align-items-center"
      style={{
        background: "linear-gradient(135deg, #eef4ff, #f2ebff, #ffffff)",
        // light blue → soft lavender → white
      }}
    >
      <div
        className="text-center p-5 rounded-5 shadow-lg bg-white border border-light"
        style={{ maxWidth: "500px", width: "100%" }}
      >
        {error ? (
          <>
            <div className="mb-4 fs-1 text-danger">✖</div>
            <h3 className="fw-bold mb-3 text-dark">Microsoft Authentication Error</h3>
            <p className="text-muted mb-4 fs-5">{error}</p>

            <div className="d-flex gap-3 justify-content-center">
              <button
                className="btn btn-primary btn-lg px-5"
                onClick={retryMicrosoftOAuth}
              >
                Retry Microsoft Sign-In
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
