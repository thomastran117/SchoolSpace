import React from "react";
import "../../styles/shared/Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="footer-fullwidth mt-5 py-5">
      <div className="footer container py-4 rounded">
        <div className="row footer-grid">
          <div className="col-md-3 mb-4 text-center text-md-start">
            <h4 className="footer-logo fw-bold">SchoolSpace</h4>
            <p className="footer-tagline text-secondary small mt-2">
              Empowering students and educators with seamless academic tools.
            </p>

            <div className="footer-social d-flex gap-3 mt-3 justify-content-center justify-content-md-start">
              <a href="#" className="social-icon">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="social-icon">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="social-icon">
                <i className="bi bi-twitter-x"></i>
              </a>
              <a href="#" className="social-icon">
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>

          <div className="col-md-3 mb-4 text-center text-md-start">
            <h6 className="footer-heading fw-bold">Explore</h6>
            <ul className="footer-links-list mt-3">
              <li>
                <a href="#services">Services</a>
              </li>
              <li>
                <a href="#why-us">Why Choose Us</a>
              </li>
              <li>
                <a href="#how">How It Works</a>
              </li>
              <li>
                <a href="#testimonial">Testimonials</a>
              </li>
            </ul>
          </div>

          <div className="col-md-3 mb-4 text-center text-md-start">
            <h6 className="footer-heading fw-bold">Resources</h6>
            <ul className="footer-links-list mt-3">
              <li>
                <a href="#faq">FAQ</a>
              </li>
              <li>
                <a href="#">Help Center</a>
              </li>
              <li>
                <a href="#">Guides</a>
              </li>
              <li>
                <a href="#">Student Support</a>
              </li>
            </ul>
          </div>

          <div className="col-md-3 mb-4 text-center text-md-start">
            <h6 className="footer-heading fw-bold">Legal</h6>
            <ul className="footer-links-list mt-3">
              <li>
                <a href="#">Privacy Policy</a>
              </li>
              <li>
                <a href="#">Terms of Service</a>
              </li>
              <li>
                <a href="#">Cookies</a>
              </li>
              <li>
                <a href="#">Accessibility</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom text-center mt-4 pt-3">
          <p className="footer-text small text-secondary">
            © {new Date().getFullYear()} SchoolSpace — All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
