import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import config from "../configs/envManager";
import { clearCredentials } from "../stores/authSlice";

export default function ElegantNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, email } = useSelector((state) => state.auth);

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
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-1.5 md:py-1">
        <NavLink
          to="/"
          className="flex items-center gap-2 no-underline select-none"
        >
          <span className="text-emerald-600 font-bold text-base">Brand</span>
        </NavLink>

        <button
          className="md:hidden text-gray-700 hover:text-emerald-600 outline-none focus:ring-0 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>

        <div
          className={`${
            menuOpen ? "flex" : "hidden"
          } md:flex flex-col md:flex-row items-center gap-4 md:gap-6 absolute md:static left-0 top-[42px] md:top-auto w-full md:w-auto bg-white md:bg-transparent border-t md:border-0 md:shadow-none py-3 md:py-0 px-5 md:px-0`}
        >
          {["Home", "Features", "Pricing"].map((item) => (
            <NavLink
              key={item}
              to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
              className={({ isActive }) =>
                `text-sm font-medium no-underline transition ${
                  isActive
                    ? "text-emerald-600"
                    : "text-gray-700 hover:text-emerald-600"
                }`
              }
            >
              {item}
            </NavLink>
          ))}

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-emerald-600 bg-transparent border-none outline-none focus:outline-none focus:ring-0 appearance-none cursor-pointer"
              style={{ border: "none", boxShadow: "none" }}
            >
              More
              <svg
                className={`w-4 h-4 transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                />
              </svg>
            </button>

            {dropdownOpen && (
              <ul className="absolute mt-2 bg-white border border-gray-200 rounded-md shadow-md w-44 py-1.5 z-50">
                {["Docs", "Dashboard", "Support"].map((item) => (
                  <li key={item}>
                    <NavLink
                      to={`/${item.toLowerCase()}`}
                      className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-emerald-600 transition"
                    >
                      {item}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="hidden md:flex items-center border border-gray-300 rounded-full overflow-hidden w-[150px] h-[30px] focus-within:ring-1 focus-within:ring-emerald-500 transition"
          >
            <input
              type="search"
              placeholder="Search"
              className="flex-1 px-3 py-0.5 text-sm outline-none"
            />
          </form>

          {!token ? (
            <NavLink
              to="/auth"
              className="px-3 py-1 border border-emerald-600 rounded-full text-emerald-600 text-sm font-medium hover:bg-emerald-600 hover:text-white transition"
            >
              Login
            </NavLink>
          ) : (
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded-full bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
