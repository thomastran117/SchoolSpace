import { NavLink } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Github,
  Linkedin,
} from "lucide-react"; // If you want icons (or use FontAwesome/Bootstrap icons)

export default function ElegantFooter() {
  return (
    <>
      <style>{`
        .footer-link {
          color: #6c757d;
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-link:hover {
          color: #16a34a; /* emerald */
        }
        .footer-social a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: rgba(22, 163, 74, 0.1);
          color: #16a34a;
          transition: all 0.3s;
        }
        .footer-social a:hover {
          background-color: #16a34a;
          color: #fff;
        }
      `}</style>

      <footer className="bg-light border-top pt-5 mt-5">
        <div className="container">
          <div className="row gy-4">
            {/* Brand + Description */}
            <div className="col-md-4">
              <NavLink
                to="/"
                className="d-flex align-items-center gap-2 mb-3 text-decoration-none"
              >
                <span className="fw-bold fs-5 text-success">Brand</span>
                <span className="badge bg-success-subtle text-success">New</span>
              </NavLink>
              <p className="text-muted small">
                Building modern, responsive web apps with elegance and
                simplicity.
              </p>
            </div>

            {/* Links */}
            <div className="col-md-2">
              <h6 className="fw-bold mb-3">Company</h6>
              <ul className="list-unstyled">
                <li><NavLink to="/about" className="footer-link">About</NavLink></li>
                <li><NavLink to="/features" className="footer-link">Features</NavLink></li>
                <li><NavLink to="/pricing" className="footer-link">Pricing</NavLink></li>
                <li><NavLink to="/blog" className="footer-link">Blog</NavLink></li>
              </ul>
            </div>

            <div className="col-md-2">
              <h6 className="fw-bold mb-3">Support</h6>
              <ul className="list-unstyled">
                <li><NavLink to="/docs" className="footer-link">Docs</NavLink></li>
                <li><NavLink to="/help" className="footer-link">Help Center</NavLink></li>
                <li><NavLink to="/contact" className="footer-link">Contact</NavLink></li>
                <li><NavLink to="/privacy" className="footer-link">Privacy</NavLink></li>
              </ul>
            </div>

            {/* Newsletter + Social */}
            <div className="col-md-4">
              <h6 className="fw-bold mb-3">Stay Updated</h6>
              <form className="d-flex mb-3">
                <input
                  type="email"
                  className="form-control rounded-start-pill"
                  placeholder="Your email"
                />
                <button className="btn btn-success rounded-end-pill px-3">
                  Subscribe
                </button>
              </form>

              <div className="footer-social d-flex gap-2">
                <a href="#"><Facebook size={18} /></a>
                <a href="#"><Twitter size={18} /></a>
                <a href="#"><Instagram size={18} /></a>
                <a href="#"><Github size={18} /></a>
                <a href="#"><Linkedin size={18} /></a>
              </div>
            </div>
          </div>

          <hr className="my-4" />
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center text-muted small">
            <p className="mb-2 mb-md-0">
              © {new Date().getFullYear()} Brand. All rights reserved.
            </p>
            <div>
              <NavLink to="/terms" className="footer-link me-3">
                Terms
              </NavLink>
              <NavLink to="/privacy" className="footer-link">
                Privacy
              </NavLink>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
