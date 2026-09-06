import Sidebar from "../components/dashboard/Sidebar";
import WelcomeSection from "../components/dashboard/WelcomeSection";
import StatsCards from "../components/dashboard/StatsCards";
import AIAssistantCard from "../components/dashboard/AIAssistantCard";

import { Link, useNavigate } from "react-router-dom";

import {
  FaListAlt,
  FaUserCheck,
  FaArrowRight,
  FaArrowLeft,
  FaRobot,
} from "react-icons/fa";


function Dashboard() {

  const navigate = useNavigate();


  const quickActions = [
    {
      title: "Explore Schemes",
      desc: "View government welfare initiatives and scholarships.",
      link: "/schemes",
      icon: <FaListAlt className="text-cyan-500 text-xl" />,
    },

    {
      title: "Check Eligibility",
      desc: "Check your eligibility for available government schemes.",
      link: "/eligibility",
      icon: <FaUserCheck className="text-emerald-500 text-xl" />,
    },
  ];


  return (

    <div className="min-h-screen bg-[#f5f9ff] text-slate-800">


      {/* =====================================================
          RESPONSIVE SIDEBAR
      ===================================================== */}

      <Sidebar />


      {/* =====================================================
          MAIN DASHBOARD
      ===================================================== */}

      <main
        className="
          ml-0
          md:ml-50
          min-h-screen
          pt-16
          md:pt-0
        "
      >

        <div className="min-h-screen overflow-y-auto">

          {/* =================================================
              LIGHT BACKGROUND
          ================================================= */}

          <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f8fbff] via-[#eef7ff] to-[#f5f9ff]">


            {/* Soft Blue Glow */}

            <div
              className="
                absolute
                top-0
                left-1/4
                w-[450px]
                h-[450px]
                bg-blue-400/15
                blur-[150px]
                rounded-full
                pointer-events-none
              "
            />


            {/* Soft Cyan Glow */}

            <div
              className="
                absolute
                top-1/2
                right-0
                w-[400px]
                h-[400px]
                bg-cyan-400/15
                blur-[140px]
                rounded-full
                pointer-events-none
              "
            />


            {/* Bottom Glow */}

            <div
              className="
                absolute
                bottom-0
                left-1/3
                w-[350px]
                h-[350px]
                bg-indigo-400/10
                blur-[130px]
                rounded-full
                pointer-events-none
              "
            />


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div
              className="
                relative
                p-4
                sm:p-6
                lg:p-8
              "
            >


              {/* =================================================
                  TOP BAR
              ================================================= */}

              <div
                className="
                  flex
                  items-center
                  mb-6
                "
              >

                {/* Back Button */}

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="
                    inline-flex
                    items-center
                    gap-2
                    px-4
                    py-2
                    rounded-xl
                    bg-white/80
                    backdrop-blur-md
                    border
                    border-blue-100
                    text-slate-600
                    text-sm
                    font-medium
                    shadow-sm
                    hover:text-blue-600
                    hover:border-blue-300
                    hover:bg-white
                    transition-all
                    duration-300
                  "
                >

                  <FaArrowLeft className="text-xs" />

                  <span>Back</span>

                </button>

              </div>



              {/* =================================================
                  DASHBOARD SECTIONS
              ================================================= */}

              <div className="space-y-8">


                {/* WELCOME */}

                <WelcomeSection />


                {/* STATISTICS */}

                <StatsCards />


                {/* AI ASSISTANT */}

                <AIAssistantCard />


                {/* =================================================
                    QUICK PORTAL ACTIONS
                ================================================= */}

                <section className="space-y-4">

                  <div>

                    <h3 className="text-lg sm:text-xl font-bold text-slate-800">
                      Quick Portal Actions
                    </h3>

                    <p className="text-xs text-slate-500 mt-1">
                      Quickly access important citizen services.
                    </p>

                  </div>


                  <div
                    className="
                      grid
                      grid-cols-1
                      md:grid-cols-2
                      gap-6
                    "
                  >

                    {quickActions.map((action, index) => (

                      <Link
                        key={index}
                        to={action.link}
                        className="
                          relative
                          overflow-hidden
                          bg-white/80
                          backdrop-blur-xl
                          p-6
                          rounded-3xl
                          border
                          border-blue-100
                          shadow-[0_10px_35px_rgba(37,99,235,0.07)]
                          flex
                          items-center
                          justify-between
                          group
                          hover:border-cyan-300
                          hover:-translate-y-1
                          hover:shadow-[0_15px_40px_rgba(6,182,212,0.12)]
                          transition-all
                          duration-300
                        "
                      >

                        {/* Card Glow */}

                        <div
                          className="
                            absolute
                            -right-16
                            -top-16
                            w-40
                            h-40
                            rounded-full
                            bg-cyan-400/10
                            blur-3xl
                            opacity-0
                            group-hover:opacity-100
                            transition-opacity
                            duration-500
                            pointer-events-none
                          "
                        />


                        {/* Left Content */}

                        <div className="relative z-10 flex items-center gap-4 min-w-0">


                          {/* Icon */}

                          <div
                            className="
                              p-3.5
                              rounded-2xl
                              bg-gradient-to-br
                              from-cyan-50
                              to-blue-50
                              border
                              border-blue-100
                              group-hover:border-cyan-300
                              group-hover:scale-105
                              transition-all
                              duration-300
                              shrink-0
                            "
                          >

                            {action.icon}

                          </div>


                          {/* Text */}

                          <div className="min-w-0">

                            <h4
                              className="
                                text-base
                                font-bold
                                text-slate-800
                                group-hover:text-blue-600
                                transition-colors
                              "
                            >
                              {action.title}
                            </h4>


                            <p
                              className="
                                text-xs
                                text-slate-500
                                mt-1
                              "
                            >
                              {action.desc}
                            </p>

                          </div>

                        </div>


                        {/* Arrow */}

                        <FaArrowRight
                          className="
                            relative
                            z-10
                            text-slate-400
                            group-hover:text-cyan-500
                            group-hover:translate-x-1
                            transition-all
                            shrink-0
                            ml-3
                          "
                        />

                      </Link>

                    ))}

                  </div>

                </section>



                {/* =================================================
                    AI CHAT SECTION
                ================================================= */}

                <section
                  className="
                    relative
                    overflow-hidden
                    bg-white/80
                    backdrop-blur-xl
                    rounded-3xl
                    border
                    border-cyan-200
                    p-5
                    sm:p-8
                    shadow-[0_10px_40px_rgba(6,182,212,0.08)]
                  "
                >

                  {/* Background Glow */}

                  <div
                    className="
                      absolute
                      -right-20
                      -top-20
                      w-64
                      h-64
                      rounded-full
                      bg-cyan-400/10
                      blur-3xl
                      pointer-events-none
                    "
                  />


                  <div
                    className="
                      relative
                      z-10
                      flex
                      flex-col
                      sm:flex-row
                      items-center
                      justify-between
                      gap-5
                    "
                  >


                    {/* Left */}

                    <div
                      className="
                        flex
                        items-center
                        gap-4
                        min-w-0
                      "
                    >

                      <div
                        className="
                          w-12
                          h-12
                          rounded-2xl
                          bg-gradient-to-br
                          from-cyan-50
                          to-blue-50
                          border
                          border-cyan-200
                          flex
                          items-center
                          justify-center
                          shrink-0
                          shadow-sm
                        "
                      >

                        <FaRobot className="text-cyan-500 text-xl" />

                      </div>


                      <div>

                        <h3 className="text-base sm:text-lg font-bold text-slate-800">

                          Need Help Finding a Scheme?

                        </h3>


                        <p
                          className="
                            text-xs
                            sm:text-sm
                            text-slate-500
                            mt-1
                          "
                        >
                          Ask IntelliGov AI about schemes, eligibility,
                          scholarships and government benefits.
                        </p>

                      </div>

                    </div>



                    {/* Ask AI */}

                    <Link
                      to="/chat"
                      className="
                        px-6
                        py-3
                        rounded-xl
                        bg-gradient-to-r
                        from-cyan-500
                        via-blue-600
                        to-indigo-600
                        text-white
                        text-sm
                        font-semibold
                        shadow-lg
                        shadow-blue-500/20
                        hover:scale-105
                        hover:shadow-cyan-500/30
                        transition-all
                        duration-300
                        flex
                        items-center
                        justify-center
                        gap-2
                        whitespace-nowrap
                        w-full
                        sm:w-auto
                      "
                    >

                      <FaRobot />

                      Ask AI

                      <FaArrowRight className="text-xs" />

                    </Link>

                  </div>

                </section>


              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}


export default Dashboard;