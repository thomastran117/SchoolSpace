import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function ElegantNavbar({
  brand = { name: "Brand", href: "/" },
  links = [
    { label: "Home", to: "/" },
    { label: "Features", to: "/features" },
    { label: "Pricing", to: "/pricing" },
  ],
  dropdown = {
    label: "More",
    items: [
      { label: "Docs", to: "/docs" },
      { label: "Blog", to: "/blog" },
      { divider: true },
      { label: "Support", to: "/support" },
    ],
  },
  onSearch,
  activeColor = "#16a34a", // emerald
  activeBgSoft = "rgba(22, 163, 74, 0.1)",
}) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  return (
    <>
      {/* Style overrides */}
      <style>{`
        .navbar .nav-link.router-active {
          color: ${activeColor} !important;
        }
        .navbar .nav-link.router-active::after {
          content: "";
          display: block;
          height: 2px;
          background: ${activeColor};
          width: 100%;
          margin-top: .25rem;
          border-radius: 2px;
        }
        .navbar .dropdown-menu .dropdown-item.router-active {
          background-color: ${activeBgSoft} !important;
          color: ${activeColor} !important;
        }
        /* Hover dropdown on desktop */
        @media (min-width: 992px) {
          .navbar .dropdown:hover .dropdown-menu {
            display: block;
            margin-top: 0;
          }
        }
        /* Search input polish */
        .navbar .form-control {
          border-radius: 9999px;
          padding-left: 1rem;
          padding-right: 1rem;
          box-shadow: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .navbar .form-control:focus {
          border-color: ${activeColor};
          box-shadow: 0 0 0 .2rem ${activeBgSoft};
        }
      `}</style>

      <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm">
        <div className="container">
          {/* Brand */}
          <NavLink
            className="navbar-brand d-flex align-items-center gap-2"
            to={brand.href}
          >
            <span className="fw-bold text-success fs-5">{brand.name}</span>
            <span className="badge rounded-pill bg-success-subtle text-success">
              New
            </span>
          </NavLink>

          {/* Toggler */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Collapsible content */}
          <div className="collapse navbar-collapse" id="mainNavbar">
            {/* Left links */}
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {links.map((l) => (
                <li className="nav-item" key={l.to}>
                  <NavLink
                    to={l.to}
                    end
                    className={({ isActive }) =>
                      `nav-link px-3 ${isActive ? "router-active" : ""}`
                    }
                  >
                    {l.label}
                  </NavLink>
                </li>
              ))}

              {/* Dropdown */}
              {dropdown && (
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle px-3"
                    href="#"
                    id="navDropdown"
                    role="button"
                    aria-expanded="false"
                  >
                    {dropdown.label}
                  </a>
                  <ul
                    className="dropdown-menu rounded-3 shadow-sm border-0"
                    aria-labelledby="navDropdown"
                  >
                    {dropdown.items.map((it, i) =>
                      it.divider ? (
                        <li key={`div-${i}`}>
                          <hr className="dropdown-divider" />
                        </li>
                      ) : (
                        <li key={it.to}>
                          <NavLink
                            to={it.to}
                            className={({ isActive }) =>
                              `dropdown-item py-2 px-3 ${
                                isActive ? "router-active" : ""
                              }`
                            }
                          >
                            {it.label}
                          </NavLink>
                        </li>
                      )
                    )}
                  </ul>
                </li>
              )}
            </ul>

            {/* Search */}
            <form
              className="d-flex me-lg-3 mb-3 mb-lg-0"
              role="search"
              onSubmit={handleSubmit}
            >
              <input
                className="form-control"
                type="search"
                placeholder="Search..."
                aria-label="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </form>

            {/* CTA */}
            <div className="d-flex align-items-center gap-2">
              <NavLink
                to="/get-started"
                className="btn btn-success rounded-pill px-4 py-2 fw-semibold shadow-sm"
              >
                Get Started
              </NavLink>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
