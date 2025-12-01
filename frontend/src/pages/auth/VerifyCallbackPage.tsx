import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PublicApi from "../../api/PublicApi";
import type { AxiosError } from "axios";

import "../../styles/auth/Callback.css";

type StatusType = "loading" | "success" | "error" | "unavailable" | "retry";

export default function VerifyCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [titleText, setTitleText] = useState("Verifying your email…");
  const [subText, setSubText] = useState("Please wait while we confirm your verification link.");
  const [statusType, setStatusType] = useState<StatusType>("loading");
  const [retry, setRetry] = useState(0);

  const verifyToken = useCallback(async () => {
    if (!token) {
      queueMicrotask(() => {
        setStatusType("error");
        setTitleText("Invalid Verification Link");
        setSubText("The verification token is missing or malformed.");
      });
      return;
    }

    queueMicrotask(() => {
      setStatusType("loading");
      setTitleText("Verifying your email…");
      setSubText("This will only take a moment.");
    });

    try {
      await PublicApi.get("/auth/verify", { params: { token } });

      queueMicrotask(() => {
        setStatusType("success");
        setTitleText("Email Verified!");
        setSubText("Redirecting you to the login page…");
      });

      setTimeout(() => navigate("/auth"), 2200);

    } catch (err) {
      const error = err as AxiosError<any>;

      queueMicrotask(() => {
        if (error.response) {
          const code = error.response.status;

          if (code === 400 || code === 401) {
            setStatusType("error");
            setTitleText("Invalid or Expired Verification Link");
            setSubText("This verification link is no longer valid.");
          } else if (code === 503) {
            setStatusType("unavailable");
            setTitleText("Verification Service Unavailable");
            setSubText("Please try again in a few minutes.");
          } else if (code >= 500) {
            setStatusType("retry");
            setTitleText("Server Error");
            setSubText("Something went wrong on our end. You may retry verification.");
          } else {
            setStatusType("error");
            setTitleText("Verification Failed");
            setSubText("Please try again or contact support.");
          }
        } else {
          setStatusType("error");
          setTitleText("Network Error");
          setSubText("Could not reach the server. Please check your connection.");
        }
      });
    }
  }, [token, navigate]);

  useEffect(() => {
    verifyToken();
  }, [verifyToken, retry]);

  return (
    <div className="callback-page">
      <div className="callback-gradient gradient-1"></div>
      <div className="callback-gradient gradient-2"></div>

      <div className="callback-card fade-in">

        {statusType === "loading" && (
          <div className="loader-wrapper mb-4">
            <div className="loader-circle"></div>
          </div>
        )}

        {statusType === "success" && (
          <div className="mb-4">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "3rem" }}></i>
          </div>
        )}

        {["error", "unavailable", "retry"].includes(statusType) && (
          <div className="callback-error-wrapper mb-4">
            <i className="bi bi-x-circle-fill text-danger error-icon"></i>
          </div>
        )}

        <h2 className="callback-status mb-2">{titleText}</h2>
        <p className="callback-subtext mb-3">{subText}</p>

        {statusType === "retry" && (
          <button
            className="btn btn-primary rounded-pill px-4 mt-2"
            onClick={() => setRetry((r) => r + 1)}
          >
            Retry Verification
          </button>
        )}

        {statusType !== "loading" && (
          <button
            className="btn btn-outline-secondary rounded-pill px-4 mt-2"
            onClick={() => navigate("/auth")}
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
}
