"use client";

import Link from "next/link";
import styles from "./DesktopHeader.module.css";
import SearchBar from "../common/Searchbar";
import Dropdown from "../common/Dropdown";
import { coursesMenu, userMenu, plainLinks } from "./headerConfig";

export default function DesktopHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.bar}>

          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <div className={styles.logoMark}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M2.5 11.5L6 5L9.5 9L11.5 6.5L13 11.5H2.5Z" fill="white" />
              </svg>
            </div>
            <span className={styles.logoText}>Elevate</span>
          </Link>

          {/* Nav */}
          <nav className={styles.nav}>
            <Dropdown trigger="Courses" sections={coursesMenu} align="left" />
            {plainLinks.map((link) => (
              <Link key={link.label} href={link.href} className={styles.navLink}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <div className={styles.searchWrap}>
            <SearchBar placeholder="Search courses…" />
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <Link href="/login" className={styles.signIn}>Sign in</Link>
            <Dropdown
              trigger="Get started"
              sections={userMenu}
              align="right"
              triggerClassName={styles.cta}
            />
          </div>

        </div>
      </div>
    </header>
  );
}