import React from "react";
import { cn } from "./cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  title?: string; // convenience if you prefer title instead of children
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold " +
  "transition select-none disabled:opacity-60 disabled:pointer-events-none " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-700",
  secondary:
    "bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:bg-slate-800",
  outline:
    "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 active:bg-slate-100",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200",
  destructive:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-700",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

function Spinner() {
  return (
    <span
      className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
      aria-hidden="true"
    />
  );
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      title,
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={isDisabled}
        {...props}
      >
        {loading ? <Spinner /> : leftIcon ? <span className="opacity-90">{leftIcon}</span> : null}
        <span>{children ?? title}</span>
        {!loading && rightIcon ? <span className="opacity-90">{rightIcon}</span> : null}
      </button>
    );
  }
);

Button.displayName = "Button";