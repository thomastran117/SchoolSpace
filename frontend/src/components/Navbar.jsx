import { clearCredentials } from "../stores/authSlice";
import "../styles/navbar.css";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import config from "../configs/envManager";

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
      { label: "Dashboard", to: "/dashboard" },
      { label: "Login", to: "/auth" },
      { divider: true },
      { label: "Support", to: "/support" },
    ],
  },
  onSearch,
  activeColor = "#16a34a",
  activeBgSoft = "rgba(22, 163, 74, 0.1)",
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
      await axios.post(
        `${config.backend_url}/auth/logout`,
        {},
        { withCredentials: true },
      );
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      dispatch(clearCredentials());
      navigate("/auth");
    }
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm"
      style={{
        "--active-color": activeColor,
        "--active-bg-soft": activeBgSoft,
      }}
    >
      <div className="container">
        <NavLink
          className="navbar-brand d-flex align-items-center gap-2"
          to={brand.href}
        >
          <span className="fw-bold text-success fs-5">{brand.name}</span>
          <span className="badge rounded-pill bg-success-subtle text-success">
            New
          </span>
        </NavLink>

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

        <div className="collapse navbar-collapse" id="mainNavbar">
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
                    ),
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
              className="form-control"
              type="search"
              placeholder="Search..."
              aria-label="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>

          <div className="d-flex align-items-center gap-2">
            {!token ? (
              <NavLink
                to="/auth"
                className="btn btn-outline-success rounded-pill px-4 py-2 fw-semibold shadow-sm"
              >
                Login
              </NavLink>
            ) : (
              <li className="nav-item dropdown list-unstyled">
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  href="#"
                  id="profileDropdown"
                  role="button"
                  aria-expanded="false"
                >
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      email || "U",
                    )}&background=16a34a&color=fff`}
                    alt="avatar"
                    className="rounded-circle"
                    width="36"
                    height="36"
                  />
                </a>
                <ul
                  className="dropdown-menu dropdown-menu-end rounded-3 shadow-sm border-0"
                  aria-labelledby="profileDropdown"
                >
                  <li>
                    <NavLink className="dropdown-item" to="/profile">
                      Profile
                    </NavLink>
                  </li>
                  <li>
                    <NavLink className="dropdown-item" to="/settings">
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
              </li>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
