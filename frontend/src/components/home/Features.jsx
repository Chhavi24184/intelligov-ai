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


function ServiceCard({ service, index }) {

  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);


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
        border border-blue-900/30
        hover:border-cyan-400/40
        transition-all
        duration-700
        ease-out
        hover:-translate-y-1

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

      {/* CARD CONTENT */}

      <div>

        {/* Icon + Badge */}

        <div className="flex items-center justify-between mb-6">

          <div className="p-4 rounded-2xl bg-[#0d1b32] border border-blue-900/40 group-hover:scale-110 transition-transform duration-300">

            {service.icon}

          </div>


          <span className="px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-slate-300 text-xs font-medium">

            {service.badge}

          </span>

        </div>


        {/* Title */}

        <div className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">

          {service.title}

        </div>


        {/* Description */}

        <p className="text-slate-400 text-sm leading-relaxed mb-6">

          {service.description}

        </p>

      </div>


      {/* EXPLORE FEATURE ONLY */}

      <div>

        <Link
          to={service.link}
          className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group-hover:translate-x-1 duration-200"
        >

          <span>Explore Feature</span>

          <span>→</span>

        </Link>

      </div>


    </div>

  );
}



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
        "Find educational grants, merit scholarships, and research fellowships for school, undergraduate, and postgrad students.",
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
        "Access universal health coverage schemes, maternity support, medical assistance, and senior citizen benefits.",
      badge: "Health & Care",
      link: "/schemes",
    },

    {
      icon: <FaUserShield className="text-2xl text-cyan-400" />,
      title: "Eligibility Matcher",
      description:
        "Instantly check your eligibility score across hundreds of central and state government schemes in one step.",
      badge: "Smart Match",
      link: "/eligibility",
    },

    {
      icon: <FaRobot className="text-2xl text-cyan-400" />,
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
      className="relative bg-[#0a1628] text-white py-16 lg:py-20 overflow-hidden"
    >

      {/* BACKGROUND LIGHTS */}

      <div className="absolute inset-0 pointer-events-none">

        <div className="absolute top-20 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />

        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />

      </div>


      {/* MAIN CONTAINER */}

      <div className="relative max-w-7xl mx-auto px-6">


        {/* SECTION HEADER */}

        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16 space-y-4">

          <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">

            IntelliGov Capabilities

          </span>


          <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">

            Smart Government Services <br />

            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">

              Tailored For Every Citizen

            </span>

          </div>


          <p className="text-slate-400 text-base leading-relaxed">

            Eliminate tedious searching across hundreds of portal sites.
            Our AI consolidates verified government data for instant citizen
            access.

          </p>

        </div>


        {/* SERVICES GRID */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">

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