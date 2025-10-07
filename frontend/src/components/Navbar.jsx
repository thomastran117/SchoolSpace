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
  const { token } = useSelector((state) => state.auth);

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
    <nav
      className="
        sticky top-0 z-50 w-full
        backdrop-blur-md
        bg-gradient-to-r from-emerald-50 via-white to-emerald-50
        border-b border-emerald-100
        shadow-[0_2px_10px_rgba(0,0,0,0.03)]
      "
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-5 py-2 md:py-1.5">
        <NavLink to="/" className="flex items-center gap-2 no-underline select-none">
          <span className="text-emerald-600 font-bold text-lg tracking-tight hover:text-emerald-700 transition">
            Brand
          </span>
          <span
            className="
              text-[0.75rem] font-semibold text-emerald-700
              bg-gradient-to-r from-emerald-100 to-emerald-200/70
              px-2 py-[2px] rounded-full shadow-sm
              border border-emerald-200/50
              hover:from-emerald-200 hover:to-emerald-300/70 transition
            "
          >
            New
          </span>
        </NavLink>

        <button
          className="md:hidden text-gray-600 hover:text-emerald-600 outline-none focus:outline-none focus:ring-0"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        <div
          className={`
            ${menuOpen ? "flex" : "hidden"}
            md:flex flex-col md:flex-row items-center
            gap-4 md:gap-6 absolute md:static left-0 top-[50px] md:top-auto w-full md:w-auto
            bg-gradient-to-r from-emerald-50 via-white to-emerald-50 md:bg-transparent
            border-t md:border-0 py-3 md:py-0 px-6 md:px-0
            md:shadow-none shadow-[0_10px_25px_rgba(0,0,0,0.05)]
            rounded-b-xl md:rounded-none transition-all duration-300
          `}
        >
          {["Home", "Features", "Pricing"].map((item) => (
            <NavLink
              key={item}
              to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
              className={({ isActive }) =>
                `relative text-sm font-medium px-2 py-1.5
                 text-gray-700 transition-all duration-200
                 no-underline
                 after:content-[''] after:absolute after:left-0 after:-bottom-[2px]
                 after:w-0 after:h-[2px] after:bg-emerald-500 after:transition-all after:duration-300
                 hover:text-emerald-600 hover:after:w-full
                 ${isActive ? "text-emerald-600 after:w-full" : ""}`
              }
            >
              {item}
            </NavLink>
          ))}

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="
                flex items-center gap-1 text-sm font-medium text-gray-700
                hover:text-emerald-600 bg-transparent border-none outline-none
                px-2 py-1.5 cursor-pointer transition
              "
            >
              More
              <svg
                className={`w-4 h-4 mt-[1px] transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
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
              <ul
                className="
                  absolute left-0 mt-2 w-44 py-1
                  bg-white border border-gray-200 rounded-md shadow-lg
                  text-sm z-50
                  animate-fade-in-up
                "
              >
                {[
                  { label: "Docs", to: "/docs" },
                  { label: "Dashboard", to: "/dashboard" },
                  { divider: true },
                  { label: "Support", to: "/support" },
                ].map((item, i) =>
                  item.divider ? (
                    <li key={`div-${i}`} className="border-t border-gray-100 my-1"></li>
                  ) : (
                    <li key={item.label}>
                      <NavLink
                        to={item.to}
                        className="
                          block px-4 py-2
                          text-gray-700 hover:bg-emerald-50 hover:text-emerald-600
                          transition-colors duration-150 no-underline
                        "
                      >
                        {item.label}
                      </NavLink>
                    </li>
                  )
                )}
              </ul>
            )}
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="
              hidden md:flex items-center border border-gray-200 rounded-full overflow-hidden
              w-[150px] h-[30px] focus-within:ring-1 focus-within:ring-emerald-500 transition-all duration-200
            "
          >
            <input
              type="search"
              placeholder="Search"
              className="flex-1 px-3 py-0.5 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent"
            />
          </form>

          {!token ? (
            <NavLink
              to="/auth"
              className="
                px-4 py-1.5 rounded-full text-sm font-medium text-white
                bg-gradient-to-r from-emerald-500 to-emerald-600
                hover:from-emerald-600 hover:to-emerald-700
                shadow-sm hover:shadow-md transition-all duration-300
                no-underline
              "
            >
              Login
            </NavLink>
          ) : (
            <button
              onClick={handleLogout}
              className="
                px-4 py-1.5 rounded-full text-sm font-medium text-white
                bg-gradient-to-r from-emerald-500 to-emerald-600
                hover:from-emerald-600 hover:to-emerald-700
                shadow-sm hover:shadow-md transition-all duration-300
              "
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
