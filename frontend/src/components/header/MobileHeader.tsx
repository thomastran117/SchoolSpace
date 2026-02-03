import { Menu, X, LogOut } from "lucide-react";

import NavLink from "./NavLink";
import HeaderSearch from "./HeaderSearch";

type DropdownItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  desc?: string;
};

type MobileNavbarProps = {
  navVariant: "campus";
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;

  isAuthenticated: boolean;
  username: string | null;
  avatarSrc: string | null;
  resources: DropdownItem[];

  onSearch: (q: string) => void;
  onLogout: () => void;
};

export default function MobileHeader({
  navVariant,
  open,
  setOpen,
  isAuthenticated,
  username,
  avatarSrc,
  resources,
  onSearch,
  onLogout,
}: MobileNavbarProps) {
  return (
    <>
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
              <HeaderSearch onSearch={(q) => onSearch(q)} />
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

              {/* Mobile resources section */}
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
                    onClick={onLogout}
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
    </>
  );
}
