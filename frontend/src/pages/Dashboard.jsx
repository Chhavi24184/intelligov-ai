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
      icon: <FaListAlt className="text-cyan-400 text-xl" />,
    },

    {
      title: "Check Eligibility",
      desc: "Check your eligibility for available government schemes.",
      link: "/eligibility",
      icon: <FaUserCheck className="text-emerald-400 text-xl" />,
    },
  ];


  return (

    <div className="min-h-screen bg-[#060c17] text-white">


      {/* =====================================================
          FIXED RESPONSIVE SIDEBAR
      ===================================================== */}

      <Sidebar />


      {/* =====================================================
          MAIN DASHBOARD
          
          Desktop:
          ml-50 → reserves sidebar width

          Mobile:
          ml-0 → full screen
          
          pt-16 → reserves mobile top bar
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

        {/* =================================================
            DASHBOARD SCROLL AREA
        ================================================= */}

        <div className="min-h-screen overflow-y-auto">


          {/* =================================================
              BACKGROUND
          ================================================= */}

          <div className="relative min-h-screen overflow-hidden">


            {/* Blue Glow */}

            <div
              className="
                absolute
                top-0
                left-1/4
                w-[400px]
                h-[400px]
                bg-blue-600/10
                blur-[150px]
                rounded-full
                pointer-events-none
              "
            />


            {/* Cyan Glow */}

            <div
              className="
                absolute
                top-1/2
                right-0
                w-[350px]
                h-[350px]
                bg-cyan-500/10
                blur-[140px]
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
                  justify-between
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
                    bg-[#081224]
                    border
                    border-blue-900/40
                    text-slate-300
                    text-sm
                    font-medium
                    hover:text-white
                    hover:border-blue-700/60
                    hover:bg-[#0d1a2e]
                    transition-all
                    duration-300
                  "
                >

                  <FaArrowLeft className="text-xs" />

                  <span>Back</span>

                </button>


                {/* Notification */}

                <button
                  type="button"
                  className="
                    relative
                    w-10
                    h-10
                    rounded-xl
                    bg-[#081224]
                    border
                    border-blue-900/40
                    flex
                    items-center
                    justify-center
                    text-slate-400
                    hover:text-white
                    hover:border-blue-700/60
                    hover:bg-[#0d1a2e]
                    transition-all
                    duration-300
                  "
                  aria-label="Notifications"
                >

                  <span className="text-lg">
                    🔔
                  </span>


                  {/* Notification Dot */}

                  <span
                    className="
                      absolute
                      top-2
                      right-2
                      w-2
                      h-2
                      rounded-full
                      bg-cyan-400
                      shadow-[0_0_8px_rgba(34,211,238,0.8)]
                    "
                  />

                </button>

              </div>



              {/* =================================================
                  DASHBOARD SECTIONS
              ================================================= */}

              <div className="space-y-8">


                {/* =================================================
                    WELCOME
                ================================================= */}

                <WelcomeSection />



                {/* =================================================
                    STATISTICS
                ================================================= */}

                <StatsCards />



                {/* =================================================
                    AI ASSISTANT
                ================================================= */}

                <AIAssistantCard />



                {/* =================================================
                    QUICK PORTAL ACTIONS
                ================================================= */}

                <section className="space-y-4">


                  <div>

                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      Quick Portal Actions
                    </h3>

                    <p className="text-xs text-slate-400 mt-1">
                      Quickly access important citizen services.
                    </p>

                  </div>



                  {/* Responsive Cards */}

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
                          glass-card
                          p-6
                          rounded-3xl
                          border
                          border-blue-900/40
                          flex
                          items-center
                          justify-between
                          group
                          hover:border-blue-700/60
                          hover:bg-[#0b172b]
                          transition-all
                          duration-300
                        "
                      >


                        {/* Left Content */}

                        <div className="flex items-center gap-4 min-w-0">


                          {/* Icon */}

                          <div
                            className="
                              p-3.5
                              rounded-2xl
                              bg-[#081224]
                              border
                              border-blue-900/40
                              group-hover:border-blue-700/60
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
                                text-white
                                group-hover:text-slate-100
                                transition-colors
                              "
                            >
                              {action.title}
                            </h4>


                            <p
                              className="
                                text-xs
                                text-slate-400
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
                            text-slate-500
                            group-hover:text-slate-300
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
                    glass-panel
                    rounded-3xl
                    border
                    border-cyan-500/20
                    p-5
                    sm:p-8
                  "
                >

                  <div
                    className="
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
                          bg-cyan-500/10
                          border
                          border-cyan-400/30
                          flex
                          items-center
                          justify-center
                          shrink-0
                        "
                      >

                        <FaRobot className="text-cyan-400 text-xl" />

                      </div>


                      <div>

                        <h3 className="text-base sm:text-lg font-bold text-white">

                          Need Help Finding a Scheme?

                        </h3>


                        <p
                          className="
                            text-xs
                            sm:text-sm
                            text-slate-400
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
                        to-blue-600
                        text-white
                        text-sm
                        font-semibold
                        shadow-lg
                        shadow-cyan-500/20
                        hover:scale-105
                        transition-all
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