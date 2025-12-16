import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../stores/authSlice";
import PublicApi from "../../api/PublicApi";
import environment from "../../configuration/Environment";

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
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-6">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-indigo-500 to-fuchsia-500" />
      <div className="absolute inset-0 bg-white/20" />

      {/* Decorative blobs */}
      <div className="absolute -top-48 -right-48 w-[600px] h-[600px] bg-purple-400/35 rounded-full blur-3xl" />
      <div className="absolute bottom-[-40%] left-1/2 w-[720px] h-[720px] bg-indigo-400/30 rounded-full blur-3xl" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40 p-10 text-center shadow-xl">
        {!error ? (
          <>
            {/* Loader */}
            <div className="mx-auto h-12 w-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />

            <h3 className="mt-6 text-lg font-semibold text-slate-900">
              {status}
            </h3>
            <p className="mt-2 text-sm text-slate-700">
              Please wait while we complete your secure sign-in.
            </p>
          </>
        ) : (
          <>
            <div className="text-3xl mb-4">⚠️</div>

            <h3 className="text-lg font-semibold text-slate-900">
              Google Sign-In Failed
            </h3>
            <p className="mt-2 text-sm text-slate-700">
              {error}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={retryGoogleOAuth}
                className="
                  rounded-lg
                  bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600
                  px-4 py-2.5
                  text-white text-sm font-medium
                  hover:brightness-110 transition
                  cursor-pointer
                "
              >
                Retry Google Sign-In
              </button>

              <button
                onClick={() => navigate("/auth")}
                className="
                  rounded-lg
                  border border-purple-300/60
                  bg-white/70
                  px-4 py-2.5
                  text-sm font-medium text-slate-800
                  hover:bg-purple-50 transition
                  cursor-pointer
                "
              >
                Back to Sign In
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
