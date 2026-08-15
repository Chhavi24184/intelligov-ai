import {
  FaHome,
  FaRobot,
  FaClipboardList,
  FaCheckCircle,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

import { Link, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");

    alert("Logged out successfully!");

    navigate("/login");
  };

  return (
    <aside className="w-50 min-h-screen bg-[#08111f] border-r border-blue-900/40 flex flex-col">

      {/* ================= LOGO ================= */}
      <div className="px-5 py-4 border-b border-blue-900/40 flex flex-col items-center justify-center">

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


      {/* ================= MENU ================= */}
      <nav className="mt-2 px-2">

        <ul className="w-full space-y-1">

          {/* Dashboard */}
          <li>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-[#1a56db] transition duration-300"
            >
              <FaHome size={16} />
              Dashboard
            </Link>
          </li>


          {/* AI Chat */}
          <li>
            <Link
              to="/chat"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-[#1a56db] hover:text-white transition duration-300"
            >
              <FaRobot size={16} />
              AI Chat
            </Link>
          </li>


          {/* Schemes */}
          <li>
            <Link
              to="/schemes"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-[#1a56db] hover:text-white transition duration-300"
            >
              <FaClipboardList size={16} />
              Schemes
            </Link>
          </li>


          {/* Eligibility */}
          <li>
            <Link
              to="/eligibility"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-[#1a56db] hover:text-white transition duration-300"
            >
              <FaCheckCircle size={16} />
              Eligibility
            </Link>
          </li>


          {/* Profile */}
          <li>
            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-[#1a56db] hover:text-white transition duration-300"
            >
              <FaUserCircle size={16} />
              Profile
            </Link>
          </li>


          {/* Settings */}
          <li>
            <Link
              to="/settings"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-[#1a56db] hover:text-white transition duration-300"
            >
              <FaCog size={16} />
              Settings
            </Link>
          </li>

        </ul>

      </nav>


      {/* ================= USER + LOGOUT ================= */}
      <div className="mt-auto px-4 pb-3">

        {/* User Info */}
        <div className="border-t border-blue-900/40 pt-4 mb-3">

          <p className="text-xs text-gray-500">
            Logged in as
          </p>

          <p className="text-sm text-cyan-400 truncate">
            {localStorage.getItem("userEmail") || "Citizen"}
          </p>

        </div>


        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-medium transition duration-300"
        >
          <FaSignOutAlt />
          Logout
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;