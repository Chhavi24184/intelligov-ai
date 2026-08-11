import { useState } from "react";

import {
  FaBars,
  FaTimes,
  FaRobot,
  FaUserCircle,
} from "react-icons/fa";

import {
  Link,
  useLocation,
} from "react-router-dom";


function Navbar() {

  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  const navLinks = [
    { name: "Home", path: "/" },
    { name: "AI Chat", path: "/chat" },
    { name: "Schemes", path: "/schemes" },
    { name: "Eligibility", path: "/eligibility" },
    { name: "Dashboard", path: "/dashboard" },
  ];


  const isActive = (path) => location.pathname === path;


  return (

    <header className="relative z-50 w-full bg-[#0a1628] border-b border-blue-900/40">

      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">


        {/* =========================
            BRAND LOGO
        ========================= */}

        <Link
          to="/"
          className="flex items-center gap-3 group"
        >

          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">

            <FaRobot className="text-xl" />

          </div>


          <div className="flex flex-col">

            <span className="text-2xl font-black tracking-tight">

              <span className="bg-gradient-to-r from-sky-400 via-white to-cyan-300 bg-clip-text text-transparent">

                IntelliGov

              </span>{" "}

              <span className="text-amber-400 font-extrabold">

                AI

              </span>

            </span>


            <span className="text-[10px] uppercase tracking-widest text-cyan-400/80 font-semibold -mt-1">

              Smart Gov Assistant

            </span>

          </div>

        </Link>


        {/* =========================
            DESKTOP NAVIGATION
        ========================= */}

        <nav className="hidden md:flex items-center gap-1 bg-[#0b1528]/60 p-1.5 rounded-full border border-blue-900/40">

          {navLinks.map((link) => (

            <Link
              key={link.path}
              to={link.path}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                isActive(link.path)
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 font-semibold"
                  : "text-slate-300 hover:text-white hover:bg-blue-900/20"
              }`}
            >

              {link.name}

            </Link>

          ))}

        </nav>


        {/* =========================
            ACTION BUTTON + PROFILE
        ========================= */}

        <div className="hidden md:flex items-center gap-4">

          <Link
            to="/chat"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >

            <FaRobot className="text-sm animate-pulse" />

            <span>Ask AI</span>

          </Link>


          <Link
            to="/dashboard"
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Dashboard"
          >

            <FaUserCircle className="text-2xl" />

          </Link>

        </div>


        {/* =========================
            MOBILE MENU BUTTON
        ========================= */}

        <div className="md:hidden flex items-center">

          <button
            onClick={() =>
              setMobileMenuOpen(!mobileMenuOpen)
            }
            className="p-2.5 rounded-xl bg-[#0b1528] text-slate-300 hover:text-white border border-blue-900/50 focus:outline-none"
          >

            {mobileMenuOpen ? (
              <FaTimes className="text-xl" />
            ) : (
              <FaBars className="text-xl" />
            )}

          </button>

        </div>

      </div>


      {/* =========================
          MOBILE NAVIGATION
      ========================= */}

      {mobileMenuOpen && (

        <div className="md:hidden bg-[#0a1424] border-b border-blue-900/40 px-4 pt-3 pb-6 space-y-2">

          {navLinks.map((link) => (

            <Link
              key={link.path}
              to={link.path}
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${
                isActive(link.path)
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-slate-300 hover:bg-blue-900/30 hover:text-white"
              }`}
            >

              {link.name}

            </Link>

          ))}


          <div className="pt-2">

            <Link
              to="/chat"
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-center font-semibold flex items-center justify-center gap-2 shadow-lg"
            >

              <FaRobot />

              Ask AI Assistant

            </Link>

          </div>

        </div>

      )}

    </header>

  );

}


export default Navbar;