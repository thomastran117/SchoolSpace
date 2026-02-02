import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../stores";
import { Menu, X, LogOut } from "lucide-react";
import NavLink from "./NavLink";
import { useProtectedAvatar } from "../../hooks/profile/ProfileAvatar";
import { logout } from "../../services/AuthService";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { accessToken, username, avatar } = useSelector(
    (state: RootState) => state.auth,
  );

  const isAuthenticated = !!accessToken;
  const avatarSrc = useProtectedAvatar(avatar);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const progress = Math.min(Math.max(y / 80, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", onScroll);
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    setOpen(false);

    await logout();
    navigate("/auth/login");
  };
  const isLight = scrollProgress > 0.6;
  const navVariant = isLight ? "light" : "dark";

  return (
    <header className="sticky top-0 z-50 w-full">
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ opacity: 1 - scrollProgress }}
      >
        <div className="h-full w-full bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600" />
      </div>

      <div
        className="absolute inset-0 backdrop-blur-xl transition-opacity duration-300"
        style={{ opacity: scrollProgress }}
      >
        <div className="h-full w-full bg-white/85 shadow-[0_1px_0_rgba(15,23,42,0.04),0_4px_16px_rgba(15,23,42,0.08)]" />
      </div>

      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{ opacity: scrollProgress * 0.6 }}
      >
        <div className="h-full w-full bg-gradient-to-r from-indigo-500/4 via-purple-500/4 to-fuchsia-500/4" />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-slate-200/70" />

      <nav className="relative mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`
                h-9 w-9 rounded-lg grid place-items-center font-bold text-white
                transition-all duration-300
                ${
                  isLight
                    ? "bg-gradient-to-br from-indigo-600 to-purple-600 shadow-sm"
                    : "bg-white/10 backdrop-blur"
                }
              `}
            >
              S
            </div>
            <span
              className={`
                text-lg font-semibold transition-colors duration-300
                ${isLight ? "text-slate-900" : "text-white"}
              `}
            >
              SchoolSpace
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <NavLink href="/" variant={navVariant}>
              Home
            </NavLink>
            <NavLink href="/catalogue" variant={navVariant}>
              Courses
            </NavLink>
            <NavLink href="/schools" variant={navVariant}>
              Schools
            </NavLink>
            <NavLink href="/about" variant={navVariant}>
              About
            </NavLink>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <NavLink href="/auth/login" subtle variant={navVariant}>
                  Login
                </NavLink>

                <a
                  href="/register"
                  className={`
                    rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300
                    ${
                      isLight
                        ? "bg-indigo-600 text-white hover:bg-indigo-500"
                        : "bg-white/10 text-white backdrop-blur hover:bg-white/20"
                    }
                  `}
                >
                  Get Started
                </a>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex h-10 items-center gap-3"
                >
                  <span
                    className={`
                      hidden sm:block max-w-[140px] truncate text-sm font-medium
                      transition-colors duration-300
                      ${isLight ? "text-slate-700" : "text-white/90"}
                    `}
                    title={username ?? undefined}
                  >
                    {username}
                  </span>

                  <img
                    src={avatarSrc ?? "/avatar-placeholder.png"}
                    alt="avatar"
                    className={`
                      h-12 w-12 rounded-full object-cover
                      ring-2 ring-offset-1 transition-all duration-300
                      ${
                        isLight
                          ? "ring-slate-300 ring-offset-white"
                          : "ring-white/30 ring-offset-transparent"
                      }
                      hover:ring-indigo-400/60
                    `}
                  />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-48 rounded-xl bg-white shadow-xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 text-sm text-slate-700">
                      Signed in as
                      <div className="font-medium truncate">{username}</div>
                    </div>
                    <div className="border-t">
                      <a
                        href="/dashboard"
                        className="block px-4 py-2 text-sm hover:bg-slate-100"
                      >
                        Dashboard
                      </a>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            className={`md:hidden transition-colors ${isLight ? "text-slate-900" : "text-white"}`}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden mt-4 space-y-4 pb-6">
            <NavLink href="/" variant={navVariant}>
              Home
            </NavLink>
            <NavLink href="/catalogue" variant={navVariant}>
              Courses
            </NavLink>
            <NavLink href="/schools" variant={navVariant}>
              Schools
            </NavLink>
            <NavLink href="/about" variant={navVariant}>
              About
            </NavLink>

            {!isAuthenticated ? (
              <div className="pt-4 border-t flex gap-3">
                <NavLink href="/login" subtle variant={navVariant}>
                  Login
                </NavLink>
                <a
                  href="/register"
                  className="flex-1 text-center rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500 transition"
                >
                  Get Started
                </a>
              </div>
            ) : (
              <NavLink href="/dashboard" variant={navVariant}>
                Dashboard
              </NavLink>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
