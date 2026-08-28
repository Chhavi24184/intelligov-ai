import {
  FaRobot,
  FaGithub,
  FaLinkedin,
  FaShieldAlt,
  FaHeart,
} from "react-icons/fa";

import { Link } from "react-router-dom";


function Footer() {
  return (
    <footer className="bg-gradient-to-br from-white via-sky-50 to-blue-100 border-t border-sky-200/70 text-slate-700">

      {/* Glow Effects */}
      <div className="relative overflow-hidden">

        <div className="absolute -top-20 left-1/4 w-72 h-72 bg-sky-400/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>


        <div className="relative max-w-7xl mx-auto px-6 py-12">

          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">


            {/* =========================
                BRAND COLUMN
            ========================= */}

            <div className="lg:col-span-2 space-y-4">

              <Link
                to="/"
                className="flex items-center gap-3 group"
              >

                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform duration-300">

                  <FaRobot className="text-lg" />

                </div>


                <div className="text-xl font-black">

                  <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    IntelliGov
                  </span>{" "}

                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                    AI
                  </span>

                </div>

              </Link>


              <p className="text-sm text-slate-600 leading-relaxed max-w-sm">

                Empowering citizens across India with real-time AI guidance to discover, check eligibility for, and access government welfare schemes, scholarships, and career opportunities effortlessly.

              </p>


              {/* Social Links */}

              <div className="flex items-center gap-4 text-slate-500 pt-2">

                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/75 border border-sky-200 hover:text-blue-600 hover:border-sky-400 hover:shadow-md hover:shadow-sky-500/10 transition-all"
                >
                  <FaGithub className="text-lg" />
                </a>


                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/75 border border-sky-200 hover:text-blue-600 hover:border-sky-400 hover:shadow-md hover:shadow-sky-500/10 transition-all"
                >
                  <FaLinkedin className="text-lg" />
                </a>

              </div>

            </div>


            {/* =========================
                QUICK LINKS
            ========================= */}

            <div>

              <h3 className="text-slate-800 font-semibold text-sm tracking-wider uppercase mb-4">

                Quick Links

              </h3>


              <ul className="space-y-2.5 text-sm">

                <li>
                  <Link
                    to="/chat"
                    className="text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    AI Chat
                  </Link>
                </li>


                <li>
                  <Link
                    to="/schemes"
                    className="text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    Welfare Schemes
                  </Link>
                </li>


                <li>
                  <Link
                    to="/eligibility"
                    className="text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    Eligibility Checker
                  </Link>
                </li>


                <li>
                  <Link
                    to="/dashboard"
                    className="text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    Citizen Dashboard
                  </Link>
                </li>

              </ul>

            </div>


            {/* =========================
                SCHEME CATEGORIES
            ========================= */}

            <div>

              <h3 className="text-slate-800 font-semibold text-sm tracking-wider uppercase mb-4">

                Categories

              </h3>


              <ul className="space-y-2.5 text-sm">

                <li>
                  <Link
                    to="/schemes"
                    className="text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    Agriculture & Farmers
                  </Link>
                </li>


                <li>
                  <Link
                    to="/schemes"
                    className="text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    Education & Scholarships
                  </Link>
                </li>


                <li>
                  <Link
                    to="/schemes"
                    className="text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    Healthcare & Wellness
                  </Link>
                </li>


                <li>
                  <Link
                    to="/schemes"
                    className="text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    Women & Child Welfare
                  </Link>
                </li>


                <li>
                  <Link
                    to="/schemes"
                    className="text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    Employment & Startups
                  </Link>
                </li>

              </ul>

            </div>


            {/* =========================
                PLATFORM TRUST
            ========================= */}

            <div>

              <h3 className="text-slate-800 font-semibold text-sm tracking-wider uppercase mb-4">

                Platform Trust

              </h3>


              <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-sky-200/80 shadow-sm space-y-2">

                <div className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent font-semibold text-sm">

                  <FaShieldAlt className="text-sky-500" />

                  Secure & Verified

                </div>


                <p className="text-xs text-slate-500">

                  Official government portal data aggregated with privacy-first AI processing.

                </p>

              </div>

            </div>

          </div>


          {/* =========================
              BOTTOM COPYRIGHT
          ========================= */}

          <div className="border-t border-sky-200/70 mt-10 pt-8 flex flex-col items-center justify-center text-xs gap-3 text-center">

            <p className="font-semibold bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">

              © {new Date().getFullYear()} IntelliGov AI Platform. Built for IBM Hackathon.

            </p>


            <p className="flex items-center justify-center gap-1 text-slate-500">

              Designed with

              <FaHeart className="text-red-500 text-xs inline" />

              for Citizens of India

            </p>

          </div>

        </div>

      </div>

    </footer>
  );
}


export default Footer;