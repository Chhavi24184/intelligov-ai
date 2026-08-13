import { Link } from "react-router-dom";

import {
  FaGraduationCap,
  FaTractor,
  FaBriefcase,
  FaHeartbeat,
  FaUserShield,
  FaRobot,
  FaArrowRight,
} from "react-icons/fa";

function Features() {
  const services = [
    {
      icon: <FaTractor className="text-2xl text-cyan-400" />,
      title: "Government Schemes",
      description:
        "Discover welfare benefits, agricultural subsidies, financial support, and housing initiatives suited for your profile.",
      badge: "Welfare & Farming",
      link: "/schemes",
    },

    {
      icon: <FaGraduationCap className="text-2xl text-cyan-400" />,
      title: "Scholarships & Education",
      description:
        "Find educational grants, merit scholarships, and research fellowships for school, undergraduate, and postgraduate students.",
      badge: "Students & Youth",
      link: "/schemes",
    },

    {
      icon: <FaBriefcase className="text-2xl text-cyan-400" />,
      title: "Jobs & Careers",
      description:
        "Explore government jobs, career opportunities, skill-development programs, and employment initiatives.",
      badge: "Careers & Skill",
      link: "/schemes",
    },

    {
      icon: <FaHeartbeat className="text-2xl text-cyan-400" />,
      title: "Healthcare & Insurance",
      description:
        "Access health coverage schemes, maternity support, medical assistance, and senior citizen benefits.",
      badge: "Health & Care",
      link: "/schemes",
    },

    {
      icon: <FaUserShield className="text-2xl text-cyan-400" />,
      title: "Eligibility Matcher",
      description:
        "Check your eligibility across available government schemes using your personal, financial, and location details.",
      badge: "Smart Match",
      link: "/eligibility",
    },

    {
      icon: <FaRobot className="text-2xl text-cyan-400" />,
      title: "24/7 AI Voice & Text Chat",
      description:
        "Ask questions in simple natural language and receive instant scheme recommendations and application guidance.",
      badge: "AI Powered",
      link: "/chat",
    },
  ];

  return (
    <section className="relative bg-[#0a1628] text-white py-16 lg:py-20 overflow-hidden">

      {/* =========================
          BACKGROUND LIGHTS
      ========================= */}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        <div className="absolute top-20 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />

        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl" />

      </div>

      {/* =========================
          MAIN CONTAINER
      ========================= */}

      <div className="relative max-w-7xl mx-auto px-6">

        {/* =========================
            SECTION HEADER
        ========================= */}

        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16 space-y-4">

          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">

            IntelliGov Capabilities

          </span>

          <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">

            Smart Government Services

            <br />

            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">

              Tailored For Every Citizen

            </span>

          </div>

          <p className="text-slate-400 text-base leading-relaxed max-w-2xl mx-auto">

            Eliminate tedious searching across multiple government portals.
            IntelliGov AI brings verified scheme information together to make
            citizen services easier and more accessible.

          </p>

        </div>

        {/* =========================
            SERVICES GRID
        ========================= */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">

          {services.map((service, index) => (

            <div
              key={index}
              className="group relative glass-card p-7 lg:p-8 rounded-3xl border border-blue-900/30 hover:border-cyan-400/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-cyan-500/5 flex flex-col justify-between min-h-[320px]"
            >

              {/* Subtle Card Glow */}

              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/[0.03] to-blue-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* =========================
                  CARD CONTENT
              ========================= */}

              <div className="relative z-10">

                {/* Icon + Badge */}

                <div className="flex items-center justify-between mb-6">

                  <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#0d1b32] border border-blue-900/40 group-hover:border-cyan-400/30 group-hover:scale-110 transition-all duration-300">

                    {service.icon}

                  </div>

                  <span className="px-3 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/40 text-slate-300 text-[11px] font-medium">

                    {service.badge}

                  </span>

                </div>

                {/* Title */}

                <div className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors duration-300">

                  {service.title}

                </div>

                {/* Description */}

                <p className="text-slate-400 text-sm leading-relaxed">

                  {service.description}

                </p>

              </div>

              {/* =========================
                  EXPLORE LINK
              ========================= */}

              <div className="relative z-10 mt-7">

                <Link
                  to={service.link}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-all duration-200 group/link"
                >

                  <span>
                    Explore Feature
                  </span>

                  <FaArrowRight className="text-xs group-hover/link:translate-x-1 transition-transform duration-200" />

                </Link>

              </div>

            </div>

          ))}

        </div>

        {/* =========================
            BOTTOM CTA
        ========================= */}

        <div className="mt-12 lg:mt-16 text-center">

          <p className="text-slate-400 text-sm mb-4">
            Need personalized help finding the right government benefit?
          </p>

          <Link
            to="/chat"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0d1b32] border border-cyan-400/30 text-cyan-300 font-semibold hover:bg-cyan-500/10 hover:border-cyan-400/60 transition-all duration-300"
          >

            <FaRobot />

            <span>Ask IntelliGov AI</span>

            <FaArrowRight className="text-xs" />

          </Link>

        </div>

      </div>

    </section>
  );
}

export default Features;