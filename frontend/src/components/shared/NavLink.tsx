import { NavLink as RouterLink } from "react-router-dom";
import clsx from "clsx";

interface Props {
  href: string;
  children: React.ReactNode;
  subtle?: boolean;
  variant?: "dark" | "light" | "campus";
}

export default function NavLink({
  href,
  children,
  subtle,
  variant = "campus",
}: Props) {
  return (
    <RouterLink
      to={href}
      className={({ isActive }) =>
        clsx(
          // base
          "relative inline-flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40",

          // ─────────────────────────────────────────────
          // CAMPUS (default)
          // ─────────────────────────────────────────────
          variant === "campus" && [
            subtle
              ? "text-slate-500 hover:text-slate-800"
              : "text-slate-700 hover:text-slate-900",

            isActive
              ? "text-indigo-700 bg-indigo-50"
              : "hover:bg-slate-100",
          ],

          // ─────────────────────────────────────────────
          // LIGHT (legacy)
          // ─────────────────────────────────────────────
          variant === "light" && [
            subtle
              ? "text-slate-500 hover:text-slate-800"
              : "text-slate-700 hover:text-indigo-600",
            isActive && "text-indigo-600",
          ],

          // ─────────────────────────────────────────────
          // DARK (legacy)
          // ─────────────────────────────────────────────
          variant === "dark" && [
            subtle
              ? "text-white/70 hover:text-white"
              : "text-white/90 hover:text-white",
            isActive && "text-white",
          ],
        )
      }
    >
      {children}

      {/* Active indicator (campus only, ultra subtle) */}
      {variant === "campus" && (
        <span
          aria-hidden
          className={clsx(
            "pointer-events-none absolute inset-x-2 -bottom-[2px] h-[2px] rounded-full transition-opacity",
            "bg-indigo-600",
            "opacity-0 group-aria-[current=page]:opacity-100",
          )}
        />
      )}
    </RouterLink>
  );
}
