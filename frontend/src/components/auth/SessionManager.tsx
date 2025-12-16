import type { ReactNode } from "react";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setCredentials, clearCredentials } from "../../stores/authSlice";
import PublicApi from "../../api/PublicApi";
import type { AxiosError } from "axios";

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
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
        {/* Ambient gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-indigo-600/10 to-fuchsia-600/10" />

        {/* Hot spots */}
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] bg-purple-500/35 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/4 -right-48 w-[520px] h-[520px] bg-indigo-500/35 rounded-full blur-[120px] animate-pulse delay-200" />
        <div className="absolute -bottom-48 left-1/4 w-[520px] h-[520px] bg-fuchsia-500/35 rounded-full blur-[120px] animate-pulse delay-500" />
        <div className="absolute bottom-1/3 right-1/4 w-[420px] h-[420px] bg-sky-500/25 rounded-full blur-[120px] animate-pulse delay-700" />

        {/* Session Card */}
        <div
          className="relative z-10 w-full max-w-sm rounded-2xl
                      bg-white/80 backdrop-blur-xl
                      shadow-[0_30px_80px_rgba(15,23,42,0.15)]
                      border border-slate-200
                      px-8 py-10 text-center"
        >
          {/* Loader */}
          <div className="relative mx-auto mb-6 h-14 w-14">
            <div className="absolute inset-0 rounded-full border-[3px] border-slate-200" />
            <div
              className="absolute inset-0 rounded-full border-[3px]
                          border-t-purple-600 border-r-indigo-600
                          border-b-fuchsia-600 border-l-transparent
                          animate-spin"
            />
          </div>

          <h4 className="text-lg font-semibold text-slate-900">
            Initializing your session…
          </h4>

          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Securely refreshing your account.
            <br />
            Please wait a moment.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SessionManager;
