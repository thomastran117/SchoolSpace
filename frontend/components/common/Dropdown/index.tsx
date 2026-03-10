"use client";

import { useState, useRef, useEffect, useId } from "react";
import Link from "next/link";
import styles from "./Dropdown.module.css";

// ── Types ────────────────────────────────────────────────
export interface DropdownItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string;
  shortcut?: string;
  destructive?: boolean;
  onClick?: () => void;
}

export interface DropdownSection {
  label?: string;
  items: DropdownItem[];
}

interface DropdownProps {
  /** Button label */
  trigger: React.ReactNode;
  sections: DropdownSection[];
  align?: "left" | "right" | "center";
  /** Extra class applied to the wrapper div */
  className?: string;
  /** Extra class applied to the trigger button itself (e.g. styles.cta) */
  triggerClassName?: string;
}

// ── Chevron ──────────────────────────────────────────────
function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 4.5L6 8l3.5-3.5" />
    </svg>
  );
}

// ── Component ────────────────────────────────────────────
export default function Dropdown({ trigger, sections, align = "left", className = "", triggerClassName = "" }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const id = useId();

  // Close on outside click or Escape
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const alignClass =
    align === "right"  ? styles.panelRight  :
    align === "center" ? styles.panelCenter :
    styles.panelLeft;

  function handleItemClick(item: DropdownItem) {
    item.onClick?.();
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className={`${styles.wrapper} ${className}`}>
      {/* Trigger */}
      <button
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""} ${triggerClassName}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={id}
      >
        {trigger}
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}>
          <ChevronIcon />
        </span>
      </button>

      {/* Panel */}
      {open && (
        <div id={id} className={`${styles.panel} ${alignClass}`} role="menu">
          {sections.map((section, si) => (
            <div key={si} className={styles.section}>
              {si > 0 && <div className={styles.divider} />}
              {section.label && (
                <div className={styles.sectionLabel}>{section.label}</div>
              )}
              {section.items.map((item) => {
                const itemClass = [
                  styles.item,
                  activeId === item.id ? styles.itemActive : "",
                  item.destructive ? styles.itemDestructive : "",
                ].join(" ");

                const content = (
                  <>
                    {item.icon && <span className={styles.itemIcon}>{item.icon}</span>}
                    <span className={styles.itemLabel}>{item.label}</span>
                    {item.badge && <span className={styles.itemBadge}>{item.badge}</span>}
                    {item.shortcut && <span className={styles.itemShortcut}>{item.shortcut}</span>}
                  </>
                );

                return item.href ? (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={itemClass}
                    role="menuitem"
                    onMouseEnter={() => setActiveId(item.id)}
                    onMouseLeave={() => setActiveId(null)}
                    onClick={() => setOpen(false)}
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    className={itemClass}
                    role="menuitem"
                    onMouseEnter={() => setActiveId(item.id)}
                    onMouseLeave={() => setActiveId(null)}
                    onClick={() => handleItemClick(item)}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}