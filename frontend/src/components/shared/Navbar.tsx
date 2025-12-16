import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../stores";
import { Menu, X, LogOut } from "lucide-react";
import NavLink from "./NavLink";
import ProtectedApi from "../../api/ProtectedApi";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { accessToken, username, avatar } = useSelector(
    (state: RootState) => state.auth,
  );

  const isAuthenticated = !!accessToken;

  /* Restore session */
  useEffect(() => {
    ProtectedApi.get("/auth/refresh").catch(() => {});
  }, []);

  /* Scroll detection */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Base background */}
      <div
        className={`
          absolute inset-0 transition-all duration-500
          ${
            scrolled
              ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_0_rgba(15,23,42,0.06),0_6px_24px_rgba(15,23,42,0.12)]"
              : "bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600"
          }
        `}
      />

      {/* Brand tint (only when scrolled) */}
      <div
        className={`
          absolute inset-0 pointer-events-none transition-opacity duration-500
          ${scrolled ? "opacity-100" : "opacity-0"}
          bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-fuchsia-500/5
        `}
      />

      {/* Bottom divider */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-slate-200/70" />

      <nav className="relative mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className={`
                h-9 w-9 rounded-lg grid place-items-center font-bold text-white transition
                ${
                  scrolled
                    ? "bg-gradient-to-br from-purple-600 via-indigo-600 to-fuchsia-600 shadow"
                    : "bg-white/15 backdrop-blur"
                }
              `}
            >
              S
            </div>
            <span
              className={`text-lg font-semibold transition-colors ${
                scrolled ? "text-slate-900" : "text-white"
              }`}
            >
              SchoolSpace
            </span>
          </div>

          {/* Desktop Links */}
          <div
            className={`hidden md:flex items-center gap-8 transition-colors ${
              scrolled ? "text-slate-700" : "text-white/90"
            }`}
          >
            <NavLink href="/">Home</NavLink>
            <NavLink href="/catalogue">Courses</NavLink>
            <NavLink href="/schools">Schools</NavLink>
            <NavLink href="/about">About</NavLink>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <NavLink href="/login" subtle>
                  Login
                </NavLink>

                {/* CTA – adaptive */}
                <a
                  href="/register"
                  className={`
                    rounded-lg px-4 py-2 text-sm font-medium transition-all
                    ${
                      scrolled
                        ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 text-white shadow hover:brightness-110"
                        : "bg-white/15 text-white backdrop-blur hover:bg-white/25"
                    }
                  `}
                >
                  Get Started
                </a>
              </>
            ) : (
              <div className="relative">
                {/* Avatar */}
                <button onClick={() => setMenuOpen(!menuOpen)}>
                  <img
                    src={avatar ?? "/avatar-placeholder.png"}
                    alt="avatar"
                    className={`
                      h-9 w-9 rounded-full object-cover transition
                      ${
                        scrolled
                          ? "border border-slate-300"
                          : "border border-white/30"
                      }
                    `}
                  />
                </button>

                {/* Dropdown */}
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
                      <a
                        href="/logout"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} />
                        Logout
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className={`md:hidden ${
              scrolled ? "text-slate-900" : "text-white"
            }`}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden mt-4 space-y-4 pb-6">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/catalogue">Courses</NavLink>
            <NavLink href="/schools">Schools</NavLink>
            <NavLink href="/about">About</NavLink>

            {!isAuthenticated ? (
              <div className="pt-4 border-t flex gap-3">
                <NavLink href="/login" subtle>
                  Login
                </NavLink>
                <a
                  href="/register"
                  className="flex-1 text-center rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 px-4 py-2 text-sm text-white"
                >
                  Get Started
                </a>
              </div>
            ) : (
              <NavLink href="/dashboard">Dashboard</NavLink>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
