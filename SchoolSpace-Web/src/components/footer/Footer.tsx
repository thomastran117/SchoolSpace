import { NavLink as RouterLink } from "react-router-dom";
import {
  Mail,
  MapPin,
  Phone,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  LifeBuoy,
} from "lucide-react";

type LinkItem = { label: string; href: string; external?: boolean };

function FooterLink({ label, href, external }: LinkItem) {
  const base =
    "inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition";
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={base}>
        {label}
        <ExternalLink size={14} className="text-slate-400" />
      </a>
    );
  }

  return (
    <RouterLink to={href} className={base}>
      {label}
    </RouterLink>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  const product: LinkItem[] = [
    { label: "Courses", href: "/catalogue" },
    { label: "Schools", href: "/schools" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "About", href: "/about" },
  ];

  const resources: LinkItem[] = [
    { label: "Student Handbook", href: "/resources/handbook" },
    { label: "Documentation", href: "/docs" },
    { label: "Support", href: "/support" },
    { label: "Status", href: "/status" },
  ];

  const legal: LinkItem[] = [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Accessibility", href: "/accessibility" },
  ];

  return (
    <footer className="mt-16">
      <div className="h-px w-full bg-gradient-to-r from-indigo-600/30 via-slate-200 to-indigo-600/20" />

      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-4">
              <div className="flex items-center gap-3">
                <div
                  className="
                    h-10 w-10 rounded-xl grid place-items-center
                    bg-white shadow-sm ring-1 ring-slate-200
                  "
                >
                  <span className="font-semibold text-indigo-700">S</span>
                </div>

                <div className="leading-tight">
                  <div className="text-base font-semibold text-slate-900">
                    SchoolSpace
                  </div>
                  <div className="text-sm text-slate-500 -mt-0.5">
                    Campus Portal
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-600 max-w-sm">
                SchoolSpace helps students explore courses, compare schools, and
                make confident academic decisions — all in one modern platform.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-slate-600 bg-slate-50 ring-1 ring-slate-200">
                  <ShieldCheck size={14} className="text-indigo-600" />
                  Secure access
                </span>
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-slate-600 bg-slate-50 ring-1 ring-slate-200">
                  <BookOpen size={14} className="text-indigo-600" />
                  Clear policies
                </span>
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-slate-600 bg-slate-50 ring-1 ring-slate-200">
                  <LifeBuoy size={14} className="text-indigo-600" />
                  Support ready
                </span>
              </div>
            </div>

            {/* Columns */}
            <div className="md:col-span-8">
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <div className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Product
                  </div>
                  <div className="mt-3 space-y-2">
                    {product.map((l) => (
                      <div key={l.href}>
                        <FooterLink {...l} />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Resources
                  </div>
                  <div className="mt-3 space-y-2">
                    {resources.map((l) => (
                      <div key={l.href}>
                        <FooterLink {...l} />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Contact
                  </div>

                  <div className="mt-3 space-y-3 text-sm text-slate-600">
                    <div className="flex items-start gap-2">
                      <Mail size={16} className="mt-0.5 text-slate-400" />
                      <a
                        href="mailto:schoolspace@outlook.com"
                        className="hover:text-slate-900 transition"
                      >
                        schoolspace@outlook.com
                      </a>
                    </div>

                    <div className="flex items-start gap-2">
                      <Phone size={16} className="mt-0.5 text-slate-400" />
                      <span>(000) 000-0000</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="mt-0.5 text-slate-400" />
                      <span>Ottawa, ON</span>
                    </div>

                    <RouterLink
                      to="/contact"
                      className="
                        inline-flex items-center justify-center
                        rounded-xl px-4 py-2 text-sm font-medium
                        bg-indigo-600 text-white hover:bg-indigo-500
                        shadow-sm transition
                        focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-2
                      "
                    >
                      Contact us
                    </RouterLink>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200/70">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">
                © {year} <span className="text-slate-600">SchoolSpace</span>.
                All rights reserved.
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {legal.map((l) => (
                  <FooterLink key={l.href} {...l} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="h-10 bg-gradient-to-r from-indigo-500/[0.05] via-transparent to-indigo-500/[0.04]" />
      </div>
    </footer>
  );
}
