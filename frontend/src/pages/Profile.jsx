import { FaUserCircle, FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  const userName = localStorage.getItem("userName") || "Citizen";
  const userEmail = localStorage.getItem("userEmail") || "Not available";

  return (
    <div className="min-h-screen bg-[#060c17] text-white flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Profile Card */}
      <div className="relative w-full max-w-md">

        <div className="bg-[#081224] border border-blue-900/40 rounded-3xl p-8 sm:p-10 shadow-2xl">

          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition mb-6"
          >
            <FaArrowLeft />
            Back to Dashboard
          </button>

          {/* Profile Icon */}
          <div className="flex justify-center mb-5">

            <div className="w-24 h-24 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center">
              <FaUserCircle className="text-cyan-400 text-6xl" />
            </div>

          </div>

          {/* Heading */}
          <div className="text-center mb-8">

            <h1 className="text-2xl font-bold text-white">
              My Profile
            </h1>

            <p className="text-sm text-slate-400 mt-2">
              IntelliGov AI Citizen Profile
            </p>

          </div>

          {/* User Information */}
          <div className="space-y-4">

            {/* Name */}
            <div className="bg-[#060c17] border border-blue-900/40 rounded-xl p-4">

              <p className="text-xs text-slate-500 mb-1">
                Full Name
              </p>

              <p className="text-white font-medium">
                {userName}
              </p>

            </div>

            {/* Email */}
            <div className="bg-[#060c17] border border-blue-900/40 rounded-xl p-4">

              <div className="flex items-center gap-2 mb-1">

                <FaEnvelope className="text-cyan-400 text-xs" />

                <p className="text-xs text-slate-500">
                  Email
                </p>

              </div>

              <p className="text-white font-medium break-all">
                {userEmail}
              </p>

            </div>

          </div>

          {/* Account Status */}
          <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">

            <div className="flex items-center justify-between">

              <span className="text-sm text-slate-300">
                Account Status
              </span>

              <span className="text-sm text-emerald-400 font-semibold">
                Active
              </span>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;