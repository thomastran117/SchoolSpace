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

        const resp = await fetch(
          `${config.backend_url}/auth/microsoft/verify`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ id_token: idToken }),
          },
        );

        if (resp.status === 401 || resp.status === 403) {
          throw new Error(
            "Your Microsoft sign-in session is invalid or expired.",
          );
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

        setStatus("✅ Login successful! Redirecting to dashboard…");
        setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
      } catch (err) {
        console.error("Microsoft verify failed", err);
        setError(err.message || "Sign-in failed. Please try again.");
      }
    })();
  }, [navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-indigo-50 to-white px-4">
      <div className="relative w-full max-w-md p-8 rounded-2xl bg-white/90 backdrop-blur-md shadow-xl border border-white/40 text-center">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-sky-200 via-indigo-200 to-emerald-200 opacity-30 blur-3xl rounded-full" />

        {error ? (
          <>
            <div className="mb-4 text-6xl text-red-500">✖</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Microsoft Authentication Error
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                className="flex-1 py-2.5 rounded-md bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-md hover:opacity-90 transition"
                onClick={retryMicrosoftOAuth}
              >
                Retry Microsoft Sign-In
              </button>
              <button
                className="flex-1 py-2.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-semibold transition"
                onClick={() => navigate("/auth")}
              >
                Back to Sign In
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sky-700 font-medium text-lg">{status}</p>
          </>
        )}
      </div>
    </div>
  );
}
