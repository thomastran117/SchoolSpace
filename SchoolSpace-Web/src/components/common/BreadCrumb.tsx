import React from "react";
import { cn } from "./cn";

export type BreadcrumbItem = {
  label: React.ReactNode;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  icon?: React.ReactNode;
  current?: boolean;
};

function isAnchorItem(item: BreadcrumbItem) {
  return Boolean(item.href);
}

export function Breadcrumb({
  items,
  separator,
  maxItems = 5,
  className,
  "aria-label": ariaLabel = "Breadcrumb",
}: {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
  className?: string;
  "aria-label"?: string;
}) {
  const safeItems = items ?? [];
  const lastIndex = safeItems.length - 1;

  // Ensure exactly one "current" (prefer explicit, otherwise last item)
  const hasExplicitCurrent = safeItems.some((i) => i.current);
  const normalized = safeItems.map((it, idx) => ({
    ...it,
    current: hasExplicitCurrent ? Boolean(it.current) : idx === lastIndex,
  }));

  // Collapse logic: show first, ellipsis, last (maxItems<=3 => no ellipsis)
  const shouldCollapse = normalized.length > maxItems && maxItems >= 4;
  const visible = shouldCollapse
    ? [
        normalized[0],
        { label: "…", current: false } as BreadcrumbItem,
        ...normalized.slice(-(maxItems - 2)),
      ]
    : normalized;

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "w-full",
        "rounded-2xl border border-slate-200 bg-white/70 backdrop-blur",
        "shadow-sm",
        className,
      )}
    >
      <ol className="flex flex-wrap items-center gap-1.5 px-4 py-3 text-sm">
        {visible.map((item, idx) => {
          const isEllipsis = item.label === "…";
          const isLast = idx === visible.length - 1;
          const sep = separator ?? <DefaultSeparator />;

          return (
            <li
              key={`${idx}-${String(item.label)}`}
              className="flex items-center"
            >
              <Crumb item={item} />

              {!isLast ? (
                <span
                  aria-hidden="true"
                  className="mx-1.5 inline-flex items-center text-slate-300"
                >
                  {sep}
                </span>
              ) : null}

              {/* If ellipsis is used, make it non-interactive and screen-reader friendly */}
              {isEllipsis ? <span className="sr-only">Collapsed</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Crumb({ item }: { item: BreadcrumbItem }) {
  const content = (
    <span className="inline-flex items-center gap-2">
      {item.icon ? <span className="text-slate-400">{item.icon}</span> : null}
      <span className="truncate">{item.label}</span>
    </span>
  );

  // Ellipsis / non-interactive
  if (!item.href && !item.onClick) {
    return (
      <span
        className={cn(
          "max-w-[220px] select-none",
          item.current
            ? "rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-900"
            : "text-slate-500",
        )}
        aria-current={item.current ? "page" : undefined}
      >
        {content}
      </span>
    );
  }

  // Current page (still render as non-link for best a11y)
  if (item.current) {
    return (
      <span
        className="max-w-[220px] rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-900"
        aria-current="page"
      >
        {content}
      </span>
    );
  }

  // Link vs Button
  if (isAnchorItem(item)) {
    return (
      <a
        href={item.href}
        onClick={item.onClick}
        className={cn(
          "max-w-[220px] rounded-full px-2.5 py-1",
          "text-slate-600 hover:text-slate-900",
          "hover:bg-slate-50",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2",
          "transition",
        )}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={item.onClick}
      className={cn(
        "max-w-[220px] rounded-full px-2.5 py-1 text-left",
        "text-slate-600 hover:text-slate-900",
        "hover:bg-slate-50",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2",
        "transition",
      )}
    >
      {content}
    </button>
  );
}

function DefaultSeparator() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 20 20"
      fill="none"
      className="opacity-90"
    >
      <path
        d="M7.5 4.5L12.5 10L7.5 15.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
