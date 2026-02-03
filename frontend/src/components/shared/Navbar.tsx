import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../stores";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Search,
  BookOpen,
  LifeBuoy,
  FileText,
} from "lucide-react";
import NavLink from "./NavLink";
import { useProtectedAvatar } from "../../hooks/profile/ProfileAvatar";
import { logout } from "../../services/AuthService";
import NavbarSearch from "./NavbarSearch";

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
    // Later: call backend API here (or dispatch a thunk).
    // For now, navigate to wherever you want.
    navigate(`/catalogue?search=${encodeURIComponent(query)}`);

    // If mobile menu is open, close it after searching
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

      {/* surface */}
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

            {/* Desktop: links + dropdown */}
            <div className="hidden md:flex items-center gap-1">
              <NavLink href="/" variant={navVariant}>
                Home
              </NavLink>

              <NavLink href="/catalogue" variant={navVariant}>
                Courses
              </NavLink>

              <NavLink href="/schools" variant={navVariant}>
                Schools
              </NavLink>

              {/* Dropdown */}
              <div className="relative" ref={resourcesRef}>
                <button
                  type="button"
                  onClick={() => setResourcesOpen((s) => !s)}
                  className="
                    inline-flex items-center gap-1.5
                    rounded-xl px-3 py-2 text-sm font-medium
                    text-slate-700 hover:text-slate-900 hover:bg-slate-100
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
                    transition
                  "
                  aria-haspopup="menu"
                  aria-expanded={resourcesOpen}
                >
                  Resources
                  <ChevronDown
                    size={16}
                    className={[
                      "text-slate-400 transition-transform",
                      resourcesOpen ? "rotate-180" : "",
                    ].join(" ")}
                  />
                </button>

                {resourcesOpen && (
                  <div
                    className="
                      absolute left-0 mt-2 w-[320px] overflow-hidden rounded-2xl
                      bg-white shadow-xl ring-1 ring-slate-200
                    "
                    role="menu"
                  >
                    <div className="px-4 py-3">
                      <div className="text-xs font-medium text-slate-500">
                        Quick links
                      </div>
                      <div className="text-[13px] text-slate-400">
                        Common resources and support
                      </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    <div className="p-2">
                      {resources.map((item) => (
                        <a
                          key={item.href}
                          href={item.href}
                          onClick={() => setResourcesOpen(false)}
                          className="
                            flex gap-3 rounded-xl px-3 py-2
                            hover:bg-slate-50 transition
                          "
                          role="menuitem"
                        >
                          <div className="mt-0.5">{item.icon}</div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-slate-900">
                              {item.label}
                            </div>
                            {item.desc ? (
                              <div className="text-xs text-slate-500 truncate">
                                {item.desc}
                              </div>
                            ) : null}
                          </div>
                        </a>
                      ))}
                    </div>

                    <div className="h-px bg-slate-100" />

                    <div className="p-2">
                      <a
                        href="/about"
                        onClick={() => setResourcesOpen(false)}
                        className="
                          block rounded-xl px-3 py-2 text-sm
                          text-slate-700 hover:bg-slate-50
                        "
                      >
                        About SchoolSpace
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <NavLink href="/about" variant={navVariant}>
                About
              </NavLink>
            </div>

            {/* Desktop: search */}
            <div className="hidden md:flex flex-1 justify-center">
              <NavbarSearch
                onSearch={handleSearch}
                className="w-full max-w-[420px]"
              />
            </div>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              {!isAuthenticated ? (
                <>
                  <NavLink href="/auth/login" subtle variant={navVariant}>
                    Login
                  </NavLink>

                  <a
                    href="/register"
                    className="
                      inline-flex items-center justify-center
                      rounded-xl px-4 py-2 text-sm font-medium
                      bg-indigo-600 text-white
                      hover:bg-indigo-500
                      shadow-sm
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-2
                      transition
                    "
                  >
                    Get Started
                  </a>
                </>
              ) : (
                <div className="relative" ref={avatarMenuRef}>
                  <button
                    type="button"
                    onClick={() => setMenuOpen((s) => !s)}
                    className="
                      flex items-center gap-3 rounded-xl px-2 py-1.5
                      hover:bg-slate-50
                      ring-1 ring-transparent hover:ring-slate-200
                      transition
                    "
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                  >
                    <div className="hidden sm:flex flex-col items-end leading-tight">
                      <span
                        className="max-w-[160px] truncate text-sm font-medium text-slate-700"
                        title={username ?? undefined}
                      >
                        {username}
                      </span>
                      <span className="text-[12px] text-slate-400">
                        Account
                      </span>
                    </div>

                    <img
                      src={avatarSrc ?? "/avatar-placeholder.png"}
                      alt="avatar"
                      className="
                        h-9 w-9 rounded-full object-cover
                        ring-1 ring-slate-200 shadow-sm
                      "
                    />
                  </button>

                  {menuOpen && (
                    <div
                      className="
                        absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl
                        bg-white shadow-xl ring-1 ring-slate-200
                      "
                      role="menu"
                    >
                      <div className="px-4 py-3">
                        <div className="text-xs text-slate-500">
                          Signed in as
                        </div>
                        <div className="text-sm font-medium text-slate-900 truncate">
                          {username}
                        </div>
                      </div>

                      <div className="h-px bg-slate-100" />

                      <div className="p-2">
                        <a
                          href="/dashboard"
                          className="
                            flex items-center gap-2 rounded-xl px-3 py-2 text-sm
                            text-slate-700 hover:bg-slate-50 transition
                          "
                          role="menuitem"
                        >
                          <LayoutDashboard
                            size={16}
                            className="text-slate-400"
                          />
                          Dashboard
                        </a>

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="
                            mt-1 w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm
                            text-red-600 hover:bg-red-50 transition
                          "
                          role="menuitem"
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

            {/* Mobile toggle */}
            <button
              type="button"
              className="
                md:hidden inline-flex items-center justify-center
                h-10 w-10 rounded-xl
                hover:bg-slate-50 ring-1 ring-slate-200
                transition
              "
              onClick={() => setOpen((s) => !s)}
              aria-label="Open menu"
            >
              {open ? (
                <X size={20} className="text-slate-700" />
              ) : (
                <Menu size={20} className="text-slate-700" />
              )}
            </button>
          </div>

          {/* Mobile panel */}
          {open && (
            <div className="md:hidden pb-6">
              <div
                className="
                  mt-3 rounded-2xl bg-white
                  shadow-[0_12px_30px_rgba(15,23,42,0.10)]
                  ring-1 ring-slate-200 overflow-hidden
                "
              >
                {/* Mobile search */}
                <div className="p-3">
                  <NavbarSearch onSearch={handleSearch} />
                </div>

                <div className="h-px bg-slate-100" />

                {/* Mobile links */}
                <div className="p-2">
                  <NavLink href="/" variant={navVariant}>
                    Home
                  </NavLink>
                  <NavLink href="/catalogue" variant={navVariant}>
                    Courses
                  </NavLink>
                  <NavLink href="/schools" variant={navVariant}>
                    Schools
                  </NavLink>

                  {/* Mobile "dropdown" as a section */}
                  <div className="mt-2">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-500">
                      Resources
                    </div>
                    {resources.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="
                          flex items-start gap-3 rounded-xl px-3 py-2
                          hover:bg-slate-50 transition
                        "
                      >
                        <div className="mt-0.5">{item.icon}</div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-800">
                            {item.label}
                          </div>
                          {item.desc ? (
                            <div className="text-xs text-slate-500 truncate">
                              {item.desc}
                            </div>
                          ) : null}
                        </div>
                      </a>
                    ))}
                  </div>

                  <NavLink href="/about" variant={navVariant}>
                    About
                  </NavLink>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Mobile auth */}
                <div className="p-3">
                  {!isAuthenticated ? (
                    <div className="flex gap-3">
                      <a
                        href="/auth/login"
                        className="
                          flex-1 text-center rounded-xl px-4 py-2 text-sm font-medium
                          text-slate-700 hover:bg-slate-50 ring-1 ring-slate-200
                          transition
                        "
                      >
                        Login
                      </a>
                      <a
                        href="/register"
                        className="
                          flex-1 text-center rounded-xl px-4 py-2 text-sm font-medium
                          bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm
                          transition
                        "
                      >
                        Get Started
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <img
                        src={avatarSrc ?? "/avatar-placeholder.png"}
                        alt="avatar"
                        className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-slate-900 truncate">
                          {username}
                        </div>
                        <a
                          href="/dashboard"
                          className="text-sm text-indigo-600 hover:text-indigo-500"
                          onClick={() => setOpen(false)}
                        >
                          Go to dashboard
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="
                          inline-flex items-center gap-2 rounded-xl
                          px-3 py-2 text-sm text-red-600 hover:bg-red-50
                          transition
                        "
                      >
                        <LogOut size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* bottom hairline */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-slate-200/70" />
      </div>
    </header>
  );
}
