import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../stores/authSlice";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState("Completing Google sign-in…");
  const [error, setError] = useState("");

  const retryGoogleOAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = "http://localhost:3040/auth/google";
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

        setStatus("✅ Login successful! Redirecting to dashboard…");
        setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
      } catch (err) {
        console.error("Google verify failed", err);
        setError(err.message || "Sign-in failed. Please try again.");
      }
    })();
  }, [navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-sky-50 to-white px-4">
      <div className="relative w-full max-w-md p-8 rounded-2xl bg-white/90 backdrop-blur-md shadow-xl border border-white/40 text-center">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-pink-300 via-red-300 to-orange-200 opacity-20 blur-3xl rounded-full" />

        {error ? (
          <>
            <div className="mb-4 text-6xl text-red-500">⚠️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Google Sign-In Failed
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                className="flex-1 py-2.5 rounded-md bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow-md hover:opacity-90 transition"
                onClick={retryGoogleOAuth}
              >
                Retry Google Sign-In
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
              <div className="w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-pink-700 font-medium text-lg">{status}</p>
          </>
        )}
      </div>
    </div>
  );
}
