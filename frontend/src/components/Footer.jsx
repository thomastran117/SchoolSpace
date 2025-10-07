import { NavLink } from "react-router-dom";
import { Facebook, Twitter, Instagram, Github, Linkedin } from "lucide-react";

export default function ElegantFooter() {
  return (
    <footer className="bg-gradient-to-b from-white to-gray-50 border-t border-gray-200 pt-16 pb-8 px-6 mt-20 text-gray-600">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        <div>
          <NavLink
            to="/"
            className="inline-flex items-center gap-2 mb-4 no-underline"
          >
            <span className="text-2xl font-bold text-emerald-600">Brand</span>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
              New
            </span>
          </NavLink>
          <p className="text-sm text-gray-500 leading-relaxed">
            Building modern, responsive web apps with elegance and simplicity.
          </p>
        </div>

        <div>
          <h6 className="text-gray-800 font-semibold mb-3">Company</h6>
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/about"
                className="hover:text-emerald-600 transition"
              >
                About
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/features"
                className="hover:text-emerald-600 transition"
              >
                Features
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/pricing"
                className="hover:text-emerald-600 transition"
              >
                Pricing
              </NavLink>
            </li>
            <li>
              <NavLink to="/blog" className="hover:text-emerald-600 transition">
                Blog
              </NavLink>
            </li>
          </ul>
        </div>

        <div>
          <h6 className="text-gray-800 font-semibold mb-3">Support</h6>
          <ul className="space-y-2">
            <li>
              <NavLink to="/docs" className="hover:text-emerald-600 transition">
                Docs
              </NavLink>
            </li>
            <li>
              <NavLink to="/help" className="hover:text-emerald-600 transition">
                Help Center
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                className="hover:text-emerald-600 transition"
              >
                Contact
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/privacy"
                className="hover:text-emerald-600 transition"
              >
                Privacy
              </NavLink>
            </li>
          </ul>
        </div>

        <div>
          <h6 className="text-gray-800 font-semibold mb-3">Stay Updated</h6>
          <form className="flex mb-4">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 px-4 py-2 rounded-l-full border border-gray-300 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 rounded-r-full font-semibold transition"
            >
              Subscribe
            </button>
          </form>

          <div className="flex gap-3">
            {[
              { icon: Facebook, href: "#" },
              { icon: Twitter, href: "#" },
              { icon: Instagram, href: "#" },
              { icon: Github, href: "#" },
              { icon: Linkedin, href: "#" },
            ].map(({ icon: Icon, href }, i) => (
              <a
                key={i}
                href={href}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white transition"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 mt-10 pt-6 text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center gap-3">
        <p>© {new Date().getFullYear()} Brand. All rights reserved.</p>
        <div className="flex gap-4">
          <NavLink to="/terms" className="hover:text-emerald-600 transition">
            Terms
          </NavLink>
          <NavLink to="/privacy" className="hover:text-emerald-600 transition">
            Privacy
          </NavLink>
        </div>
      </div>
    </footer>
  );
}
