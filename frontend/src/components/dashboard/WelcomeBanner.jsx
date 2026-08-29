import hero from "../../assets/hero.png";
import { FaRobot, FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";

function WelcomeBanner() {
  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-3xl
        bg-gradient-to-br
        from-white
        via-blue-50
        to-cyan-50
        border
        border-blue-100
        p-6
        sm:p-8
        shadow-[0_10px_40px_rgba(37,99,235,0.10)]
      "
    >

      {/* =====================================================
          BACKGROUND GLOWS
      ===================================================== */}

      <div
        className="
          absolute
          -top-24
          -right-20
          w-80
          h-80
          bg-blue-400/15
          blur-[110px]
          rounded-full
          pointer-events-none
        "
      />

      <div
        className="
          absolute
          bottom-0
          left-0
          w-64
          h-64
          bg-cyan-400/15
          blur-[90px]
          rounded-full
          pointer-events-none
        "
      />

      {/* Subtle decorative gradient */}

      <div
        className="
          absolute
          top-0
          right-0
          w-1/2
          h-full
          bg-gradient-to-l
          from-blue-100/30
          to-transparent
          pointer-events-none
        "
      />


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="relative z-10 flex items-center justify-between gap-8">


        {/* =================================================
            LEFT CONTENT
        ================================================= */}

        <div className="max-w-2xl">

          {/* Small Label */}

          <p
            className="
              text-cyan-600
              font-bold
              text-sm
              tracking-widest
              uppercase
            "
          >
            Welcome Back 👋
          </p>


          {/* Main Heading */}

          <h1
            className="
              mt-3
              text-3xl
              sm:text-4xl
              lg:text-5xl
              font-extrabold
              leading-tight
            "
          >

            <span className="text-slate-800">
              AI Powered
            </span>

            <br />

            <span
              className="
                bg-gradient-to-r
                from-cyan-500
                via-blue-600
                to-indigo-600
                bg-clip-text
                text-transparent
              "
            >
              Government Assistant
            </span>

          </h1>


          {/* Description */}

          <p
            className="
              mt-5
              text-slate-500
              text-sm
              sm:text-base
              lg:text-lg
              leading-7
              max-w-xl
            "
          >
            Discover government schemes, scholarships,
            jobs, internships and eligibility instantly
            with the power of AI.
          </p>


          {/* =================================================
              START AI CHAT
          ================================================= */}

          <Link
            to="/chat"
            className="
              mt-6
              inline-flex
              items-center
              gap-3
              bg-gradient-to-r
              from-cyan-500
              via-blue-600
              to-indigo-600
              hover:from-cyan-600
              hover:via-blue-700
              hover:to-indigo-700
              px-6
              sm:px-7
              py-3
              rounded-xl
              text-white
              font-semibold
              shadow-lg
              shadow-blue-500/20
              transition-all
              duration-300
              hover:scale-105
              hover:shadow-cyan-500/30
            "
          >

            <FaRobot />

            Start AI Chat

            <FaArrowRight className="text-sm" />

          </Link>

        </div>


        {/* =================================================
            RIGHT IMAGE
        ================================================= */}

        <div className="hidden lg:flex items-center justify-center relative">

          {/* Image Glow */}

          <div
            className="
              absolute
              w-64
              h-64
              bg-cyan-400/20
              blur-3xl
              rounded-full
            "
          />

          <img
            src={hero}
            alt="AI Robot"
            className="
              relative
              w-[280px]
              xl:w-[320px]
              float
              drop-shadow-[0_0_35px_rgba(37,99,235,0.35)]
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

export default WelcomeBanner;