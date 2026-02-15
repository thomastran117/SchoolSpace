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
        const res = await PublicApi.post<RefreshResponse>("/auth/refresh");
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
      <div className="relative min-h-screen bg-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/70 via-white to-white" />
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 opacity-70" />
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-md">
            <div
              className="
                rounded-2xl bg-white/90 backdrop-blur
                ring-1 ring-slate-200
                shadow-[0_1px_0_rgba(15,23,42,0.05),0_18px_50px_rgba(15,23,42,0.10)]
                px-8 py-8
              "
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-11 w-11 shrink-0">
                  <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-600 animate-spin" />
                  <div className="absolute inset-[6px] rounded-full bg-indigo-50" />
                </div>

                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">
                    Initializing session
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Refreshing credentials securely…
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/60">
                  <div className="h-full w-1/3 rounded-full bg-indigo-500/70 animate-[loadingbar_1.1s_ease-in-out_infinite]" />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>Verifying session</span>
                  <span className="tabular-nums">Please wait</span>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-slate-50 ring-1 ring-slate-200/70 px-4 py-3">
                <div className="text-xs font-medium text-slate-600">
                  What’s happening
                </div>
                <ul className="mt-2 space-y-1 text-xs text-slate-500">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500/70" />
                    Checking your refresh token
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300" />
                    Loading your profile and permissions
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-4 text-center text-xs text-slate-500">
              If this takes longer than expected, try refreshing the page.
            </div>
          </div>
        </div>

        <style>{`
          @keyframes loadingbar {
            0% { transform: translateX(-60%); opacity: 0.55; }
            50% { opacity: 0.95; }
            100% { transform: translateX(260%); opacity: 0.55; }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
};

export default SessionManager;
