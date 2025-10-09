import { clearCredentials } from "../stores/authSlice";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import config from "../configs/envManager";

export default function ElegantNavbar({
  brand = { name: "School", href: "/" },
  links = [
    { label: "Home", to: "/" },
    { label: "Features", to: "/features" },
    { label: "Pricing", to: "/pricing" },
  ],
  dropdown = {
    label: "More",
    items: [
      { label: "Docs", to: "/docs" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Login", to: "/auth" },
      { divider: true },
      { label: "Support", to: "/support" },
    ],
  },
  onSearch,
}) {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, email } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${config.backend_url}/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      dispatch(clearCredentials());
      navigate("/auth");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg bg-light border-bottom sticky-top shadow-sm">
      <style>{`
        /* ===== Underline Animation ===== */
        .nav-link {
          position: relative;
          overflow: hidden;
        }

        .nav-link::after {
          content: "";
          position: absolute;
          left: 10%;
          bottom: 0;
          width: 0;
          height: 2px;
          background-color: #198754; /* Bootstrap success green */
          transition: width 0.3s ease;
          border-radius: 2px;
        }

        .nav-link:hover::after,
        .nav-link.router-active::after {
          width: 80%;
        }

        .nav-link:hover,
        .dropdown-item:hover {
          color: #198754 !important;
        }

        /* ===== Dropdown Hover / Active Green ===== */
        .dropdown-item:focus,
        .dropdown-item:hover {
          background-color: rgba(25, 135, 84, 0.15) !important;
          color: #198754 !important;
        }

        .dropdown-item.active,
        .dropdown-item:active {
          background-color: #198754 !important;
          color: #fff !important;
        }
      `}</style>

      <div className="container py-2">
        {/* Brand */}
        <NavLink
          to={brand.href}
          className="navbar-brand fw-bold text-success d-flex align-items-center gap-2"
        >
          {brand.name}
          <span className="badge bg-success-subtle text-success fw-semibold">Space</span>
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {links.map((l) => (
              <li className="nav-item" key={l.to}>
                <NavLink
                  to={l.to}
                  end
                  className={({ isActive }) =>
                    `nav-link fw-medium px-3 ${
                      isActive ? "text-success router-active" : ""
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}

            {dropdown && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle fw-medium px-3"
                  href="#"
                  id="navDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {dropdown.label}
                </a>
                <ul className="dropdown-menu shadow border-0 rounded-3">
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
                            `dropdown-item ${isActive ? "active" : ""}`
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

          <form
            className="d-flex me-lg-3 mb-3 mb-lg-0"
            role="search"
            onSubmit={handleSubmit}
          >
            <input
              type="search"
              className="form-control rounded-pill px-3"
              placeholder="Search..."
              aria-label="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>

          {!token ? (
            <NavLink
              to="/auth"
              className="btn btn-outline-success rounded-pill px-4 fw-semibold"
            >
              Login
            </NavLink>
          ) : (
            <div className="dropdown">
              <a
                href="#"
                className="d-flex align-items-center text-decoration-none dropdown-toggle"
                id="profileDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    email || "U"
                  )}&background=16a34a&color=fff`}
                  alt="avatar"
                  className="rounded-circle me-2"
                  width="36"
                  height="36"
                />
              </a>
              <ul
                className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3"
                aria-labelledby="profileDropdown"
              >
                <li>
                  <NavLink to="/profile" className="dropdown-item">
                    Profile
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/settings" className="dropdown-item">
                    Settings
                  </NavLink>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    className="dropdown-item text-danger"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
