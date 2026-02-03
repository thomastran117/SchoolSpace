import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

type Props = {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  autoFocus?: boolean;

  /** Called on submit (Enter or icon click) */
  onSearch: (query: string) => void;

  /** called whenever the text changes */
  onChangeQuery?: (query: string) => void;

  /** show a clear button */
  allowClear?: boolean;

  /** disable input */
  disabled?: boolean;

  /** additional container classes */
  className?: string;
};

export default function NavbarSearch({
  value,
  defaultValue = "",
  placeholder = "Search courses, schools…",
  autoFocus,
  onSearch,
  onChangeQuery,
  allowClear = true,
  disabled,
  className,
}: Props) {
  const isControlled = value !== undefined;
  const [inner, setInner] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const q = isControlled ? value : inner;

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const setQ = (next: string) => {
    if (!isControlled) setInner(next);
    onChangeQuery?.(next);
  };

  const submit = () => {
    const query = (q ?? "").trim();
    if (!query) return;
    onSearch(query);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className={className}
      role="search"
      aria-label="Site search"
    >
      <div
        className="
          relative w-full
          rounded-2xl bg-white/80
          ring-1 ring-slate-200 shadow-sm
          focus-within:ring-2 focus-within:ring-indigo-500/30
          transition
        "
      >
        <button
          type="button"
          onClick={submit}
          disabled={disabled}
          className="
            absolute left-3 top-1/2 -translate-y-1/2
            text-slate-400 hover:text-slate-600
            disabled:opacity-50 disabled:hover:text-slate-400
          "
          aria-label="Search"
        >
          <Search size={16} />
        </button>

        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="
            w-full bg-transparent
            pl-9 pr-10 py-2 text-sm
            text-slate-700 placeholder:text-slate-400
            outline-none
            disabled:opacity-60
          "
        />

        {allowClear && !!q && !disabled ? (
          <button
            type="button"
            onClick={() => setQ("")}
            className="
              absolute right-2.5 top-1/2 -translate-y-1/2
              inline-flex h-7 w-7 items-center justify-center
              rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50
              transition
            "
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>
    </form>
  );
}
