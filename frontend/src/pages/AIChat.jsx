import robot from "../assets/robot.png";
import {
  FaPaperPlane,
  FaPaperclip,
  FaShieldAlt,
} from "react-icons/fa";
import { PiStudentFill } from "react-icons/pi";
import { MdOutlineAccountBalance } from "react-icons/md";
import { HiBriefcase } from "react-icons/hi";

function AIChat() {
  return (
    <section className="relative min-h-screen bg-[#0a1628] overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-20 left-20 w-[350px] h-[350px] bg-blue-600/20 blur-[140px] rounded-full"></div>

      <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-purple-600/20 blur-[150px] rounded-full"></div>

      {/* Floating Stars */}
      <div className="absolute inset-0">

        <div className="absolute top-24 left-28 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>

        <div className="absolute top-52 right-40 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>

        <div className="absolute bottom-36 left-64 w-2 h-2 bg-sky-300 rounded-full animate-pulse"></div>

        <div className="absolute bottom-24 right-32 w-2 h-2 bg-pink-400 rounded-full animate-ping"></div>

      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-10">

        {/* Heading */}

        <div className="text-center">

          <div className="text-5xl font-black bg-gradient-to-r from-cyan-300 via-white to-yellow-400 bg-clip-text text-transparent">

            AI Chat Assistant

          </div>

          <p className="text-gray-300 mt-4 text-lg">

            Ask anything about Government Schemes,
            Scholarships, Jobs & Internships.

          </p>

        </div>

        {/* Floating Robot */}

        <img
          src={robot}
          alt="AI Robot"
          className="hidden lg:block absolute right-0 top-0 w-44 float"
        />

        {/* Chat Box */}

        <div className="mt-12 bg-[#101d34]/90 border border-blue-900/40 rounded-3xl backdrop-blur-lg p-6">

          {/* AI Message */}

          <div className="flex gap-4">

            <img
              src={robot}
              alt="Robot"
              className="w-12 h-12 object-contain"
            />

            <div className="bg-[#18294a] rounded-2xl px-5 py-4 max-w-xl text-gray-200">

              👋 Hello, Ishita!

              <br /><br />

              I'm IntelliGov AI.

              <br />

              Your Government Services Assistant.

              <br /><br />

              How can I help you today?

            </div>

          </div>

          {/* User Message */}

          <div className="flex justify-end mt-6">

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl px-5 py-4 max-w-md">

              What scholarship schemes are available for engineering students?

            </div>

          </div>

          {/* AI Reply */}

          <div className="flex gap-4 mt-6">

            <img
              src={robot}
              alt="Robot"
              className="w-12 h-12 object-contain"
            />

            <div className="bg-[#18294a] rounded-2xl px-5 py-4 max-w-xl text-gray-200 leading-8">

              Here are some popular scholarships:

              <br /><br />

              • AICTE Pragati Scholarship

              <br />

              • NSP Scholarship

              <br />

              • Central Sector Scholarship

              <br />

              • State Government Scholarship

            </div>

          </div>

          {/* Chat Input */}

          <div className="mt-8 flex items-center bg-[#0b1730] border border-blue-800 rounded-2xl px-5 py-3">

            <input
              type="text"
              placeholder="Type your question here..."
              className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
            />

            <FaPaperclip className="text-gray-400 hover:text-cyan-300 cursor-pointer mr-5" />

            <button className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center hover:scale-110 transition">

              <FaPaperPlane className="text-white" />

            </button>

          </div>

        </div>

        {/* Suggested Questions */}

        <div className="mt-8">

          <div className="text-gray-300 font-semibold mb-4">

            ✨ Suggested Questions

          </div>

          <div className="grid md:grid-cols-4 gap-4">

            <div className="bg-[#101d34] border border-blue-900/40 rounded-2xl p-4 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] transition cursor-pointer">

              <MdOutlineAccountBalance className="text-3xl text-sky-400 mb-3" />

              <div className="text-white">

                Government Schemes

              </div>

            </div>

            <div className="bg-[#101d34] border border-blue-900/40 rounded-2xl p-4 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] transition cursor-pointer">

              <PiStudentFill className="text-3xl text-blue-400 mb-3" />

              <div className="text-white">

                Scholarships

              </div>

            </div>

            <div className="bg-[#101d34] border border-blue-900/40 rounded-2xl p-4 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] transition cursor-pointer">

              <FaShieldAlt className="text-3xl text-green-400 mb-3" />

              <div className="text-white">

                Check Eligibility

              </div>

            </div>

            <div className="bg-[#101d34] border border-blue-900/40 rounded-2xl p-4 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] transition cursor-pointer">

              <HiBriefcase className="text-3xl text-yellow-400 mb-3" />

              <div className="text-white">

                Jobs & Internships

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default AIChat;