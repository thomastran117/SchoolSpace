"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./MobileHeader.module.css";
import SearchBar from "../common/Searchbar";
import { plainLinks } from "./headerConfig";

export default function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className={styles.header}>

      {/* ── Top bar: logo left, burger right ── */}
      <div className={styles.bar}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoMark}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M2.5 11.5L6 5L9.5 9L11.5 6.5L13 11.5H2.5Z" fill="white" />
            </svg>
          </div>
          <span className={styles.logoText}>Elevate</span>
        </Link>

        <button
          className={styles.burger}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <div className={styles.burgerInner}>
            <span className={`${styles.burgerLine} ${menuOpen ? styles.open1 : ""}`} />
            <span className={`${styles.burgerLine} ${menuOpen ? styles.open2 : ""}`} />
            <span className={`${styles.burgerLine} ${menuOpen ? styles.open3 : ""}`} />
          </div>
        </button>
      </div>

      {/* ── Slide-down drawer ── */}
      <div className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ""}`}>
        <div className={styles.drawerInner}>
          <div className={styles.drawerContent}>

            {/* Search at top of drawer */}
            <div className={styles.drawerSearch}>
              <SearchBar placeholder="Search courses…" />
            </div>

            {/* Nav links */}
            <nav className={styles.drawerNav}>
              <Link href="/courses"   className={styles.drawerLink} onClick={() => setMenuOpen(false)}>Courses</Link>
              <Link href="/paths"     className={styles.drawerLink} onClick={() => setMenuOpen(false)}>Paths</Link>
              {plainLinks.map((link) => (
                <Link key={link.label} href={link.href} className={styles.drawerLink} onClick={() => setMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Auth actions */}
            <div className={styles.drawerActions}>
              <Link href="/login"  className={styles.drawerSignIn}>Sign in</Link>
              <Link href="/signup" className={styles.drawerCta}>Get started</Link>
            </div>

          </div>
        </div>
      </div>

    </header>
  );
}