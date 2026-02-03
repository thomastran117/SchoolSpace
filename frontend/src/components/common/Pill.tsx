import React from "react";
import { cn } from "./cn";

export function Pill({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600",
        className
      )}
      {...props}
    />
  );
}
