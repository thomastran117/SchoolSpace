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
          "relative text-sm font-medium transition-colors",
          subtle
            ? "text-slate-600 hover:text-slate-900"
            : "text-slate-800 hover:text-purple-600",
          isActive && "text-purple-600",
        )
      }
    >
      {({ isActive }) => (
        <>
          {children}
          <span
            className={clsx(
              "absolute -bottom-2 left-0 h-[2px] w-full rounded-full transition-all",
              isActive
                ? "opacity-100 bg-gradient-to-r from-purple-500 via-indigo-500 to-fuchsia-500"
                : "opacity-0 group-hover:opacity-100 bg-slate-300",
            )}
          />
        </>
      )}
    </RouterLink>
  );
}
