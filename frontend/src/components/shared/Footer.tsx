import { Github, Linkedin, Twitter, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_400px_at_50%_-200px,rgba(168,85,247,0.18),transparent_60%)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-fuchsia-500/10" />
      <div className="absolute inset-x-0 top-0 h-px bg-slate-200/70" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 py-20">
        {/* Top Grid */}
        <div className="grid gap-14 md:grid-cols-5">
          {/* Brand */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 via-indigo-600 to-fuchsia-600 text-white font-bold grid place-items-center shadow">
                S
              </div>
              <span className="text-lg font-semibold text-slate-900">
                SchoolSpace
              </span>
            </div>

            <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
              SchoolSpace helps students explore courses, compare schools, and
              make confident academic decisions — all in one modern platform.
            </p>

            {/* Socials */}
            <div className="flex items-center gap-4 pt-2">
              <SocialLink href="#">
                <Github size={18} />
              </SocialLink>
              <SocialLink href="#">
                <Linkedin size={18} />
              </SocialLink>
              <SocialLink href="#">
                <Twitter size={18} />
              </SocialLink>
              <SocialLink href="mailto:support@schoolspace.com">
                <Mail size={18} />
              </SocialLink>
            </div>
          </div>

          {/* Columns */}
          <FooterColumn title="Product">
            <FooterLink href="/catalogue">Course Catalogue</FooterLink>
            <FooterLink href="/schools">Schools</FooterLink>
            <FooterLink href="/compare">Compare Programs</FooterLink>
            <FooterLink href="/dashboard">Dashboard</FooterLink>
          </FooterColumn>

          <FooterColumn title="Resources">
            <FooterLink href="/guides">Student Guides</FooterLink>
            <FooterLink href="/faq">FAQ</FooterLink>
            <FooterLink href="/blog">Blog</FooterLink>
            <FooterLink href="/support">Support</FooterLink>
          </FooterColumn>

          <FooterColumn title="Company">
            <FooterLink href="/about">About Us</FooterLink>
            <FooterLink href="/careers">Careers</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
          </FooterColumn>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500">
          <span>
            © {new Date().getFullYear()} SchoolSpace. All rights reserved.
          </span>

          <div className="flex gap-6">
            <BottomLink href="/privacy">Privacy</BottomLink>
            <BottomLink href="/terms">Terms</BottomLink>
            <BottomLink href="/cookies">Cookies</BottomLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------------------------------- */
/* Subcomponents */
/* ---------------------------------- */

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
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
        className="text-sm text-slate-600 hover:text-purple-600 transition-colors"
      >
        {children}
      </a>
    </li>
  );
}

function BottomLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} className="hover:text-purple-600 transition-colors">
      {children}
    </a>
  );
}

function SocialLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="text-slate-500 hover:text-purple-600 transition-colors"
    >
      {children}
    </a>
  );
}
