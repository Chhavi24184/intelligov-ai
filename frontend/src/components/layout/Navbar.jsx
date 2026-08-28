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
  useNavigate,
} from "react-router-dom";


function Navbar() {

  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "#services" },
    { name: "Schemes", path: "/schemes" },
    { name: "About", path: "#about" },
    { name: "Dashboard", path: "/dashboard" },
  ];


  const isActive = (path) => {

    if (path.startsWith("#")) {
      return false;
    }

    return location.pathname === path;

  };


  // =========================================
  // SCROLL TO SERVICES / ABOUT
  // =========================================

  const handleSectionClick = (sectionId) => {

    setMobileMenuOpen(false);


    // Already on Home page
    if (location.pathname === "/") {

      const section = document.getElementById(sectionId);

      if (section) {

        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

      }

      return;
    }


    // If we are on another page:
    // Go directly to Home first
    navigate("/");


    // Wait for Home page to render,
    // then scroll directly to the section
    setTimeout(() => {

      const section = document.getElementById(sectionId);

      if (section) {

        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

      }

    }, 150);

  };


  // =========================================
  // HOME BUTTON
  // =========================================

  const handleHomeClick = () => {

    setMobileMenuOpen(false);


    if (location.pathname === "/") {

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } else {

      navigate("/");

    }

  };


  // =========================================
  // NAVIGATION CLICK
  // =========================================

  const handleNavClick = (link) => {

    if (link.path === "#services") {

      handleSectionClick("services");

      return;

    }


    if (link.path === "#about") {

      handleSectionClick("about");

      return;

    }


    setMobileMenuOpen(false);

  };


  return (

    <header className="relative z-50 w-full bg-white border-b border-sky-200">

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

              <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 bg-clip-text text-transparent">

                IntelliGov

              </span>{" "}

              <span className="text-amber-500 font-extrabold">

                AI

              </span>

            </span>


            <span className="text-[10px] uppercase tracking-widest text-cyan-600 font-semibold -mt-1">

              Smart Gov Assistant

            </span>

          </div>

        </Link>


        {/* =========================
            DESKTOP NAVIGATION
        ========================= */}

        <nav className="hidden md:flex items-center gap-1 bg-sky-50/80 p-1.5 rounded-full border border-sky-200">

          {navLinks.map((link) => (

            link.path === "#services" || link.path === "#about" ? (

              <button
                key={link.path}
                onClick={() => handleNavClick(link)}
                className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 text-slate-600 hover:text-blue-700 hover:bg-sky-100"
              >

                {link.name}

              </button>

            ) : (

              <Link
                key={link.path}
                to={link.path}
                onClick={() => {

                  if (link.path === "/") {
                    handleHomeClick();
                  }

                  setMobileMenuOpen(false);

                }}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive(link.path)
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 font-semibold"
                    : "text-slate-600 hover:text-blue-700 hover:bg-sky-100"
                }`}
              >

                {link.name}

              </Link>

            )

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
            className="p-2 text-slate-500 hover:text-blue-600 transition-colors"
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
            className="p-2.5 rounded-xl bg-sky-50 text-slate-600 hover:text-blue-700 border border-sky-200 focus:outline-none"
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

        <div className="md:hidden bg-white border-b border-sky-200 px-4 pt-3 pb-6 space-y-2">

          {navLinks.map((link) => (

            link.path === "#services" || link.path === "#about" ? (

              <button
                key={link.path}
                onClick={() => handleNavClick(link)}
                className="block w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all text-slate-600 hover:bg-sky-100 hover:text-blue-700"
              >

                {link.name}

              </button>

            ) : (

              <Link
                key={link.path}
                to={link.path}
                onClick={() => {

                  setMobileMenuOpen(false);

                  if (link.path === "/") {
                    handleHomeClick();
                  }

                }}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${
                  isActive(link.path)
                    ? "bg-blue-600 text-white font-semibold"
                    : "text-slate-600 hover:bg-sky-100 hover:text-blue-700"
                }`}
              >

                {link.name}

              </Link>

            )

          ))}


          {/* =========================
              MOBILE ASK AI
          ========================= */}

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