import { useState } from "react";

import {
  FaHome,
  FaRobot,
  FaClipboardList,
  FaCheckCircle,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaBookmark,
  FaBars,
  FaTimes,
} from "react-icons/fa";

import { Link, useNavigate, useLocation } from "react-router-dom";


function Sidebar() {

  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);


  const handleLogout = () => {

    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");

    alert("Logged out successfully!");

    navigate("/login");

  };


  const closeMobileMenu = () => {
    setMobileOpen(false);
  };


  const isActive = (path) => {
    return location.pathname === path;
  };


  const menuItemClass = (path) => `
    flex
    items-center
    gap-2
    px-3
    py-2
    rounded-lg
    transition-all
    duration-300
    ${
      isActive(path)
        ? "bg-[#142442] text-white border border-blue-800/40"
        : "text-gray-300 hover:bg-[#101d32] hover:text-gray-100"
    }
  `;


  const menu = (
    <>

      {/* Dashboard */}
      <li>
        <Link
          to="/dashboard"
          onClick={closeMobileMenu}
          className={menuItemClass("/dashboard")}
        >
          <FaHome size={16} />
          Dashboard
        </Link>
      </li>


      {/* AI Chat */}
      <li>
        <Link
          to="/chat"
          onClick={closeMobileMenu}
          className={menuItemClass("/chat")}
        >
          <FaRobot size={16} />
          AI Chat
        </Link>
      </li>


      {/* Schemes */}
      <li>
        <Link
          to="/schemes"
          onClick={closeMobileMenu}
          className={menuItemClass("/schemes")}
        >
          <FaClipboardList size={16} />
          Schemes
        </Link>
      </li>


      {/* Eligibility */}
      <li>
        <Link
          to="/eligibility"
          onClick={closeMobileMenu}
          className={menuItemClass("/eligibility")}
        >
          <FaCheckCircle size={16} />
          Eligibility
        </Link>
      </li>


      {/* Profile */}
      <li>
        <Link
          to="/profile"
          onClick={closeMobileMenu}
          className={menuItemClass("/profile")}
        >
          <FaUserCircle size={16} />
          Profile
        </Link>
      </li>


      {/* Saved */}
      <li className="pt-3 mt-3 border-t border-blue-900/40">

        <Link
          to="/saved"
          onClick={closeMobileMenu}
          className={menuItemClass("/saved")}
        >
          <FaBookmark size={16} />
          Saved
        </Link>

      </li>


      {/* Settings */}
      <li>
        <Link
          to="/settings"
          onClick={closeMobileMenu}
          className={menuItemClass("/settings")}
        >
          <FaCog size={16} />
          Settings
        </Link>
      </li>

    </>
  );


  return (
    <>


      {/* =====================================================
          MOBILE TOP BAR
      ===================================================== */}

      <div
        className="
          md:hidden
          fixed
          top-0
          left-0
          right-0
          z-40
          h-16
          bg-[#08111f]/95
          backdrop-blur-xl
          border-b
          border-blue-900/40
          flex
          items-center
          justify-between
          px-4
        "
      >

        {/* Mobile Logo */}

        <div className="text-xl font-bold flex items-center gap-1">

          <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">
            IntelliGov
          </span>

          <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-500 bg-clip-text text-transparent">
            AI
          </span>

        </div>


        {/* Menu Button */}

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="
            w-10
            h-10
            rounded-xl
            bg-[#0c182d]
            border
            border-blue-900/50
            flex
            items-center
            justify-center
            text-slate-300
            hover:text-white
            hover:border-blue-700/60
            transition-all
          "
        >

          <FaBars />

        </button>

      </div>



      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {mobileOpen && (

        <div
          onClick={closeMobileMenu}
          className="
            md:hidden
            fixed
            inset-0
            z-40
            bg-black/60
            backdrop-blur-sm
          "
        />

      )}



      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          w-50
          h-screen
          bg-[#08111f]
          border-r
          border-blue-900/40
          flex
          flex-col
          transition-transform
          duration-300
          ease-out

          md:translate-x-0

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >


        {/* =================================================
            LOGO
        ================================================= */}

        <div className="px-5 py-4 border-b border-blue-900/40 flex flex-col items-center justify-center shrink-0">

          {/* Mobile Close */}

          <div className="w-full flex justify-end md:hidden mb-1">

            <button
              type="button"
              onClick={closeMobileMenu}
              className="
                p-2
                rounded-lg
                text-slate-400
                hover:text-white
                hover:bg-[#101d32]
                transition
              "
            >
              <FaTimes />
            </button>

          </div>


          <div className="text-2xl font-bold flex items-center gap-1">

            <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">
              IntelliGov
            </span>

            <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-500 bg-clip-text text-transparent">
              AI
            </span>

          </div>


          <p className="text-xs text-gray-400 mt-2">
            AI Government Assistant
          </p>

        </div>



        {/* =================================================
            MENU
        ================================================= */}

        <nav className="mt-2 px-2 flex-1 overflow-y-auto">

          <ul className="w-full space-y-1">

            {menu}

          </ul>

        </nav>



        {/* =================================================
            USER + LOGOUT
        ================================================= */}

        <div className="px-4 pb-3 shrink-0">

          <div className="border-t border-blue-900/40 pt-4 mb-3">

            <p className="text-xs text-gray-500">
              Logged in as
            </p>

            <p className="text-sm text-cyan-400 truncate">
              {localStorage.getItem("userEmail") || "Citizen"}
            </p>

          </div>


          <button
            type="button"
            onClick={handleLogout}
            className="
              w-full
              flex
              items-center
              justify-center
              gap-2
              bg-red-500
              hover:bg-red-600
              text-white
              py-2
              rounded-xl
              font-medium
              transition
              duration-300
            "
          >

            <FaSignOutAlt />

            Logout

          </button>

        </div>

      </aside>

    </>
  );
}


export default Sidebar;