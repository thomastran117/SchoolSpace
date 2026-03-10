"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./Searchbar.module.css";

// ── Types ────────────────────────────────────────────────
interface ResultItem {
  id: string;
  title: string;
  meta: string;
  icon: React.ReactNode;
  href?: string;
}

interface ResultGroup {
  label: string;
  items: ResultItem[];
}

interface SearchBarProps {
  placeholder?: string;
  /** Pass your own grouped results; if omitted, demo data is shown */
  results?: ResultGroup[];
  onSearch?: (query: string) => void;
  onSelect?: (item: ResultItem) => void;
  className?: string;
}

// ── Demo data ────────────────────────────────────────────
const DEMO_RESULTS: ResultGroup[] = [
  {
    label: "Courses",
    items: [
      { id: "1", title: "React for Beginners", meta: "48 lessons · Beginner", icon: <BookIcon /> },
      { id: "2", title: "Advanced TypeScript", meta: "32 lessons · Advanced", icon: <BookIcon /> },
      { id: "3", title: "UI Design Principles", meta: "24 lessons · Intermediate", icon: <BookIcon /> },
    ],
  },
  {
    label: "Learning Paths",
    items: [
      { id: "4", title: "Frontend Developer Path", meta: "6 courses · 120h", icon: <PathIcon /> },
      { id: "5", title: "Full-Stack Engineer", meta: "9 courses · 200h", icon: <PathIcon /> },
    ],
  },
];

// ── Icons ────────────────────────────────────────────────
function BookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9Z" />
      <path d="M6 2v12M6 7h5" />
    </svg>
  );
}

function PathIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="4" cy="4" r="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 4h2a4 4 0 0 1 4 4v2" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5L14 14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M2 2l6 6M8 2l-6 6" />
    </svg>
  );
}

// ── Component ────────────────────────────────────────────
export default function SearchBar({
  placeholder = "Search courses, topics…",
  results,
  onSearch,
  onSelect,
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const displayResults = results ?? DEMO_RESULTS;

  const filtered: ResultGroup[] = query.trim()
    ? displayResults
        .map((g) => ({
          ...g,
          items: g.items.filter((item) =>
            item.title.toLowerCase().includes(query.toLowerCase())
          ),
        }))
        .filter((g) => g.items.length > 0)
    : displayResults;

  const allItems = filtered.flatMap((g) => g.items);
  const hasResults = allItems.length > 0;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setOpen(true);
    setActiveIndex(-1);
    onSearch?.(e.target.value);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      onSelect?.(allItems[activeIndex]);
      setQuery(allItems[activeIndex].title);
      setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  function handleClear() {
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  let flatIndex = -1;

  return (
    <div ref={wrapperRef} className={`${styles.wrapper} ${className}`}>
      {/* Search icon */}
      <span className={styles.iconSearch}>
        <SearchIcon />
      </span>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        className={styles.input}
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        spellCheck={false}
      />

      {/* Clear button */}
      {query && (
        <button className={styles.clearBtn} onClick={handleClear} tabIndex={-1} aria-label="Clear search">
          <CloseIcon />
        </button>
      )}

      {/* Results */}
      <div className={`${styles.results} ${open ? styles.resultsOpen : ""}`}>
        <div className={styles.resultsInner}>
          <div className={styles.resultsContent}>
            {hasResults ? (
              filtered.map((group, gi) => (
                <div key={group.label} className={styles.resultGroup}>
                  {gi > 0 && <div className={styles.resultDivider} />}
                  <div className={styles.resultGroupLabel}>{group.label}</div>
                  {group.items.map((item) => {
                    flatIndex++;
                    const idx = flatIndex;
                    return (
                      <div
                        key={item.id}
                        className={`${styles.resultItem} ${activeIndex === idx ? styles.resultItemActive : ""}`}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onMouseDown={() => {
                          onSelect?.(item);
                          setQuery(item.title);
                          setOpen(false);
                        }}
                      >
                        <div className={styles.resultIcon}>{item.icon}</div>
                        <div className={styles.resultText}>
                          <span className={styles.resultTitle}>{item.title}</span>
                          <span className={styles.resultMeta}>{item.meta}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>No results found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}