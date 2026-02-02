export default function Error({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}) {
  return (
    <div
      role="alert"
      className="
        flex items-start gap-3
        rounded-xl border border-red-200/70
        bg-red-50/80 backdrop-blur
        px-4 py-3
        text-sm text-red-900
      "
    >
      <div className="mt-0.5 h-2 w-2 rounded-full bg-red-500 shrink-0" />
      <div className="flex-1">
        <p className="font-semibold">Sign in failed</p>
        <p className="mt-0.5 text-red-800/90">{message}</p>
      </div>

      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="text-red-700/80 hover:text-red-900"
          aria-label="Dismiss error"
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}
