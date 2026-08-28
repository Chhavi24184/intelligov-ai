import { useEffect, useRef, useState } from "react";

import {
  FaSearch,
  FaFileAlt,
  FaCheckCircle,
  FaRobot,
  FaUserCheck,
} from "react-icons/fa";


// =====================================================
// REVEAL COMPONENT
// =====================================================

function Reveal({ children, className = "", delay = 0 }) {

  const ref = useRef(null);
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


    if (ref.current) {
      observer.observe(ref.current);
    }


    return () => observer.disconnect();

  }, []);


  return (

    <div
      ref={ref}
      className={`
        ${className}
        transition-all
        duration-700
        ease-out
        ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-14"
        }
      `}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >

      {children}

    </div>

  );
}



// =====================================================
// ABOUT COMPONENT
// =====================================================

function About() {


  const steps = [

    {
      num: "01",
      icon: <FaUserCheck className="text-sky-500 text-xl" />,
      title: "Tell Us About Yourself",
      desc: "Share your basic details, needs, and preferences so IntelliGov AI can understand your requirements.",
    },

    {
      num: "02",
      icon: <FaSearch className="text-blue-500 text-xl" />,
      title: "AI Semantic Search",
      desc: "IntelliGov AI searches and analyzes government scheme information to match your eligibility criteria.",
    },

    {
      num: "03",
      icon: <FaFileAlt className="text-amber-500 text-xl" />,
      title: "Get Tailored Results",
      desc: "Receive customized scheme recommendations with complete document checklists and eligibility details.",
    },

    {
      num: "04",
      icon: <FaCheckCircle className="text-emerald-500 text-xl" />,
      title: "Apply Seamlessly",
      desc: "Follow direct application links and step-by-step guidance to claim the benefits you are eligible for.",
    },

  ];


  return (

    <section
      id="about"
      className="
        relative
        bg-gradient-to-br
        from-white
        via-sky-50
        to-blue-100
        text-slate-900
        py-16
        lg:py-20
        overflow-hidden
      "
    >


      {/* =========================
          BACKGROUND LIGHTS
      ========================= */}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        <div className="absolute top-20 left-0 w-80 h-80 bg-sky-400/15 rounded-full blur-3xl" />

        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-400/15 rounded-full blur-3xl" />

        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl" />

      </div>


      {/* =========================
          MAIN CONTAINER
      ========================= */}

      <div className="relative max-w-7xl mx-auto px-6">


        {/* =====================================================
            ABOUT CARD
        ===================================================== */}

        <Reveal
          delay={0}
          className="mb-16"
        >

          <div
            className="
              glass-panel
              p-8
              sm:p-12
              rounded-3xl
              border
              border-sky-200/70
              relative
              overflow-hidden
            "
          >


            {/* Card Glow */}

            <div className="absolute -top-20 -right-20 w-64 h-64 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />


            <div className="grid lg:grid-cols-12 gap-8 items-center">


              {/* About Content */}

              <div className="lg:col-span-8 space-y-5 relative z-10">


                {/* Badge */}

                <span
                  className="
                    inline-block
                    px-4
                    py-1.5
                    rounded-full
                    bg-sky-500/10
                    border
                    border-sky-400/30
                    text-sky-600
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider
                  "
                >

                  About IntelliGov AI Platform

                </span>


                {/* Main Heading */}

                <div
                  className="
                    text-3xl
                    sm:text-4xl
                    font-black
                    text-slate-900
                    leading-tight
                  "
                >

                  Bridging the Gap Between <br />

                  <span
                    className="
                      bg-gradient-to-r
                      from-sky-500
                      via-blue-600
                      to-amber-500
                      bg-clip-text
                      text-transparent
                    "
                  >

                    Citizens & Welfare Services

                  </span>

                </div>


                {/* Description */}

                <p className="text-slate-600 text-base leading-relaxed">

                  Millions of eligible citizens miss out on government schemes
                  every year due to complex portals and lack of awareness.
                  IntelliGov AI acts as an intelligent digital bridge—parsing
                  complex government mandates into clear, personalized answers.

                </p>

              </div>


              {/* AI Icon Side */}

              <div className="lg:col-span-4 flex justify-center lg:justify-end relative z-10">

                <div
                  className="
                    w-32
                    h-32
                    sm:w-36
                    sm:h-36
                    rounded-3xl
                    bg-gradient-to-br
                    from-sky-500/15
                    to-blue-500/10
                    border
                    border-sky-300/40
                    flex
                    items-center
                    justify-center
                    shadow-2xl
                    shadow-sky-500/10
                  "
                >

                  <FaRobot className="text-6xl sm:text-7xl text-sky-500" />

                </div>

              </div>


            </div>

          </div>

        </Reveal>



        {/* =====================================================
            HOW IT WORKS HEADER
        ===================================================== */}

        <Reveal delay={150}>

          <div className="text-center mb-12">


            <div className="text-2xl sm:text-3xl font-bold text-slate-900">

              How IntelliGov AI Works

            </div>


            <p className="text-slate-500 text-sm mt-2">

              Four simple steps from discovery to benefit delivery

            </p>

          </div>

        </Reveal>



        {/* =====================================================
            STEP CARDS
        ===================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">


          {steps.map((step, idx) => (

            <Reveal
              key={idx}
              delay={250 + idx * 120}
            >

              <div
                className="
                  glass-card
                  p-6
                  rounded-2xl
                  relative
                  border
                  border-sky-200/60
                  hover:border-sky-400/60
                  hover:-translate-y-1
                  transition-all
                  duration-300
                  group
                "
              >


                {/* Step Number */}

                <div
                  className="
                    text-4xl
                    font-black
                    text-sky-200/70
                    absolute
                    top-4
                    right-4
                    group-hover:text-sky-300/80
                    transition-colors
                  "
                >

                  {step.num}

                </div>


                {/* Icon */}

                <div
                  className="
                    w-12
                    h-12
                    rounded-xl
                    bg-sky-50
                    border
                    border-sky-200
                    flex
                    items-center
                    justify-center
                    mb-5
                    group-hover:scale-105
                    transition-transform
                    duration-300
                  "
                >

                  {step.icon}

                </div>


                {/* Title */}

                <div
                  className="
                    text-lg
                    font-bold
                    text-slate-900
                    mb-2
                    group-hover:text-sky-600
                    transition-colors
                  "
                >

                  {step.title}

                </div>


                {/* Description */}

                <p className="text-slate-500 text-xs leading-relaxed">

                  {step.desc}

                </p>


              </div>

            </Reveal>

          ))}


        </div>


      </div>


    </section>

  );
}


export default About;