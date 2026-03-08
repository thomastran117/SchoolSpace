import React from "react";
import { cn } from "./cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const inputId = id ?? React.useId();

    return (
      <div className="space-y-1.5">
        {label ? (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        ) : null}

        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-900 outline-none",
            "border-slate-200 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-300",
            "placeholder:text-slate-400",
            error &&
              "border-red-300 focus:ring-red-500/20 focus:border-red-300",
            className,
          )}
          {...props}
        />

        {error ? (
          <p className="text-sm text-red-700">{error}</p>
        ) : hint ? (
          <p className="text-sm text-slate-500">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
