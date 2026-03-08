import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "./cn";

export type DropdownOption = {
  label: string;
  value: string;
};

type DropdownProps = {
  label?: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function Dropdown({
  label,
  value,
  options,
  onChange,
  placeholder = "Select...",
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selected = options.find((o) => o.value === value);

  // Close when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      {label && (
        <div className="mb-1.5 text-sm font-medium text-slate-700">{label}</div>
      )}

      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-2xl border bg-white px-4 text-sm transition",
          "border-slate-200 text-slate-900",
          "shadow-sm",
          "hover:border-slate-300",
          "focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-300",
        )}
      >
        <span className={cn(!selected && "text-slate-400")}>
          {selected?.label ?? placeholder}
        </span>

        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-500 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Menu */}
      <div
        className={cn(
          "absolute z-50 mt-2 w-full origin-top rounded-2xl border bg-white shadow-lg transition-all",
          "border-slate-200",
          open
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0",
        )}
      >
        <div className="max-h-64 overflow-auto py-2">
          {options.map((opt) => {
            const isActive = opt.value === value;

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-2.5 text-sm transition",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-700 hover:bg-slate-50",
                )}
              >
                <span>{opt.label}</span>

                {isActive && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
