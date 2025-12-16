import { NavLink as RouterLink } from "react-router-dom";
import clsx from "clsx";

interface Props {
  href: string;
  children: React.ReactNode;
  subtle?: boolean;
}

export default function NavLink({ href, children, subtle }: Props) {
  return (
    <RouterLink
      to={href}
      className={({ isActive }) =>
        clsx(
          "group relative text-sm font-medium transition-colors",
          subtle
            ? "text-slate-500 hover:text-slate-800"
            : "text-slate-700 hover:text-indigo-600",
          isActive && "text-indigo-600",
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
                ? "opacity-100 bg-indigo-600"
                : "opacity-0 group-hover:opacity-100 bg-slate-300",
            )}
          />
        </>
      )}
    </RouterLink>
  );
}
