import hero from "../../assets/hero.jpeg";
import { FaRobot, FaArrowRight } from "react-icons/fa";

function AIAssistantCard() {
  return (
    <section className="relative mt-4 overflow-hidden rounded-3xl bg-[#101d34] border border-blue-900/40 px-6 py-4">

      {/* Background Glow */}
      <div className="absolute -right-16 top-1/2 -translate-y-1/2 w-72 h-72 bg-blue-500/20 blur-[120px] rounded-full"></div>

      <div className="relative flex items-center justify-between">

        {/* Left Side */}

        <div className="max-w-xl">

          <p className="text-sky-300 font-semibold tracking-widest uppercase">
            AI Assistant
          </p>

          <div className="mt-2 text-2xl font-bold text-white">
            Your AI Government Guide
          </div>

          <p className="mt-2 text-gray-400 leading-5">

            Get instant recommendations for government schemes,
            scholarships, jobs, internships and eligibility checks
            using our intelligent AI assistant.

          </p>

          <button
            className="
            mt-6
            flex
            items-center
            gap-3
            px-6
            py-3
            rounded-xl
            bg-gradient-to-r
            from-[#1a56db]
            to-[#2563eb]
            text-white
            font-semibold
            shadow-lg
            hover:scale-105
            hover:shadow-[0_0_25px_rgba(59,130,246,.6)]
            transition-all
            duration-300
            "
          >

            <FaRobot />

            Start AI Chat

            <FaArrowRight />

          </button>

        </div>

        {/* Right Side */}

        <div className="hidden lg:flex justify-center items-center">

          <img
            src={hero}
            alt="AI Assistant"
            className="w-36 float drop-shadow-[0_0_35px_rgba(59,130,246,.8)]"
          />

        </div>

      </div>

    </section>
  );
}

export default AIAssistantCard;