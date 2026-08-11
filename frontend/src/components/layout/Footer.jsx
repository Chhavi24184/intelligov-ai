import {
  FaRobot,
  FaGithub,
  FaTwitter,
  FaLinkedin,
  FaShieldAlt,
  FaHeart,
} from "react-icons/fa";

import { Link } from "react-router-dom";


function Footer() {
  return (
    <footer className="bg-[#08111f] border-t border-blue-900/40 text-slate-300">

      {/* Glow Effects */}
      <div className="relative overflow-hidden">

        <div className="absolute -top-20 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>


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

                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">

                  <FaRobot className="text-lg" />

                </div>


                <div className="text-xl font-black">

                  <span className="bg-gradient-to-r from-sky-400 via-white to-cyan-300 bg-clip-text text-transparent">
                    IntelliGov
                  </span>{" "}

                  <span className="text-amber-400">
                    AI
                  </span>

                </div>

              </Link>


              <p className="text-sm text-slate-400 leading-relaxed max-w-sm">

                Empowering citizens across India with real-time AI guidance to discover, check eligibility for, and access government welfare schemes, scholarships, and career opportunities effortlessly.

              </p>


              {/* Social Links */}

              <div className="flex items-center gap-4 text-slate-400 pt-2">

                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-[#0b1528] border border-blue-900/40 hover:text-cyan-400 hover:border-cyan-400/50 transition-all"
                >
                  <FaGithub className="text-lg" />
                </a>


                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-[#0b1528] border border-blue-900/40 hover:text-cyan-400 hover:border-cyan-400/50 transition-all"
                >
                  <FaTwitter className="text-lg" />
                </a>


                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-[#0b1528] border border-blue-900/40 hover:text-cyan-400 hover:border-cyan-400/50 transition-all"
                >
                  <FaLinkedin className="text-lg" />
                </a>

              </div>

            </div>


            {/* =========================
                QUICK LINKS
            ========================= */}

            <div>

              <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
                Quick Links
              </h3>


              <ul className="space-y-2.5 text-sm">

                <li>
                  <Link
                    to="/chat"
                    className="hover:text-cyan-300 transition-colors"
                  >
                    AI Chat
                  </Link>
                </li>


                <li>
                  <Link
                    to="/schemes"
                    className="hover:text-cyan-300 transition-colors"
                  >
                    Welfare Schemes
                  </Link>
                </li>


                <li>
                  <Link
                    to="/eligibility"
                    className="hover:text-cyan-300 transition-colors"
                  >
                    Eligibility Checker
                  </Link>
                </li>


                <li>
                  <Link
                    to="/dashboard"
                    className="hover:text-cyan-300 transition-colors"
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

              <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
                Categories
              </h3>


              <ul className="space-y-2.5 text-sm">

                <li>
                  <Link
                    to="/schemes"
                    className="hover:text-cyan-300 transition-colors"
                  >
                    Agriculture & Farmers
                  </Link>
                </li>


                <li>
                  <Link
                    to="/schemes"
                    className="hover:text-cyan-300 transition-colors"
                  >
                    Education & Scholarships
                  </Link>
                </li>


                <li>
                  <Link
                    to="/schemes"
                    className="hover:text-cyan-300 transition-colors"
                  >
                    Healthcare & Wellness
                  </Link>
                </li>


                <li>
                  <Link
                    to="/schemes"
                    className="hover:text-cyan-300 transition-colors"
                  >
                    Women & Child Welfare
                  </Link>
                </li>


                <li>
                  <Link
                    to="/schemes"
                    className="hover:text-cyan-300 transition-colors"
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

              <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
                Platform Trust
              </h3>


              <div className="p-4 rounded-2xl bg-[#081224] border border-blue-900/40 space-y-2">

                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">

                  <FaShieldAlt />

                  Secure & Verified

                </div>


                <p className="text-xs text-slate-400">

                  Official government portal data aggregated with privacy-first AI processing.

                </p>

              </div>

            </div>

          </div>


          {/* =========================
              BOTTOM COPYRIGHT
          ========================= */}

          <div className="border-t border-blue-900/30 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">

            <p>
              © {new Date().getFullYear()} IntelliGov AI Platform. Built for IBM Hackathon.
            </p>


            <p className="flex items-center gap-1">

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