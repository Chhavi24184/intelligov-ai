import { Link } from "react-router-dom";

import {
  FaRobot,
  FaArrowRight,
  FaSearch,
  FaCheckCircle,
  FaUserCheck,
  FaAward,
  FaStar,
} from "react-icons/fa";

import robot from "../../assets/robot.png";


function Hero() {
  const quickPrompts = [
    "PM Kisan Samman Nidhi",
    "Scholarships for Higher Studies",
    "Women Entrepreneur Schemes",
    "Free Healthcare Benefits",
  ];

  return (
    <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#0a1628] text-white">

      {/* =========================
          BACKGROUND LIGHTS
      ========================= */}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />

        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl" />

        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />

      </div>


      {/* =========================
          MAIN CONTAINER
      ========================= */}

      <div className="relative max-w-7xl mx-auto px-6 py-12 lg:py-16">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">


          {/* =====================================================
              LEFT HERO CONTENT
          ===================================================== */}

          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">

            {/* AI BADGE */}

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/30 border border-cyan-500/30 backdrop-blur-md shadow-lg shadow-cyan-500/10">

              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />

              <FaRobot className="text-cyan-400 text-sm" />

              <span className="text-xs sm:text-sm font-semibold tracking-wide bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                Next-Gen AI Government Platform
              </span>

            </div>


            {/* MAIN HEADLINE */}

            <div className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">

              Discover Your <br />

              <span className="bg-gradient-to-r from-sky-300 via-white to-cyan-400 bg-clip-text text-transparent">
                Government Benefits
              </span>

              <span> In Seconds</span>

            </div>


            {/* DESCRIPTION */}

            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">

              Get personalized guidance on government schemes, scholarships,
              healthcare benefits and career opportunities with our
              AI-powered citizen assistant.

            </p>


            {/* BUTTONS */}

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">

              <Link
                to="/chat"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300 flex items-center gap-3 text-base"
              >

                <span>Talk to AI Assistant</span>

                <FaArrowRight className="text-sm" />

              </Link>


              <Link
                to="/eligibility"
                className="px-8 py-4 rounded-xl bg-[#0d1b32] border border-blue-800/60 text-slate-200 font-semibold hover:border-cyan-400 hover:text-white hover:bg-blue-900/30 transition-all duration-300 flex items-center gap-2 text-base"
              >

                <FaUserCheck className="text-cyan-400" />

                <span>Check Eligibility</span>

              </Link>

            </div>


            {/* POPULAR QUERIES */}

            <div className="space-y-3 pt-2">

              <div className="text-xs font-semibold text-slate-400">
                🔥 Popular Citizen Queries:
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-2">

                {quickPrompts.map((prompt, i) => (

                  <Link
                    key={i}
                    to="/chat"
                    className="px-3.5 py-1.5 rounded-lg bg-[#0c182d] border border-blue-900/40 text-xs text-slate-300 hover:border-cyan-400/60 hover:text-cyan-300 hover:bg-blue-900/30 transition-all flex items-center gap-1.5"
                  >

                    <FaSearch className="text-[10px] text-cyan-400" />

                    <span>{prompt}</span>

                  </Link>

                ))}

              </div>

            </div>

          </div>


          {/* =====================================================
              RIGHT ROBOT SECTION
          ===================================================== */}

          <div className="lg:col-span-5 flex justify-center">

            {/* This container controls ONLY the robot + badges */}

            <div className="relative w-[380px] max-w-full">


              {/* Robot Glow */}

              <div className="absolute inset-10 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />


              {/* =================================================
                  ROBOT + FLOATING BADGES AREA
              ================================================= */}

              <div className="relative h-[330px] flex items-center justify-center">


                {/* ROBOT */}

                <img
                  src={robot}
                  alt="IntelliGov AI Assistant"
                  className="relative z-10 w-48 sm:w-56 lg:w-60 animate-float drop-shadow-[0_0_35px_rgba(34,211,238,0.5)]"
                />


                {/* =================================================
                    VERIFIED SCHEMES BADGE
                ================================================= */}

                <div className="absolute z-20 top-5 left-0 sm:left-[-15px] bg-[#0c182d]/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-cyan-400/30 shadow-xl flex items-center gap-2.5">

                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center">

                    <FaCheckCircle className="text-lg text-cyan-400" />

                  </div>

                  <div>

                    <div className="text-[11px] text-slate-400">
                      Verified Schemes
                    </div>

                    <div className="text-sm font-bold text-white">
                      500+ Active
                    </div>

                  </div>

                </div>


                {/* =================================================
                    ACCURACY BADGE
                ================================================= */}

                <div className="absolute z-20 top-16 right-[-5px] sm:right-[-20px] bg-[#0c182d]/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-amber-400/40 shadow-xl flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">

                    <FaAward className="text-xl text-amber-400" />

                  </div>

                  <div>

                    <div className="text-xs text-slate-400">
                      Accuracy Rate
                    </div>

                    <div className="text-base font-bold text-white">
                      99.4% Match
                    </div>

                  </div>

                </div>

              </div>


              {/* =================================================
                  AI AGENT INFORMATION
                  NOW COMPLETELY SEPARATE FROM BADGES
              ================================================= */}

              <div className="relative z-10 mt-2 pt-5 border-t border-blue-900/40 text-center">

                <div className="flex items-center justify-center gap-2 text-cyan-400 font-bold text-lg">

                  <FaStar />

                  <span>IntelliGov AI Agent v2.0</span>

                </div>


                <p className="text-xs text-slate-400 mt-2 px-4">

                  Powered by advanced NLP & Instant Scheme Matching Engine

                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}


export default Hero;