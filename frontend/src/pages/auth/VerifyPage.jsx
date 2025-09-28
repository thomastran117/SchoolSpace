import "../../styles/verify.css";
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

  return (
    <main className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="p-5 rounded shadow text-center verify-card">
        {statusType === "loading" && (
          <div className="mb-3">
            <i className="bi bi-arrow-repeat text-secondary fs-1 spin"></i>
          </div>
        )}
        {statusType === "success" && (
          <div className="mb-3">
            <i className="bi bi-check-circle-fill text-success fs-1"></i>
          </div>
        )}
        {(statusType === "error" ||
          statusType === "unavailable" ||
          statusType === "retry") && (
          <div className="mb-3">
            <i className="bi bi-x-circle-fill text-danger fs-1"></i>
          </div>
        )}

        <h2 className="mb-3">Email Verification</h2>
        <p
          className={`lead ${
            statusType === "success"
              ? "text-success"
              : statusType === "loading"
                ? "text-secondary"
                : "text-danger"
          }`}
        >
          {status}
        </p>

        {statusType === "retry" && (
          <button
            className="btn btn-primary mt-3 me-2"
            onClick={() => setRetry((r) => r + 1)}
          >
            Retry Verification
          </button>
        )}

        {statusType !== "loading" && (
          <button
            className="btn btn-outline-secondary mt-3"
            onClick={() => navigate("/auth")}
          >
            Back to Login
          </button>
        )}
      </div>
    </main>
  );
}
