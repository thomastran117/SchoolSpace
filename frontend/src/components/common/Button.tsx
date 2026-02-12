import React from "react";
import { Link, type LinkProps } from "react-router-dom";
import { cn } from "./cn";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "destructive";
type ButtonSize = "sm" | "md" | "lg";
type AnyRefEl = HTMLElement;

type CommonProps = {
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  onClick?: React.MouseEventHandler<any>;

  scrollToRef?: React.RefObject<AnyRefEl | null>;
  scrollOptions?: ScrollIntoViewOptions;
  focusRef?: React.RefObject<AnyRefEl | null>;
  focusAfterScroll?: boolean;

  className?: string;
  children?: React.ReactNode;
};

type ButtonModeProps = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type LinkModeProps = CommonProps &
  Omit<LinkProps, "to" | "className" | "children"> & {
    href: LinkProps["to"];
  };

export type ButtonProps = ButtonModeProps | LinkModeProps;

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
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200",
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
  (props, ref) => {
    const {
      className,
      children,
      title,
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      scrollToRef,
      scrollOptions,
      focusRef,
      focusAfterScroll = false,
    } = props;

    const classes = cn(base, variants[variant], sizes[size], className);
    const isDisabled =
      ("disabled" in props ? !!props.disabled : false) || loading;

    const runExtras = () => {
      const scrollTarget = scrollToRef?.current ?? null;
      const focusTarget = focusRef?.current ?? null;

      if (scrollTarget) {
        scrollTarget.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
          ...(scrollOptions ?? {}),
        });

        if (focusAfterScroll && focusTarget) {
          window.setTimeout(() => focusTarget.focus?.(), 0);
        }
        return;
      }

      if (focusTarget) focusTarget.focus?.();
    };

    if ("href" in props && props.href) {
      const {
        href,
        onClick,
        replace,
        state,
        preventScrollReset,
        relative,
        viewTransition,
      } = props;

      const handleLinkClick: React.MouseEventHandler<HTMLAnchorElement> = (
        e,
      ) => {
        if (isDisabled) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        onClick?.(e);
        if (e.defaultPrevented) return;
        runExtras();
      };

      return (
        <Link
          to={href}
          replace={replace}
          state={state}
          preventScrollReset={preventScrollReset}
          relative={relative}
          viewTransition={viewTransition}
          className={classes}
          aria-disabled={isDisabled || undefined}
          onClick={handleLinkClick}
        >
          {loading ? (
            <Spinner />
          ) : leftIcon ? (
            <span className="opacity-90">{leftIcon}</span>
          ) : null}
          <span>{children ?? title}</span>
          {!loading && rightIcon ? (
            <span className="opacity-90">{rightIcon}</span>
          ) : null}
        </Link>
      );
    }

    const {
      onClick,
      type = "button",
      disabled,
      ...rest
    } = props as ButtonModeProps;

    const handleButtonClick: React.MouseEventHandler<HTMLButtonElement> = (
      e,
    ) => {
      if (isDisabled) return;
      onClick?.(e);
      if (e.defaultPrevented) return;
      runExtras();
    };

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={isDisabled}
        onClick={handleButtonClick}
        {...rest}
      >
        {loading ? (
          <Spinner />
        ) : leftIcon ? (
          <span className="opacity-90">{leftIcon}</span>
        ) : null}
        <span>{children ?? title}</span>
        {!loading && rightIcon ? (
          <span className="opacity-90">{rightIcon}</span>
        ) : null}
      </button>
    );
  },
);

Button.displayName = "Button";
