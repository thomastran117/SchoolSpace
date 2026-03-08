import { cn } from "./cn";
import { Button } from "./Button";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm",
        className,
      )}
    >
      <div className="mx-auto mb-3 h-10 w-10 rounded-2xl bg-indigo-50 ring-1 ring-indigo-100" />
      <div className="text-base font-semibold text-slate-900">{title}</div>
      {description ? (
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      ) : null}

      {actionLabel && onAction ? (
        <div className="mt-4 flex justify-center">
          <Button variant="primary" onClick={onAction} title={actionLabel} />
        </div>
      ) : null}
    </div>
  );
}
