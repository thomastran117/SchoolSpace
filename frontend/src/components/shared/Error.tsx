import { AlertCircle, X } from "lucide-react";

export default function Error({
  message,
  title = "Sign in failed",
  onDismiss,
  action,
}: {
  message: string;
  title?: string;
  onDismiss?: () => void;
  action?: React.ReactNode;
}) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="
        relative flex items-start gap-3
        rounded-xl
        border-2 border-red-500
        bg-red-50
        px-4 py-3
        text-sm
        shadow-sm
        animate-in fade-in slide-in-from-top-1 duration-150

        dark:border-red-500
        dark:bg-red-950/30
      "
    >
      {/* icon */}
      <div
        className="
          mt-0.5 grid h-9 w-9 place-items-center
          rounded-lg
          bg-red-100 text-red-600
          ring-1 ring-red-200
          shrink-0

          dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30
        "
        aria-hidden="true"
      >
        <AlertCircle className="h-5 w-5" />
      </div>

      {/* content */}
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-red-900 dark:text-red-100">{title}</p>
        <p className="mt-1 leading-relaxed text-red-800 dark:text-red-200/90">
          {message}
        </p>

        {action ? (
          <div className="mt-2 flex items-center gap-2">{action}</div>
        ) : null}
      </div>

      {/* dismiss */}
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="
            -mr-1 -mt-1 inline-flex h-9 w-9 items-center justify-center
            rounded-lg
            text-red-500 hover:text-red-700
            hover:bg-red-100
            focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:ring-offset-2
            focus:ring-offset-red-50

            dark:text-red-300 dark:hover:text-red-200
            dark:hover:bg-red-500/10
            dark:focus:ring-offset-red-950
          "
          aria-label="Dismiss error"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      ) : null}
    </div>
  );
}
