import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { msalInstance, waitForMsal } from "../../configuration/MsalClient";
import { setCredentials } from "../../stores/authSlice";
import PublicApi from "../../api/PublicApi";
import "../../styles/auth/Callback.css";

export default function MicrosoftCallbackPage() {
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
        if (!result)
          throw new Error("No login result found. Please try again.");

        const idToken = result.idToken;
        if (!idToken) throw new Error("Missing id_token from Microsoft login.");

        setStatus("Verifying your Microsoft account…");

        const resp = await PublicApi.post("/auth/microsoft/verify", {
          id_token: idToken,
        });

        const { accessToken, username, avatar, role } = resp.data;

        dispatch(setCredentials({ accessToken, username, role, avatar }));

        setStatus("Success! Redirecting to your dashboard…");

        setTimeout(() => navigate("/dashboard", { replace: true }), 1400);
      } catch (err: any) {
        console.error("Microsoft OAuth failed:", err);

        if (err.response?.status === 401 || err.response?.status === 403) {
          setError("Your Microsoft sign-in session is invalid or expired.");
        } else if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError(err.message || "Sign-in failed. Please try again.");
        }
      }
    })();
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
            <div className="error-icon mb-3">✖</div>

            <h3 className="callback-error-title">Microsoft Sign-In Failed</h3>
            <p className="callback-error-text">{error}</p>

            <div className="callback-btn-row mt-4">
              <button
                className="btn btn-primary pill-btn px-4"
                onClick={retryMicrosoftOAuth}
              >
                Retry Microsoft Sign-In
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
