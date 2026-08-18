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

function Hero() {
  const quickPrompts = [
    "PM Kisan Samman Nidhi",
    "Scholarships for Higher Studies",
    "Women Entrepreneur Schemes",
    "Free Healthcare Benefits",
  ];

  return (
    <section
      className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#0a1628] text-white"
      style={{
        backgroundImage: "url('/src/assets/hero.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >

      {/* =====================================================
          BACKGROUND DARK GLASS LAYER
      ===================================================== */}

      <div className="absolute inset-0 bg-[#06101f]/65 pointer-events-none" />

      {/* =====================================================
              SOFT BLEND INTO NEXT SECTION
          ===================================================== */}

          <div
            className="
              absolute
              bottom-0
              left-0
              right-0
              h-48
              bg-gradient-to-b
              from-transparent
              via-[#0a1628]/70
              to-[#0a1628]
              pointer-events-none
              z-[1]
            "
          />

      {/* Soft blue/cyan atmosphere */}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />

        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl" />

        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />

      </div>


      {/* =====================================================
          MAIN CONTAINER
      ===================================================== */}

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-16">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">


          {/* =====================================================
              LEFT HERO CONTENT
          ===================================================== */}

          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">


            {/* AI BADGE */}

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-950/50 border border-cyan-500/30 backdrop-blur-md shadow-lg shadow-cyan-500/10">

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

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">

              Get personalized guidance on government schemes, scholarships,
              healthcare benefits and career opportunities with our
              AI-powered citizen assistant.

            </p>


            {/* BUTTONS */}

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">

              {/* GET STARTED */}

              <Link
                to="/login"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300 flex items-center gap-3 text-base"
              >

                <span>Get Started</span>

                <FaArrowRight className="text-sm" />

              </Link>


              {/* ELIGIBILITY */}

              <Link
                to="/eligibility"
                className="px-8 py-4 rounded-xl bg-[#0d1b32]/85 backdrop-blur-md border border-blue-800/60 text-slate-200 font-semibold hover:border-cyan-400 hover:text-white hover:bg-blue-900/40 transition-all duration-300 flex items-center gap-2 text-base"
              >

                <FaUserCheck className="text-cyan-400" />

                <span>Check Eligibility</span>

              </Link>

            </div>


            {/* POPULAR QUERIES */}

            <div className="space-y-3 pt-2">

              <div className="text-xs font-semibold text-slate-300">

                🔥 Popular Citizen Queries:

              </div>


              <div className="flex flex-wrap justify-center lg:justify-start gap-2">

                {quickPrompts.map((prompt, i) => (

                  <Link
                    key={i}
                    to="/chat"
                    className="px-3.5 py-1.5 rounded-lg bg-[#0c182d]/80 backdrop-blur-md border border-blue-900/40 text-xs text-slate-300 hover:border-cyan-400/60 hover:text-cyan-300 hover:bg-blue-900/40 transition-all flex items-center gap-1.5"
                  >

                    <FaSearch className="text-[10px] text-cyan-400" />

                    <span>{prompt}</span>

                  </Link>

                ))}

              </div>

            </div>

          </div>


          {/* =====================================================
              RIGHT SIDE — FLOATING INFORMATION UI
          ===================================================== */}

          <div className="lg:col-span-5 flex justify-center lg:justify-end">

            <div className="relative w-[400px] max-w-full h-[390px]">


              {/* =================================================
                  CENTRAL AI ORB
                  Makes the cards feel anchored instead of floating
              ================================================= */}

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">

                {/* Outer glow */}

                <div className="absolute -inset-16 rounded-full bg-cyan-400/10 blur-3xl" />

                {/* Orb */}

                <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-cyan-400/20 via-blue-600/20 to-indigo-700/20 border border-cyan-400/20 backdrop-blur-sm flex items-center justify-center shadow-2xl shadow-cyan-500/20">

                  <div className="w-28 h-28 rounded-full bg-[#081629]/80 border border-cyan-400/20 flex items-center justify-center">

                    <FaRobot className="text-6xl text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.7)]" />

                  </div>

                </div>

              </div>


              {/* =================================================
                  CONNECTING GLOW LINES
              ================================================= */}

              <div className="absolute left-[18%] top-[35%] w-[110px] h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-cyan-400/10 rotate-[18deg]" />

              <div className="absolute right-[18%] top-[42%] w-[100px] h-px bg-gradient-to-l from-transparent via-cyan-400/40 to-cyan-400/10 rotate-[-18deg]" />


              {/* =================================================
                  VERIFIED SCHEMES CARD
              ================================================= */}

              <div className="absolute z-20 top-5 left-0 sm:left-[-10px] animate-float">

                <div className="bg-[#081629]/90 backdrop-blur-xl px-4 py-3 rounded-2xl border border-cyan-400/30 shadow-2xl shadow-cyan-500/10 flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/20 flex items-center justify-center">

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

              </div>


              {/* =================================================
                  ACCURACY CARD
              ================================================= */}

              <div className="absolute z-20 top-20 right-0 sm:right-[-10px] animate-float">

                <div className="bg-[#081629]/90 backdrop-blur-xl px-4 py-3 rounded-2xl border border-amber-400/30 shadow-2xl shadow-amber-500/10 flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/20 flex items-center justify-center">

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
                  AI STATUS CARD
              ================================================= */}

              <div className="absolute bottom-10 left-1/2 -translate-x-1/2">

                <div className="px-5 py-3 rounded-2xl bg-[#081629]/90 backdrop-blur-xl border border-blue-800/40 shadow-2xl">

                  <div className="flex items-center justify-center gap-2 text-cyan-400 font-bold text-sm">

                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

                    <FaStar />

                    <span>IntelliGov AI Agent v2.0</span>

                  </div>

                  <p className="text-[10px] text-slate-400 mt-1 text-center">

                    AI-powered citizen assistance

                  </p>

                </div>

              </div>


            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Hero;