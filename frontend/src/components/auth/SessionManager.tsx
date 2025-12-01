import type { ReactNode } from "react";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setCredentials, clearCredentials } from "../../stores/authSlice";
import PublicApi from "../../api/PublicApi";
import type { AxiosError } from "axios";
import "../../styles/auth/SessionLoader.css";

interface SessionManagerProps {
  children: ReactNode;
}

interface RefreshResponse {
  accessToken: string;
  username: string;
  avatar?: string | null;
  role: string;
}

const SessionManager: React.FC<SessionManagerProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;

    const initSession = async () => {
      try {
        const res = await PublicApi.get<RefreshResponse>("/auth/refresh");
        if (cancelled) return;

        const { accessToken, username, avatar, role } = res.data;

        dispatch(setCredentials({ accessToken, username, role, avatar }));
      } catch (err) {
        if (cancelled) return;

        const error = err as AxiosError;
        console.error("Session initialization failed:", error);
        dispatch(clearCredentials());
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    initSession();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  if (loading) {
    return (
      <div className="session-loader-page">
        <div className="loader-glow glow-a"></div>
        <div className="loader-glow glow-b"></div>
        <div className="loader-glow glow-c"></div>

        <div className="session-card">
          <div className="loader-circle"></div>

          <h4 className="session-title mt-4">Initializing your session…</h4>
          <p className="session-subtext mt-2">
            Securely refreshing your account. Please wait a moment.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SessionManager;
