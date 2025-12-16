import { NavLink as RouterLink } from "react-router-dom";
import clsx from "clsx";

interface Props {
  href: string;
  children: React.ReactNode;
  subtle?: boolean;
  variant?: "dark" | "light";
}

export default function NavLink({
  href,
  children,
  subtle,
  variant = "light",
}: Props) {
  const isDark = variant === "dark";

  return (
    <RouterLink
      to={href}
      className={({ isActive }) =>
        clsx(
          "group relative text-sm font-medium transition-colors",
          subtle
            ? isDark
              ? "text-white/70 hover:text-white"
              : "text-slate-500 hover:text-slate-800"
            : isDark
              ? "text-white/90 hover:text-white"
              : "text-slate-700 hover:text-indigo-600",

          // Active state
          isActive && (isDark ? "text-white" : "text-indigo-600"),
        )
      }
    >
      {({ isActive }) => (
        <>
          {children}

          {/* Underline */}
          <span
            className={clsx(
              "pointer-events-none absolute -bottom-2 left-0 h-[2px] w-full rounded-full transition-all duration-300",
              isActive
                ? isDark
                  ? "opacity-100 bg-white"
                  : "opacity-100 bg-indigo-600"
                : isDark
                  ? "opacity-0 group-hover:opacity-100 bg-white/50"
                  : "opacity-0 group-hover:opacity-100 bg-slate-300",
            )}
          />
        </>
      )}
    </RouterLink>
  );
}
