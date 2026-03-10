// ── Shared nav data & icons for Desktop and Mobile headers ──

import { DropdownSection } from "../common/Dropdown";

export const coursesMenu: DropdownSection[] = [
  {
    label: "Explore",
    items: [
      { id: "all-courses", label: "All Courses",    href: "/courses",          icon: <GridIcon /> },
      { id: "trending",    label: "New & Trending", href: "/courses/trending", icon: <SparkleIcon />, badge: "New" },
      { id: "paths",       label: "Learning Paths", href: "/paths",            icon: <PathIcon /> },
    ],
  },
  {
    label: "Topics",
    items: [
      { id: "webdev",  label: "Web Development", href: "/topics/web",    icon: <CodeIcon /> },
      { id: "design",  label: "UI/UX Design",    href: "/topics/design", icon: <BrushIcon /> },
      { id: "data",    label: "Data & AI",        href: "/topics/data",   icon: <ChartIcon /> },
    ],
  },
];

export const userMenu: DropdownSection[] = [
  {
    items: [
      { id: "profile",  label: "My Profile",  href: "/profile",  icon: <UserIcon />,     shortcut: "⌘P" },
      { id: "learning", label: "My Learning", href: "/learning", icon: <BookIcon /> },
      { id: "settings", label: "Settings",    href: "/settings", icon: <SettingsIcon />, shortcut: "⌘," },
    ],
  },
  {
    items: [
      { id: "signout", label: "Sign out", icon: <LogoutIcon />, destructive: true },
    ],
  },
];

export const plainLinks = [
  { label: "Community", href: "/community" },
  { label: "Pricing",   href: "/pricing" },
];

// ── Icons ──────────────────────────────────────────────────
export function GridIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>;
}
export function SparkleIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v2M8 12v2M2 8h2M12 8h2M4.5 4.5l1.5 1.5M10 10l1.5 1.5M4.5 11.5L6 10M10 6l1.5-1.5"/></svg>;
}
export function PathIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="4" cy="4" r="2"/><circle cx="12" cy="12" r="2"/><path d="M6 4h2a4 4 0 0 1 4 4v2"/></svg>;
}
export function CodeIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4L2 8l3 4M11 4l3 4-3 4M9 3l-2 10"/></svg>;
}
export function BrushIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2l3 3-7 7H4v-3l7-7z"/><path d="M2 14s1-2 3-2"/></svg>;
}
export function ChartIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12l4-4 3 3 5-7"/></svg>;
}
export function UserIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3 2.5-5 6-5s6 2 6 5"/></svg>;
}
export function BookIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9Z"/><path d="M6 2v12M6 7h5"/></svg>;
}
export function SettingsIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="2"/><path d="M8 2v1M8 13v1M2 8h1M13 8h1M4 4l.7.7M11.3 11.3l.7.7M4 12l.7-.7M11.3 4.7l.7-.7"/></svg>;
}
export function LogoutIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M11 11l3-3-3-3M14 8H6"/></svg>;
}