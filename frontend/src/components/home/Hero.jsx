// import { FaArrowRight } from "react-icons/fa";
// import hero from "../../assets/hero.jpeg";

// function Hero() {
//   return (
//     <section className="bg-[#0A1628] min-h-[90vh] flex items-center">
//       <div className="max-w-7xl mx-auto px-10 grid md:grid-cols-2 gap-12 items-center">

//         {/* Left */}

//         <div>

//           <span className="bg-[#1A56DB] text-white px-4 py-2 rounded-full">
//             AI Powered Government Platform
//           </span>

//           <h1 className="text-6xl font-bold text-white mt-8 leading-tight">
//             Welcome to
//             <br />
//             <span className="text-[#F59E0B]">
//               IntelliGov AI
//             </span>
//           </h1>

//           <p className="text-gray-300 text-xl mt-6 leading-9">
//             Discover Government Schemes and Scholarships
//             with Artificial Intelligence in seconds.
//           </p>

//           <div className="flex gap-5 mt-10">

//             <button className="bg-[#1A56DB] hover:bg-blue-700 text-white px-7 py-3 rounded-xl flex items-center gap-3">

//               Get Started

//               <FaArrowRight />

//             </button>

//             <button className="border border-white text-white px-7 py-3 rounded-xl hover:bg-white hover:text-[#0A1628] transition">

//               Learn More

//             </button>

//           </div>

//         </div>

//         {/* Right */}

//         <div className="flex justify-center">
          
//           <img
//           src={hero}
//           alt="AI Government Assistant"
//           className="w-[450px]"
//           />

//         </div>

//       </div>
//     </section>
//   );
// }

// export default Hero;

// import hero from "../../assets/hero.jpeg";

// function Hero() {
//   return (
//     <section
//       className="relative h-screen bg-cover bg-center"
//       style={{ backgroundImage: `url(${hero})` }}
//     >
//       {/* Dark Overlay */}
//       <div className="absolute inset-0 bg-[#0a1628]/65"></div>

//       {/* Hero Content */}
//       <div className="relative z-10 flex items-center justify-center h-full px-6">
//         <div className="max-w-4xl text-center">

//           {/* Small Badge */}
//           <span className="inline-block bg-[#1a56db] text-white px-5 py-2 rounded-full text-sm font-medium shadow-lg">
//             AI Powered Government Platform
//           </span>

//           {/* Heading */}
//           <h1 className="mt-8 text-6xl md:text-7xl font-extrabold text-white leading-tight">
//             Welcome to
//             <br />
//             <span className="text-[#f59e0b]">
//               IntelliGov AI
//             </span>
//           </h1>

//           {/* Description */}
//           <p className="mt-8 text-xl md:text-2xl text-gray-200 leading-9">
//             Your AI-powered Government Services Assistant
//             helping citizens discover government schemes,
//             scholarships and career opportunities effortlessly.
//           </p>

//           {/* Buttons */}
//           <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6">

//             <button className="bg-[#1a56db] hover:bg-blue-700 transition-all duration-300 px-8 py-4 rounded-xl text-white font-semibold shadow-lg hover:scale-105">
//               Get Started
//             </button>

//             <button className="border-2 border-white text-white hover:bg-white hover:text-[#0a1628] transition-all duration-300 px-8 py-4 rounded-xl font-semibold hover:scale-105">
//               Explore Services
//             </button>

//           </div>

//         </div>
//       </div>
//     </section>
//   );
// }

// export default Hero;

import hero from "../../assets/hero.jpeg";

function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-[120vh] h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${hero})` }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-[#0a1628]/65"></div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto h-full flex items-center px-8 lg:px-16">

        <div className="max-w-2xl -mt-16 text-left">

          {/* Heading */}

          <h1 className="leading-tight font-extrabold">

            <span className="text-sky-300">Welcome to</span>
            <br />
            <span className="text-white">IntelliGov</span>{" "}
            <span className="text-yellow-400">AI</span>

          </h1>

          {/* Description */}

          <p className="mt-2 text-lg md:text-xl text-gray-200 leading-8 max-w-xl">

            Your AI-powered Government Services Assistant helping
            citizens discover government schemes, scholarships,
            jobs and internships through intelligent and
            personalized recommendations.

          </p>

          {/* AI Badge */}

          <div className="mt-8">

            <span className="inline-block bg-[#1a56db] text-white px-5 py-2 rounded-full text-sm font-medium shadow-lg">

              AI Powered Government Platform

            </span>

          </div>

          {/* Buttons */}

          <div className="mt-10 flex flex-wrap gap-5">

            <button className="bg-[#1a56db] hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105">

              Get Started

            </button>

            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:bg-white hover:text-[#0a1628] hover:scale-105">

              Explore Services

            </button>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Hero;