import { clearCredentials } from "../stores/authSlice";
import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ProtectedApi from "../api/ProtectedApi";
import PublicApi from "../api/PublicApi";

export default function Navbar({
  brand = { name: "SchoolSpace", href: "/" },
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
}) {
  const [avatarBlobUrl, setAvatarBlobUrl] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, username, avatar } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await PublicApi.post(`/auth/logout`);
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      dispatch(clearCredentials());
      navigate("/auth");
    }
  };

  useEffect(() => {
    let revokeUrl = null;
    const fetchAvatar = async () => {
      if (!avatar) {
        setAvatarBlobUrl(null);
        return;
      }
      try {
        const res = await ProtectedApi.get(avatar, { responseType: "blob" });
        const blobUrl = URL.createObjectURL(res.data);
        setAvatarBlobUrl(blobUrl);
        revokeUrl = blobUrl;
      } catch (err) {
        console.error("Failed to load protected avatar:", err);
        setAvatarBlobUrl(null);
      }
    };

    fetchAvatar();
    return () => {
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    };
  }, [avatar]);

  const avatarSrc = avatarBlobUrl || null;
  const firstLetter = username ? username.charAt(0).toUpperCase() : "U";

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top shadow-sm navbar-custom">
      <style>{`
        /* ===== Indigo Navbar Theme (Scoped) ===== */
        .navbar-custom {
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .navbar-custom:hover {
          box-shadow: 0 3px 12px rgba(99, 102, 241, 0.1);
        }

        .navbar-custom .navbar-brand {
          font-weight: 700;
          background: linear-gradient(90deg, #6366f1, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .navbar-custom .navbar-brand span.badge {
          background-color: rgba(99, 102, 241, 0.1);
          color: #6366f1;
          font-size: 0.8rem;
        }

        /* ===== Nav Links ===== */
        .navbar-custom .nav-link {
          position: relative;
          font-weight: 500;
          color: #374151 !important;
          border-radius: 1rem;
          padding: 0.5rem 1rem;
          margin: 0 0.25rem;
          transition: all 0.25s ease;
        }

        .navbar-custom .nav-link:hover {
          background-color: rgba(99, 102, 241, 0.08);
          color: #4f46e5 !important;
        }

        .navbar-custom .nav-link.router-active {
          color: #fff !important;
          background: linear-gradient(90deg, #6366f1, #818cf8);
          box-shadow: 0 3px 8px rgba(99, 102, 241, 0.2);
        }

        /* ===== Dropdown ===== */
        .navbar-custom .dropdown-menu {
          border: none;
          border-radius: 1rem;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
        }

        .navbar-custom .dropdown-item {
          font-weight: 500;
          color: #374151;
          transition: all 0.2s ease;
        }

        .navbar-custom .dropdown-item:hover,
        .navbar-custom .dropdown-item:focus {
          background-color: rgba(99, 102, 241, 0.08);
          color: #4f46e5;
        }

        .navbar-custom .dropdown-item.active,
        .navbar-custom .dropdown-item:active {
          background: linear-gradient(90deg, #6366f1, #818cf8);
          color: #fff;
        }

        /* ===== Avatar ===== */
        .navbar-custom .avatar-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          color: white;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .navbar-custom .avatar-circle:hover {
          transform: scale(1.05);
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.3);
        }

        .navbar-custom img.avatar-img {
          width: 36px;
          height: 36px;
          object-fit: cover;
          border-radius: 50%;
          border: 2px solid rgba(99, 102, 241, 0.25);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .navbar-custom img.avatar-img:hover {
          transform: scale(1.05);
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.3);
        }

        /* ===== Username ===== */
        .navbar-custom .username {
          font-weight: 600;
          color: #111827;
          transition: color 0.2s ease;
        }

        .navbar-custom .username:hover {
          color: #4f46e5;
        }

        /* ===== Login Button ===== */
        .navbar-custom .btn-outline-indigo {
          color: #4f46e5;
          border-color: #6366f1;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .navbar-custom .btn-outline-indigo:hover {
          background: linear-gradient(90deg, #6366f1, #818cf8);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 3px 10px rgba(99, 102, 241, 0.3);
        }
      `}</style>

      <div className="container py-2">
        {/* Brand */}
        <NavLink
          to={brand.href}
          className="navbar-brand d-flex align-items-center gap-2"
        >
          {brand.name}
          <span className="badge fw-semibold">Portal</span>
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
          {/* Left Links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {links.map((l) => (
              <li className="nav-item" key={l.to}>
                <NavLink
                  to={l.to}
                  end
                  className={({ isActive }) =>
                    `nav-link fw-medium ${isActive ? "router-active" : ""}`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}

            {dropdown && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle fw-medium"
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
                    ),
                  )}
                </ul>
              </li>
            )}
          </ul>

          {/* Right Side */}
          {!token ? (
            <NavLink
              to="/auth"
              className="btn btn-outline-indigo rounded-pill px-4 fw-semibold"
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
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="avatar"
                    className="avatar-img me-2"
                  />
                ) : (
                  <div className="avatar-circle me-2">{firstLetter}</div>
                )}
                <span className="username">{username}</span>
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
