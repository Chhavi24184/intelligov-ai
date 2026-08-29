import hero from "../../assets/hero.png";
import { FaRobot, FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";

function AIAssistantCard() {
  return (
    <section
      className="
        relative
        mt-4
        overflow-hidden
        rounded-3xl
        bg-white/80
        backdrop-blur-xl
        border
        border-cyan-200
        px-6
        py-5
        shadow-[0_10px_40px_rgba(37,99,235,0.08)]
      "
    >

      {/* =====================================================
          BACKGROUND GRADIENT GLOWS
      ===================================================== */}

      <div
        className="
          absolute
          -right-20
          top-1/2
          -translate-y-1/2
          w-80
          h-80
          bg-cyan-400/15
          blur-[120px]
          rounded-full
          pointer-events-none
        "
      />

      <div
        className="
          absolute
          -left-20
          -bottom-24
          w-64
          h-64
          bg-blue-400/10
          blur-[100px]
          rounded-full
          pointer-events-none
        "
      />


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="relative z-10 flex items-center justify-between gap-6">


        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <div className="max-w-xl">

          {/* Label */}

          <p
            className="
              text-sm
              font-bold
              tracking-widest
              uppercase
              bg-gradient-to-r
              from-cyan-500
              via-blue-600
              to-indigo-600
              bg-clip-text
              text-transparent
            "
          >
            AI Assistant
          </p>


          {/* Heading */}

          <div
            className="
              mt-2
              text-2xl
              sm:text-3xl
              font-bold
              bg-gradient-to-r
              from-slate-800
              via-blue-700
              to-cyan-600
              bg-clip-text
              text-transparent
            "
          >
            Your AI Government Guide
          </div>


          {/* Description */}

          <p
            className="
              mt-2
              text-slate-500
              leading-6
              text-sm
              sm:text-base
            "
          >
            Get instant recommendations for government schemes,
            scholarships, jobs, internships and eligibility checks
            using our intelligent AI assistant.
          </p>


          {/* =================================================
              START AI CHAT BUTTON
          ================================================= */}

          <Link
            to="/chat"
            className="
              mt-5
              inline-flex
              items-center
              gap-3
              px-6
              py-3
              rounded-xl
              bg-gradient-to-r
              from-cyan-500
              via-blue-600
              to-indigo-600
              text-white
              font-semibold
              shadow-lg
              shadow-blue-500/20
              hover:scale-105
              hover:shadow-cyan-500/30
              transition-all
              duration-300
            "
          >

            <FaRobot />

            Start AI Chat

            <FaArrowRight className="text-sm" />

          </Link>

        </div>


        {/* =================================================
            RIGHT SIDE — AI IMAGE
        ================================================= */}

        <div className="hidden lg:flex justify-center items-center relative">

          {/* Image Glow */}

          <div
            className="
              absolute
              w-40
              h-40
              bg-cyan-400/20
              blur-3xl
              rounded-full
            "
          />


          <img
            src={hero}
            alt="AI Assistant"
            className="
              relative
              w-36
              float
              drop-shadow-[0_0_30px_rgba(6,182,212,0.35)]
              transition-transform
              duration-500
              hover:scale-105
            "
          />

        </div>

      </div>

    </section>
  );
}

export default AIAssistantCard;