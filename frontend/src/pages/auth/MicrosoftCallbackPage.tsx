import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { msalInstance, waitForMsal } from "../../configuration/MsalClient";
import { setCredentials } from "../../stores/authSlice";
import PublicApi from "../../api/PublicApi";

export default function MicrosoftCallbackPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [status, setStatus] = useState("Completing Microsoft sign-in…");
  const [error, setError] = useState<string | null>(null);

  const retryMicrosoftOAuth = async () => {
    await waitForMsal();
    await msalInstance.loginRedirect({
      scopes: ["openid", "profile", "email"],
      prompt: "select_account",
    });
  };

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        await waitForMsal();
        if (active) setStatus("Processing redirect from Microsoft…");

        const result = await msalInstance.handleRedirectPromise();
        if (!result)
          throw new Error("No login result found. Please try again.");

        const idToken = result.idToken;
        if (!idToken)
          throw new Error("Missing id_token from Microsoft login.");

        if (active) setStatus("Verifying your Microsoft account…");

        const resp = await PublicApi.post("/auth/microsoft/verify", {
          id_token: idToken,
        });

        const { accessToken, username, avatar, role } = resp.data;

        if (active) {
          dispatch(setCredentials({ accessToken, username, role, avatar }));
          setStatus("Success! Redirecting to your dashboard…");
        }

        setTimeout(() => {
          if (active) navigate("/dashboard", { replace: true });
        }, 1400);
      } catch (err: any) {
        console.error("Microsoft OAuth failed:", err);
        if (!active) return;

        if (err.response?.status === 401 || err.response?.status === 403) {
          setError("Your Microsoft sign-in session is invalid or expired.");
        } else if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError(err.message || "Sign-in failed. Please try again.");
        }
      }
    })();

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
            <div className="text-3xl mb-4">✖</div>

            <h3 className="text-lg font-semibold text-slate-900">
              Microsoft Sign-In Failed
            </h3>
            <p className="mt-2 text-sm text-slate-700">
              {error}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={retryMicrosoftOAuth}
                className="
                  rounded-lg
                  bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600
                  px-4 py-2.5
                  text-white text-sm font-medium
                  hover:brightness-110 transition
                  cursor-pointer
                "
              >
                Retry Microsoft Sign-In
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
