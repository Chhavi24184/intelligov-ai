import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  FaGraduationCap,
  FaTractor,
  FaBriefcase,
  FaHeartbeat,
  FaUserShield,
  FaRobot,
} from "react-icons/fa";


// =====================================================
// SERVICE CARD
// =====================================================

function ServiceCard({ service, index }) {

  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);


  // =====================================================
  // SCROLL REVEAL
  // =====================================================

  useEffect(() => {

    const observer = new IntersectionObserver(
      ([entry]) => {

        if (entry.isIntersecting) {

          setIsVisible(true);

          observer.unobserve(entry.target);

        }

      },
      {
        threshold: 0.15,
      }
    );


    if (cardRef.current) {
      observer.observe(cardRef.current);
    }


    return () => observer.disconnect();

  }, []);


  return (

    <div
      ref={cardRef}

      className={`
        glass-card
        p-7 lg:p-8
        rounded-3xl
        relative
        flex flex-col justify-between
        group
        border border-sky-200/70

        transition-all
        duration-700
        ease-[cubic-bezier(0.22,1,0.36,1)]

        hover:border-sky-400/60
        hover:-translate-y-2

        ${
          isVisible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-16 scale-[0.96]"
        }
      `}

      style={{
        transitionDelay: `${index * 100}ms`,
      }}
    >

      {/* =====================================================
          SUBTLE HOVER GLOW
      ===================================================== */}

      <div
        className="
          absolute
          inset-0
          rounded-3xl
          bg-gradient-to-br
          from-sky-400/[0.08]
          via-transparent
          to-blue-500/[0.06]
          opacity-0
          group-hover:opacity-100
          transition-opacity
          duration-500
          pointer-events-none
        "
      />


      {/* =====================================================
          CARD CONTENT
      ===================================================== */}

      <div className="relative z-10">


        {/* =====================================================
            ICON + BADGE
        ===================================================== */}

        <div className="flex items-center justify-between mb-6">

          {/* ICON */}

          <div
            className="
              p-4
              rounded-2xl
              bg-sky-50
              border border-sky-200

              group-hover:border-sky-400/60
              group-hover:scale-110
              group-hover:-rotate-2

              transition-all
              duration-500
            "
          >

            {service.icon}

          </div>


          {/* BADGE */}

          <span
            className="
              px-3
              py-1
              rounded-full
              bg-sky-50
              border border-sky-200
              text-slate-600
              text-xs
              font-medium

              group-hover:border-sky-400/60
              group-hover:text-sky-600

              transition-all
              duration-300
            "
          >

            {service.badge}

          </span>

        </div>


        {/* =====================================================
            TITLE
        ===================================================== */}

        <div
          className="
            text-xl
            font-bold
            text-slate-900
            mb-3

            group-hover:text-sky-600

            transition-colors
            duration-300
          "
        >

          {service.title}

        </div>


        {/* =====================================================
            DESCRIPTION
        ===================================================== */}

        <p
          className="
            text-slate-600
            text-sm
            leading-relaxed
            mb-6
          "
        >

          {service.description}

        </p>

      </div>


      {/* =====================================================
          EXPLORE FEATURE
          ONLY THIS PART IS CLICKABLE
      ===================================================== */}

      <div className="relative z-10">

        <Link
          to={service.link}

          className="
            inline-flex
            items-center
            gap-2

            text-sm
            font-semibold
            text-sky-600

            hover:text-blue-600

            transition-all
            duration-300

            group-hover:translate-x-1
          "
        >

          <span>
            Explore Feature
          </span>

          <span
            className="
              transition-transform
              duration-300
              group-hover:translate-x-1
            "
          >
            →
          </span>

        </Link>

      </div>


      {/* =====================================================
          BOTTOM GLOW
      ===================================================== */}

      <div
        className="
          absolute
          bottom-0
          left-1/2
          -translate-x-1/2

          w-1/2
          h-px

          bg-sky-400/0
          group-hover:bg-sky-400/50

          blur-sm

          transition-all
          duration-500
        "
      />

    </div>

  );
}



// =====================================================
// FEATURES / SERVICES SECTION
// =====================================================

function Features() {


  const services = [

    {
      icon: <FaTractor className="text-2xl text-sky-500" />,
      title: "Government Schemes",
      description:
        "Discover welfare benefits, agricultural subsidies, financial support, and housing initiatives suited for your profile.",
      badge: "Welfare & Farming",
      link: "/schemes",
    },


    {
      icon: <FaGraduationCap className="text-2xl text-sky-500" />,
      title: "Scholarships & Education",
      description:
        "Find educational grants, merit scholarships, and research fellowships for school, undergraduate, and postgrad students.",
      badge: "Students & Youth",
      link: "/schemes",
    },


    {
      icon: <FaBriefcase className="text-2xl text-sky-500" />,
      title: "Jobs & Careers",
      description:
        "Explore government jobs, career opportunities, skill-development programs, and employment initiatives.",
      badge: "Careers & Skill",
      link: "/schemes",
    },


    {
      icon: <FaHeartbeat className="text-2xl text-sky-500" />,
      title: "Healthcare & Insurance",
      description:
        "Access universal health coverage schemes, maternity support, medical assistance, and senior citizen benefits.",
      badge: "Health & Care",
      link: "/schemes",
    },


    {
      icon: <FaUserShield className="text-2xl text-sky-500" />,
      title: "Eligibility Matcher",
      description:
        "Instantly check your eligibility score across hundreds of central and state government schemes in one step.",
      badge: "Smart Match",
      link: "/eligibility",
    },


    {
      icon: <FaRobot className="text-2xl text-sky-500" />,
      title: "24/7 AI Voice & Text Chat",
      description:
        "Ask questions in simple natural language and receive instant, personalized scheme recommendations and steps.",
      badge: "AI Powered",
      link: "/chat",
    },

  ];


  return (

    <section
      id="services"
      className="
        relative
        bg-[#ffffff]
        text-slate-900
        py-16
        lg:py-20
        overflow-hidden
      "
    >


      {/* =====================================================
          BACKGROUND LIGHTS
      ===================================================== */}

      <div className="absolute inset-0 pointer-events-none">

        <div
          className="
            absolute
            top-20
            left-0
            w-80
            h-80
            bg-sky-400/10
            rounded-full
            blur-3xl
          "
        />

        <div
          className="
            absolute
            bottom-0
            right-0
            w-80
            h-80
            bg-blue-400/10
            rounded-full
            blur-3xl
          "
        />

      </div>


      {/* =====================================================
          MAIN CONTAINER
      ===================================================== */}

      <div className="relative max-w-7xl mx-auto px-6">


        {/* =====================================================
            SECTION HEADER
        ===================================================== */}

        <div
          className="
            text-center
            max-w-3xl
            mx-auto
            mb-12
            lg:mb-16
            space-y-4

            opacity-100
            translate-y-0
          "
        >

          <span
            className="
              inline-block
              px-4
              py-1.5
              rounded-full
              bg-sky-50
              border border-sky-200
              text-sky-600
              text-xs
              font-semibold
              uppercase
              tracking-wider
            "
          >

            IntelliGov Capabilities

          </span>


          {/* =====================================================
              MAIN HEADING
          ===================================================== */}

          <div
            className="
              text-3xl
              sm:text-4xl
              lg:text-5xl
              font-black
              text-slate-900
              leading-tight
            "
          >

            Smart Government Services <br />

            <span
              className="
                bg-gradient-to-r
                from-sky-500
                to-blue-600
                bg-clip-text
                text-transparent
              "
            >

              Tailored For Every Citizen

            </span>

          </div>


          {/* =====================================================
              DESCRIPTION
          ===================================================== */}

          <p
            className="
              text-slate-600
              text-base
              leading-relaxed
            "
          >

            Eliminate tedious searching across hundreds of portal sites.
            Our AI consolidates verified government data for instant citizen
            access.

          </p>

        </div>


        {/* =====================================================
            SERVICES GRID
        ===================================================== */}

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            gap-6
            lg:gap-8
          "
        >

          {services.map((service, index) => (

            <ServiceCard
              key={index}
              service={service}
              index={index}
            />

          ))}

        </div>


      </div>

    </section>

  );
}


export default Features;