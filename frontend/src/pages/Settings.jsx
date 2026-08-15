import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBell,
  FaGlobe,
  FaMoon,
  FaUser,
} from "react-icons/fa";

function Settings() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState("English");

  return (
    <div className="min-h-screen bg-[#060c17] text-white relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Main Content */}
      <div className="relative p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto">

        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-xl bg-[#081224] border border-blue-900/40 text-slate-300 text-sm hover:text-white hover:border-cyan-400/50 transition-all"
        >
          <FaArrowLeft />
          Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Settings
          </h1>

          <p className="text-sm text-slate-400 mt-2">
            Manage your IntelliGov AI preferences
          </p>
        </div>

        {/* Settings Cards */}
        <div className="space-y-5">

          {/* Account */}
          <div className="bg-[#081224] border border-blue-900/40 rounded-3xl p-6">

            <div className="flex items-center gap-4 mb-5">

              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center">
                <FaUser className="text-cyan-400" />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Account
                </h2>

                <p className="text-xs text-slate-400">
                  Manage your account information
                </p>
              </div>

            </div>

            <div className="border-t border-blue-900/30 pt-4">

              <p className="text-xs text-slate-500">
                Logged in as
              </p>

              <p className="text-sm text-cyan-400 mt-1">
                {localStorage.getItem("userEmail") || "Citizen"}
              </p>

            </div>

          </div>

          {/* Notifications */}
          <div className="bg-[#081224] border border-blue-900/40 rounded-3xl p-6">

            <div className="flex items-center justify-between gap-4">

              <div className="flex items-center gap-4">

                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-400/30 flex items-center justify-center">
                  <FaBell className="text-blue-400" />
                </div>

                <div>
                  <h2 className="font-semibold text-white">
                    Notifications
                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
                    Receive updates about schemes and services
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() => setNotifications(!notifications)}
                className={`relative w-12 h-6 rounded-full transition ${
                  notifications
                    ? "bg-cyan-500"
                    : "bg-slate-600"
                }`}
              >

                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                    notifications
                      ? "left-7"
                      : "left-1"
                  }`}
                />

              </button>

            </div>

          </div>

          {/* Theme */}
          <div className="bg-[#081224] border border-blue-900/40 rounded-3xl p-6">

            <div className="flex items-center justify-between gap-4">

              <div className="flex items-center gap-4">

                <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center">
                  <FaMoon className="text-purple-400" />
                </div>

                <div>
                  <h2 className="font-semibold text-white">
                    Dark Mode
                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
                    Use dark theme for IntelliGov AI
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className={`relative w-12 h-6 rounded-full transition ${
                  darkMode
                    ? "bg-cyan-500"
                    : "bg-slate-600"
                }`}
              >

                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                    darkMode
                      ? "left-7"
                      : "left-1"
                  }`}
                />

              </button>

            </div>

          </div>

          {/* Language */}
          <div className="bg-[#081224] border border-blue-900/40 rounded-3xl p-6">

            <div className="flex items-center gap-4 mb-4">

              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center">
                <FaGlobe className="text-emerald-400" />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Language
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Choose your preferred language
                </p>
              </div>

            </div>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full sm:w-64 px-4 py-3 rounded-xl bg-[#060c17] border border-blue-900/50 text-white outline-none focus:border-cyan-400/60"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Hinglish">Hinglish</option>
            </select>

          </div>

        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={() => alert("Settings saved successfully!")}
          className="mt-8 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-all"
        >
          Save Settings
        </button>

      </div>
    </div>
  );
}

export default Settings;