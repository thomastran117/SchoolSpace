import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import config from "../../configs/envManager";

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("Verifying...");
  const [statusType, setStatusType] = useState("loading");
  const [retry, setRetry] = useState(0);

  const token = searchParams.get("token");

  const verifyToken = useCallback(async () => {
    if (!token) {
      setStatus("❌ Missing verification token.");
      setStatusType("error");
      return;
    }

    try {
      setStatus("Verifying...");
      setStatusType("loading");

      const resp = await fetch(
        `${config.backend_url}/auth/verify?token=${encodeURIComponent(token)}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!resp.ok) {
        if (resp.status === 400 || resp.status === 401) {
          setStatus("❌ Invalid or expired verification link.");
          setStatusType("error");
          return;
        } else if (resp.status === 503) {
          setStatus("⚠️ Verification service unavailable.");
          setStatusType("unavailable");
          return;
        } else if (resp.status >= 500) {
          setStatus("⚠️ Server error. Please try again.");
          setStatusType("retry");
          return;
        }

        const msg = await resp.text();
        throw new Error(msg || "Verification failed.");
      }

      setStatus("✅ Your account has been verified! Redirecting to login...");
      setStatusType("success");
      setTimeout(() => navigate("/auth"), 3000);
    } catch {
      setStatus("⚠️ Something went wrong. Please try again later.");
      setStatusType("error");
    }
  }, [token, navigate]);

  useEffect(() => {
    verifyToken();
  }, [verifyToken, retry]);

  const icons = {
    loading: (
      <div className="flex justify-center mb-3">
        <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
    success: (
      <div className="flex justify-center mb-3 text-emerald-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      </div>
    ),
    error: (
      <div className="flex justify-center mb-3 text-red-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
    ),
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-100 px-4">
      <div className="relative w-full max-w-md p-8 rounded-2xl bg-white/90 backdrop-blur-md shadow-xl border border-white/40 text-center">
        <div className="absolute -top-20 -left-16 w-60 h-60 bg-gradient-to-br from-green-300 via-emerald-300 to-teal-200 opacity-20 blur-3xl rounded-full"></div>

        {statusType === "loading"
          ? icons.loading
          : statusType === "success"
            ? icons.success
            : icons.error}

        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Email Verification
        </h2>

        <p
          className={`text-lg font-medium mb-4 ${
            statusType === "success"
              ? "text-emerald-600"
              : statusType === "loading"
                ? "text-gray-500"
                : "text-red-500"
          }`}
        >
          {status}
        </p>

        {statusType === "retry" && (
          <button
            onClick={() => setRetry((r) => r + 1)}
            className="w-full py-2.5 mt-2 rounded-md bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold shadow-md hover:opacity-90 transition"
          >
            Retry Verification
          </button>
        )}

        {statusType !== "loading" && (
          <button
            onClick={() => navigate("/auth")}
            className="w-full py-2.5 mt-3 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-semibold transition"
          >
            Back to Login
          </button>
        )}
      </div>
    </main>
  );
}
