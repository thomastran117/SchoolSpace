import {
  Github,
  Linkedin,
  Twitter,
  Mail,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-32 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-indigo-400 to-fuchsia-400 opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 to-white/95" />
      <div className="absolute inset-0 border-t border-slate-200" />

      <div className="relative mx-auto max-w-7xl px-6 py-16">
        {/* Top Grid */}
        <div className="grid gap-12 md:grid-cols-5">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 via-indigo-600 to-fuchsia-600 text-white font-bold grid place-items-center shadow">
                S
              </div>
              <span className="text-lg font-semibold text-slate-900">
                SchoolSpace
              </span>
            </div>

            <p className="text-sm text-slate-600 max-w-sm">
              SchoolSpace helps students explore courses, compare schools,
              and make informed academic decisions — all in one modern platform.
            </p>

            {/* Socials */}
            <div className="flex items-center gap-4 pt-2">
              <a
                href="#"
                className="text-slate-500 hover:text-purple-600 transition"
              >
                <Github size={18} />
              </a>
              <a
                href="#"
                className="text-slate-500 hover:text-purple-600 transition"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="#"
                className="text-slate-500 hover:text-purple-600 transition"
              >
                <Twitter size={18} />
              </a>
              <a
                href="mailto:support@schoolspace.com"
                className="text-slate-500 hover:text-purple-600 transition"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Product */}
          <FooterColumn title="Product">
            <FooterLink href="/catalogue">Course Catalogue</FooterLink>
            <FooterLink href="/schools">Schools</FooterLink>
            <FooterLink href="/compare">Compare Programs</FooterLink>
            <FooterLink href="/dashboard">Dashboard</FooterLink>
          </FooterColumn>

          {/* Resources */}
          <FooterColumn title="Resources">
            <FooterLink href="/guides">Student Guides</FooterLink>
            <FooterLink href="/faq">FAQ</FooterLink>
            <FooterLink href="/blog">Blog</FooterLink>
            <FooterLink href="/support">Support</FooterLink>
          </FooterColumn>

          {/* Company */}
          <FooterColumn title="Company">
            <FooterLink href="/about">About Us</FooterLink>
            <FooterLink href="/careers">Careers</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
          </FooterColumn>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500">
          <span>
            © {new Date().getFullYear()} SchoolSpace. All rights reserved.
          </span>

          <div className="flex gap-6">
            <a
              href="/privacy"
              className="hover:text-purple-600 transition"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="hover:text-purple-600 transition"
            >
              Terms of Service
            </a>
            <a
              href="/cookies"
              className="hover:text-purple-600 transition"
            >
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-slate-900">
        {title}
      </h4>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <a
        href={href}
        className="text-sm text-slate-600 hover:text-purple-600 transition"
      >
        {children}
      </a>
    </li>
  );
}
