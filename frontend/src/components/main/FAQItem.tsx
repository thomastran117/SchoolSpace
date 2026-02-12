import Divider from "@common/Divider";
import { useState } from "react";
import { Muted } from "@common/Text";

export default function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="text-sm font-semibold text-slate-900">{q}</div>
        <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
          <svg
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d={open ? "M5 10h10" : "M10 5v10M5 10h10"}
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>

      {open ? (
        <div className="px-5 pb-5">
          <Divider />
          <Muted className="mt-3">{a}</Muted>
        </div>
      ) : null}
    </div>
  );
}
