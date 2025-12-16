import { useState } from "react";
import { Menu, X } from "lucide-react";
import NavLink from "./NavLink";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const isAuthenticated = false;

  return (
    <header className="sticky top-0 z-50 w-full overflow-hidden">
      {/* Gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-indigo-400 to-fuchsia-400 opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-white/90" />
      <div className="absolute inset-0 border-b border-slate-200" />

      <nav className="relative mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-600 via-indigo-600 to-fuchsia-600 text-white font-bold grid place-items-center shadow-md">
              S
            </div>
            <span className="text-lg font-semibold text-slate-900">
              SchoolSpace
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
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
                <a
                  href="/register"
                  className="rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow hover:brightness-110 transition"
                >
                  Get Started
                </a>
              </>
            ) : (
              <a
                href="/dashboard"
                className="rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow hover:brightness-110 transition"
              >
                Dashboard
              </a>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-slate-800"
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

            <div className="pt-4 border-t border-slate-200 flex gap-3">
              <NavLink href="/login" subtle>
                Login
              </NavLink>
              <a
                href="/register"
                className="flex-1 text-center rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white"
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
