import { clearCredentials } from "../stores/authSlice";
import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ProtectedApi from "../api/ProtectedApi";
import PublicApi from "../api/PublicApi";

export default function Navbar({
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
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top shadow-sm">
      <style>{`
        /* ===== General Navbar Styling ===== */
        .navbar {
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .navbar:hover {
          box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
        }

        .navbar-brand span.badge {
          font-size: 0.8rem;
          background-color: rgba(25, 135, 84, 0.1);
        }

        /* ===== Underline Animation ===== */
        .nav-link {
          position: relative;
          overflow: hidden;
          transition: color 0.25s ease;
        }

        .nav-link::after {
          content: "";
          position: absolute;
          left: 15%;
          bottom: 0;
          width: 0;
          height: 2px;
          background-color: #198754;
          transition: width 0.3s ease;
          border-radius: 2px;
        }

        .nav-link:hover::after,
        .nav-link.router-active::after {
          width: 70%;
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

        /* ===== Avatar Styling ===== */
        .avatar-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #198754;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .avatar-circle:hover {
          transform: scale(1.05);
          box-shadow: 0 0 8px rgba(25, 135, 84, 0.3);
        }

        img.avatar-img {
          width: 36px;
          height: 36px;
          object-fit: cover;
          border-radius: 50%;
          border: 2px solid #19875422;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        img.avatar-img:hover {
          transform: scale(1.05);
          box-shadow: 0 0 8px rgba(25, 135, 84, 0.3);
        }

        /* ===== Username Styling ===== */
        .username {
          font-weight: 600;
          color: #212529;
          transition: color 0.2s ease;
        }

        .username:hover {
          color: #198754;
        }
      `}</style>

      <div className="container py-2">
        {/* Brand */}
        <NavLink
          to={brand.href}
          className="navbar-brand fw-bold text-success d-flex align-items-center gap-2"
        >
          {brand.name}
          <span className="badge text-success fw-semibold">Space</span>
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
