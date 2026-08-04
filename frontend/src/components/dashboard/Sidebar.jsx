import {
  FaHome,
  FaRobot,
  FaClipboardList,
  FaCheckCircle,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

function Sidebar() {
  return (
    <aside className="w-50 h-full bg-[#08111f] border-r border-blue-900/40 flex flex-col ">

      {/* Logo */}
      
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

        {/* Menu */}

        <nav className="mt-2 px-0">

          <ul className="w-full space-y-1">

            <li className="flex  gap-2 px-3 py-2 rounded-lg text-white hover:bg-[#1a56db] transition duration-300 cursor-pointer">
              <FaHome size={16} />
              Dashboard
            </li>

            <li className="flex  gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-[#1a56db] hover:text-white transition duration-300 cursor-pointer">
              <FaRobot size={16} />
              AI Chat
            </li>

            <li className="flex  gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-[#1a56db] hover:text-white transition duration-300 cursor-pointer">
              <FaClipboardList size={16} />
              Schemes
            </li>

            <li className="flex  gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-[#1a56db] hover:text-white transition duration-300 cursor-pointer">
              <FaCheckCircle size={16} />
              Eligibility
            </li>

            <li className="flex  gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-[#1a56db] hover:text-white transition duration-300 cursor-pointer">
              <FaUserCircle size={16} />
              Profile
            </li>

            <li className="flex  gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-[#1a56db] hover:text-white transition duration-300 cursor-pointer">
              <FaCog size={16} />
              Settings
            </li>

          </ul>

        </nav>

      {/* Logout */}

      <div className="mt-auto p-4">

        <button className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-1.5 rounded-xl font-medium transition">

          <FaSignOutAlt />

          Logout

        </button>

      </div>

    </aside>
  );
}

export default Sidebar;