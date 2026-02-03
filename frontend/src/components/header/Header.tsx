import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../stores";
import { BookOpen, LifeBuoy, FileText } from "lucide-react";

import { useProtectedAvatar } from "../../hooks/profile/ProfileAvatar";
import { logout } from "../../services/AuthService";
import DesktopNavbar from "./DesktopHeader";
import MobileHeader from "./MobileHeader";

type DropdownItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  desc?: string;
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [elevated, setElevated] = useState(false);
  const [compactOpen, setCompactOpen] = useState(false);
  const compactRef = useRef<HTMLDivElement | null>(null);
  
  const navigate = useNavigate();
  const { accessToken, username, avatar } = useSelector(
    (state: RootState) => state.auth,
  );
  const isAuthenticated = !!accessToken;
  const avatarSrc = useProtectedAvatar(avatar);

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setMenuOpen(false);
        setResourcesOpen(false);
        setCompactOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const avatarMenuRef = useRef<HTMLDivElement | null>(null);
  const resourcesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;

      if (avatarMenuRef.current && !avatarMenuRef.current.contains(t)) {
        setMenuOpen(false);
      }
      if (resourcesRef.current && !resourcesRef.current.contains(t)) {
        setResourcesOpen(false);
      }
      if (compactRef.current && !compactRef.current.contains(t)) setCompactOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    setOpen(false);
    await logout();
    navigate("/auth/login");
  };

  const handleSearch = (query: string) => {
    navigate(`/catalogue?search=${encodeURIComponent(query)}`);
    setOpen(false);
  };

  const resources: DropdownItem[] = useMemo(
    () => [
      {
        label: "Student Handbook",
        href: "/resources/handbook",
        icon: <BookOpen size={16} className="text-slate-400" />,
        desc: "Policies, expectations, and FAQs",
      },
      {
        label: "Support",
        href: "/support",
        icon: <LifeBuoy size={16} className="text-slate-400" />,
        desc: "Contact admins or report issues",
      },
      {
        label: "Documentation",
        href: "/docs",
        icon: <FileText size={16} className="text-slate-400" />,
        desc: "Guides for teachers and staff",
      },
    ],
    [],
  );

  const brandBadge = useMemo(() => {
    return (
      <div
        className="
          h-9 w-9 rounded-xl grid place-items-center
          bg-white shadow-sm ring-1 ring-slate-200
        "
        aria-hidden="true"
      >
        <span className="font-semibold text-indigo-700">S</span>
      </div>
    );
  }, []);

  const navVariant = "campus" as const;

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="h-[2px] w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400" />

      <div
        className={[
          "relative",
          "bg-white/70 backdrop-blur-xl",
          "transition-shadow",
          elevated
            ? "shadow-[0_1px_0_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.08)]"
            : "shadow-[0_1px_0_rgba(15,23,42,0.04)]",
        ].join(" ")}
      >
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="h-full w-full bg-gradient-to-r from-indigo-500/[0.04] via-transparent to-indigo-500/[0.03]" />
        </div>

        <nav className="relative mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Brand */}
            <a href="/" className="flex items-center gap-3 shrink-0">
              {brandBadge}
              <div className="leading-tight hidden sm:block">
                <div className="text-[15px] font-semibold text-slate-900">
                  SchoolSpace
                </div>
                <div className="text-[12px] text-slate-500 -mt-0.5">
                  Campus Portal
                </div>
              </div>
            </a>

            <DesktopNavbar
              navVariant={navVariant}
              isAuthenticated={isAuthenticated}
              username={username ?? null}
              avatarSrc={avatarSrc ?? null}
              resources={resources}
              resourcesOpen={resourcesOpen}
              setResourcesOpen={setResourcesOpen}
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
              compactOpen={compactOpen}
              setCompactOpen={setCompactOpen}
              compactRef={compactRef}
              resourcesRef={resourcesRef}
              avatarMenuRef={avatarMenuRef}
              onSearch={handleSearch}
              onLogout={handleLogout}
            />

            <MobileHeader
              navVariant={navVariant}
              open={open}
              setOpen={setOpen}
              isAuthenticated={isAuthenticated}
              username={username ?? null}
              avatarSrc={avatarSrc ?? null}
              resources={resources}
              onSearch={handleSearch}
              onLogout={handleLogout}
            />
          </div>

          {/* Optional: if you want the mobile panel to appear below the bar, keep it here instead of inside MobileNavbar */}
          {/* Currently MobileNavbar renders its panel directly below the toggle */}
        </nav>

        <div className="absolute inset-x-0 bottom-0 h-px bg-slate-200/70" />
      </div>
    </header>
  );
}
