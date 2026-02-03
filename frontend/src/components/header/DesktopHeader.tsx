import type { ReactNode } from "react";
import { NavLink as RouterLink } from "react-router-dom";
import { LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import NavLink from "./NavLink";
import HeaderSearch from "./HeaderSearch";

type DropdownItem = {
  label: string;
  href: string;
  icon: ReactNode;
  desc?: string;
};

type DesktopNavbarProps = {
  navVariant: "campus";
  isAuthenticated: boolean;
  username: string | null;
  avatarSrc: string | null;
  resources: DropdownItem[];

  // Existing dropdown state for Resources
  resourcesOpen: boolean;
  setResourcesOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Avatar menu
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;

  resourcesRef: React.RefObject<HTMLDivElement | null>;
  avatarMenuRef: React.RefObject<HTMLDivElement | null>;

  // NEW: collapsed menu state (for md..lg)
  compactOpen: boolean;
  setCompactOpen: React.Dispatch<React.SetStateAction<boolean>>;
  compactRef: React.RefObject<HTMLDivElement | null>;

  onSearch: (q: string) => void;
  onLogout: () => void;
};

export default function DesktopHeader({
  navVariant,
  isAuthenticated,
  username,
  avatarSrc,
  resources,
  resourcesOpen,
  setResourcesOpen,
  menuOpen,
  setMenuOpen,
  resourcesRef,
  avatarMenuRef,
  compactOpen,
  setCompactOpen,
  compactRef,
  onSearch,
  onLogout,
}: DesktopNavbarProps) {
  return (
    <>
      {/* LEFT: full nav links (only on large screens) */}
      <div className="hidden lg:flex items-center gap-1 shrink-0">
        <NavLink href="/" variant={navVariant}>
          Home
        </NavLink>
        <NavLink href="/catalogue" variant={navVariant}>
          Courses
        </NavLink>
        <NavLink href="/schools" variant={navVariant}>
          Schools
        </NavLink>

        {/* Resources dropdown (large screens) */}
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
                  <RouterLink
                    key={item.href}
                    to={item.href}
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
                  </RouterLink>
                ))}
              </div>

              <div className="h-px bg-slate-100" />

              <div className="p-2">
                <RouterLink
                  to="/about"
                  onClick={() => setResourcesOpen(false)}
                  className="
                    block rounded-xl px-3 py-2 text-sm
                    text-slate-700 hover:bg-slate-50
                  "
                >
                  About SchoolSpace
                </RouterLink>
              </div>
            </div>
          )}
        </div>

        <NavLink href="/about" variant={navVariant}>
          About
        </NavLink>
      </div>

      {/* LEFT (compact): collapse links into one dropdown on md..lg */}
      <div className="hidden md:flex lg:hidden items-center shrink-0" ref={compactRef}>
        <button
          type="button"
          onClick={() => setCompactOpen((s) => !s)}
          className="
            inline-flex items-center gap-2
            rounded-xl px-3 py-2 text-sm font-medium
            text-slate-700 hover:text-slate-900 hover:bg-slate-100
            ring-1 ring-transparent hover:ring-slate-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
            transition
          "
          aria-haspopup="menu"
          aria-expanded={compactOpen}
        >
          Menu
          <ChevronDown
            size={16}
            className={[
              "text-slate-400 transition-transform",
              compactOpen ? "rotate-180" : "",
            ].join(" ")}
          />
        </button>

        {compactOpen && (
          <div
            className="
              absolute mt-2 w-72 overflow-hidden rounded-2xl
              bg-white shadow-xl ring-1 ring-slate-200
            "
            style={{ top: "100%" }}
            role="menu"
          >
            <div className="p-2">
              {/* Primary nav */}
              <div className="px-2 py-2 text-xs font-semibold text-slate-500">
                Navigation
              </div>

              <div className="space-y-1">
                <RouterLink
                  to="/"
                  onClick={() => setCompactOpen(false)}
                  className="block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Home
                </RouterLink>
                <RouterLink
                  to="/catalogue"
                  onClick={() => setCompactOpen(false)}
                  className="block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Courses
                </RouterLink>
                <RouterLink
                  to="/schools"
                  onClick={() => setCompactOpen(false)}
                  className="block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Schools
                </RouterLink>
                <RouterLink
                  to="/about"
                  onClick={() => setCompactOpen(false)}
                  className="block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  About
                </RouterLink>
              </div>

              <div className="my-2 h-px bg-slate-100" />

              {/* Resources */}
              <div className="px-2 py-2 text-xs font-semibold text-slate-500">
                Resources
              </div>

              <div className="space-y-1">
                {resources.map((item) => (
                  <RouterLink
                    key={item.href}
                    to={item.href}
                    onClick={() => setCompactOpen(false)}
                    className="flex items-start gap-3 rounded-xl px-3 py-2 hover:bg-slate-50"
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
                  </RouterLink>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CENTER: search (must shrink nicely) */}
      <div className="hidden md:flex flex-1 justify-center min-w-0">
        <HeaderSearch
          onSearch={onSearch}
          className="w-full max-w-[420px] min-w-0"
        />
      </div>

      {/* RIGHT: actions */}
      <div className="hidden md:flex items-center gap-3 shrink-0">
        {!isAuthenticated ? (
          <>
            <NavLink href="/auth/login" subtle variant={navVariant}>
              Login
            </NavLink>
            <RouterLink
              to="/register"
              className="
                inline-flex items-center justify-center
                rounded-xl px-4 py-2 text-sm font-medium
                bg-indigo-600 text-white
                hover:bg-indigo-500 shadow-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-2
                transition
              "
            >
              Get Started
            </RouterLink>
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
                <span className="text-[12px] text-slate-400">Account</span>
              </div>

              <img
                src={avatarSrc ?? "/avatar-placeholder.png"}
                alt="avatar"
                className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200 shadow-sm"
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
                  <div className="text-xs text-slate-500">Signed in as</div>
                  <div className="text-sm font-medium text-slate-900 truncate">
                    {username}
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="p-2">
                  <RouterLink
                    to="/dashboard"
                    className="
                      flex items-center gap-2 rounded-xl px-3 py-2 text-sm
                      text-slate-700 hover:bg-slate-50 transition
                    "
                    role="menuitem"
                  >
                    <LayoutDashboard size={16} className="text-slate-400" />
                    Dashboard
                  </RouterLink>

                  <button
                    type="button"
                    onClick={onLogout}
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
    </>
  );
}
