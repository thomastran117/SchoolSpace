import React from "react";
import { cn } from "./cn";

type BadgeVariant = "neutral" | "info" | "success" | "warning";

const styles: Record<BadgeVariant, string> = {
  neutral: "bg-slate-100 text-slate-700 border-slate-200",
  info: "bg-indigo-50 text-indigo-700 border-indigo-100",
  success: "bg-emerald-50 text-emerald-700 border-emerald-100",
  warning: "bg-amber-50 text-amber-800 border-amber-100",
};

export function Badge({
  className,
  variant = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
