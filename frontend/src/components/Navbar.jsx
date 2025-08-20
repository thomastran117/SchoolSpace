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
  activeColor = "#16a34a", // emerald (change to your preferred color)
  activeBgSoft = "rgba(22, 163, 74, 0.1)",
}) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  return (
    <>
      {/* Inline styles to override Bootstrap blue for active links + hover dropdown */}
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
          margin-top: .2rem;
          border-radius: 1px;
        }
        .navbar .dropdown-menu .dropdown-item.router-active {
          background-color: ${activeBgSoft} !important;
          color: ${activeColor} !important;
        }
        /* Hover dropdown */
        @media (min-width: 992px) {
          .navbar .dropdown:hover .dropdown-menu {
            display: block;
            margin-top: 0;
          }
        }
      `}</style>

      <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top border-bottom">
        <div className="container">
          {/* Brand */}
          <NavLink className="navbar-brand d-flex align-items-center gap-2" to={brand.href}>
            <span className="fw-bold">{brand.name}</span>
            <span className="badge rounded-pill text-bg-success">New</span>
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
                      `nav-link ${isActive ? "router-active" : ""}`
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
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="navDropdown"
                    role="button"
                    aria-expanded="false"
                  >
                    {dropdown.label}
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="navDropdown">
                    {dropdown.items.map((it, i) => (
                      it.divider ? (
                        <li key={`div-${i}`}><hr className="dropdown-divider" /></li>
                      ) : (
                        <li key={it.to}>
                          <NavLink
                            to={it.to}
                            className={({ isActive }) =>
                              `dropdown-item ${isActive ? "router-active" : ""}`
                            }
                          >
                            {it.label}
                          </NavLink>
                        </li>
                      )
                    ))}
                  </ul>
                </li>
              )}
            </ul>

            {/* Search */}
            <form className="d-flex me-lg-3 mb-2 mb-lg-0" role="search" onSubmit={handleSubmit}>
              <input
                className="form-control"
                type="search"
                placeholder="Search"
                aria-label="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </form>

            {/* CTA */}
            <div className="d-flex align-items-center gap-2">
              <NavLink to="/get-started" className="btn btn-success rounded-pill px-3">Get Started</NavLink>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
