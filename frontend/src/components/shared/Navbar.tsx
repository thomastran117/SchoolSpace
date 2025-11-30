import React from "react";
import { NavLink } from "react-router-dom";
import "../../styles/shared/Navbar.css";

const Navbar: React.FC = () => {
  return (
    <nav className="navbar-main w-100">
      <div className="navbar-container container d-flex align-items-center justify-content-between">
        <div className="navbar-logo fw-bold">SchoolSpace</div>

        <ul className="navbar-links d-none d-md-flex gap-4">
          <li>
            <NavLink to="/" className="nav-item-link">
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/services" className="nav-item-link">
              Services
            </NavLink>
          </li>

          <li className="nav-dropdown">
            <button className="nav-item-link nav-dropdown-toggle">
              More
              <span className="dropdown-arrow"></span>
            </button>

            <ul className="dropdown-menu-custom">
              <li>
                <NavLink to="/why-us">Why Us</NavLink>
              </li>
              <li>
                <NavLink to="/how-it-works">How It Works</NavLink>
              </li>
              <li>
                <NavLink to="/faq">FAQ</NavLink>
              </li>
            </ul>
          </li>
          <li>
            <NavLink to="/contact" className="nav-item-link">
              Contact
            </NavLink>
          </li>
        </ul>

        <div className="navbar-cta d-none d-md-block">
          <button className="btn btn-accent rounded-pill px-4 fw-semibold">
            Sign In
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
