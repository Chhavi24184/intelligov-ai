import hero from "../../assets/hero.jpeg";
import { FaRobot } from "react-icons/fa";

function WelcomeBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#10264d] via-[#123b74] to-[#0b1f3f] p-8 shadow-2xl">

      {/* Background Glow */}
      <div className="absolute -top-24 -right-20 w-72 h-72 bg-blue-500/20 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-52 h-52 bg-cyan-400/10 blur-[80px] rounded-full"></div>

      <div className="relative flex items-center justify-between">

        {/* Left Content */}
        <div className="max-w-xl">

          <p className="text-cyan-300 font-semibold tracking-widest uppercase">
            Welcome Back 👋
          </p>

          <h1 className="mt-3 text-5xl font-extrabold leading-tight">

            <span className="text-white">
              AI Powered
            </span>

            <br />

            <span className="bg-gradient-to-r from-cyan-300 via-white to-yellow-400 bg-clip-text text-transparent">
              Government Assistant
            </span>

          </h1>

          <p className="mt-6 text-gray-300 text-lg leading-8">
            Discover government schemes, scholarships,
            jobs, internships and eligibility instantly
            with the power of AI.
          </p>

          <button className="mt-8 flex items-center gap-3 bg-[#1a56db] hover:bg-blue-700 px-7 py-3 rounded-xl text-white font-semibold shadow-lg transition duration-300 hover:scale-105">

            <FaRobot />

            Start AI Chat

          </button>

        </div>

        {/* Right Image */}

        <div className="hidden lg:block">

          <img
            src={hero}
            alt="AI Robot"
            className="w-[340px] float drop-shadow-[0_0_40px_rgba(59,130,246,0.7)]"
          />

        </div>

      </div>

    </section>
  );
}

export default WelcomeBanner;