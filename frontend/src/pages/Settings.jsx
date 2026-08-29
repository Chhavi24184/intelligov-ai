import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaBell,
  FaGlobe,
  FaUser,
  FaCheck,
} from "react-icons/fa";

function Settings() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("English");
  const [saved, setSaved] = useState(false);

  /* =====================================================
     SAVE SETTINGS
  ===================================================== */

  const handleSave = () => {
    localStorage.setItem(
      "notificationsEnabled",
      notifications
    );

    localStorage.setItem(
      "preferredLanguage",
      language
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 relative overflow-hidden">

      {/* =====================================================
          BACKGROUND LIGHTS
      ===================================================== */}

      <div className="absolute inset-0 pointer-events-none">

        <div
          className="
            absolute
            top-0
            left-1/4
            w-[400px]
            h-[400px]
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
            w-[350px]
            h-[350px]
            bg-blue-400/10
            rounded-full
            blur-3xl
          "
        />

      </div>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="relative max-w-5xl mx-auto px-6 py-8 lg:py-10">


        {/* =====================================================
            BACK BUTTON
        ===================================================== */}

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="
            inline-flex
            items-center
            gap-2

            px-4
            py-2
            mb-8

            rounded-xl

            bg-sky-50
            border
            border-sky-200

            text-slate-600
            text-sm
            font-medium

            hover:text-sky-600
            hover:border-sky-400/60
            hover:bg-sky-100/70

            transition-all
            duration-300
          "
        >

          <FaArrowLeft className="text-xs" />

          Back

        </button>


        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="text-center max-w-3xl mx-auto mb-12">

          <span
            className="
              inline-block
              px-4
              py-1.5
              rounded-full

              bg-sky-50
              border
              border-sky-200

              text-sky-600
              text-xs
              font-semibold
              uppercase
              tracking-wider

              mb-4
            "
          >
            Account Preferences
          </span>


          <h1
            className="
              text-3xl
              sm:text-4xl
              lg:text-5xl

              font-black
              text-slate-900
              leading-tight
            "
          >

            Settings{" "}

            <span
              className="
                bg-gradient-to-r
                from-sky-500
                to-blue-600
                bg-clip-text
                text-transparent
              "
            >
              & Preferences
            </span>

          </h1>


          <p
            className="
              text-slate-600
              text-sm
              sm:text-base
              mt-4
              leading-relaxed
            "
          >
            Manage your IntelliGov AI account and service
            preferences from one place.
          </p>

        </div>


        {/* =====================================================
            SETTINGS
        ===================================================== */}

        <div className="space-y-6">


          {/* =================================================
              ACCOUNT
          ================================================= */}

          <div
            className="
              glass-card
              p-6
              rounded-3xl
              relative
              group

              border
              border-sky-200/70

              transition-all
              duration-500

              hover:border-sky-400/60
              hover:-translate-y-2
            "
          >

            {/* Hover glow */}

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


            <div className="relative z-10">

              <div className="flex items-center gap-4 mb-6">

                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl

                    bg-sky-50
                    border
                    border-sky-200

                    flex
                    items-center
                    justify-center

                    group-hover:border-sky-400/60
                    group-hover:scale-110
                    group-hover:-rotate-2

                    transition-all
                    duration-500
                  "
                >

                  <FaUser className="text-xl text-sky-500" />

                </div>


                <div>

                  <h2 className="font-bold text-lg text-slate-900">
                    Account
                  </h2>

                  <p className="text-sm text-slate-600 mt-1">
                    Manage your IntelliGov AI account information
                  </p>

                </div>

              </div>


              <div className="border-t border-sky-100 pt-5">

                <p className="text-xs text-slate-500">
                  Logged in as
                </p>

                <p className="text-sm text-sky-600 font-semibold mt-1 break-all">

                  {localStorage.getItem("userEmail") || "Citizen"}

                </p>

              </div>

            </div>

          </div>


          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <div
            className="
              glass-card
              p-6
              rounded-3xl
              relative
              group

              border
              border-sky-200/70

              transition-all
              duration-500

              hover:border-sky-400/60
              hover:-translate-y-2
            "
          >

            {/* Hover glow */}

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


            <div className="relative z-10 flex items-center justify-between gap-5">

              <div className="flex items-center gap-4">

                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl

                    bg-sky-50
                    border
                    border-sky-200

                    flex
                    items-center
                    justify-center

                    group-hover:border-sky-400/60
                    group-hover:scale-110
                    group-hover:-rotate-2

                    transition-all
                    duration-500
                  "
                >

                  <FaBell className="text-xl text-sky-500" />

                </div>


                <div>

                  <h2 className="font-bold text-lg text-slate-900">
                    Notifications
                  </h2>

                  <p className="text-sm text-slate-600 mt-1">
                    Receive updates about schemes and services
                  </p>

                </div>

              </div>


              {/* Toggle */}

              <button
                type="button"
                onClick={() =>
                  setNotifications(!notifications)
                }
                aria-label="Toggle notifications"
                className={`
                  relative
                  w-12
                  h-6
                  rounded-full
                  shrink-0
                  transition-all
                  duration-300

                  ${
                    notifications
                      ? "bg-sky-500"
                      : "bg-slate-300"
                  }
                `}
              >

                <span
                  className={`
                    absolute
                    top-1
                    w-4
                    h-4
                    bg-white
                    rounded-full
                    shadow-sm

                    transition-all
                    duration-300

                    ${
                      notifications
                        ? "left-7"
                        : "left-1"
                    }
                  `}
                />

              </button>

            </div>

          </div>


          {/* =================================================
              LANGUAGE
          ================================================= */}

          <div
            className="
              glass-card
              p-6
              rounded-3xl
              relative
              group

              border
              border-sky-200/70

              transition-all
              duration-500

              hover:border-sky-400/60
              hover:-translate-y-2
            "
          >

            {/* Hover glow */}

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


            <div className="relative z-10">

              <div className="flex items-center gap-4 mb-5">

                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl

                    bg-sky-50
                    border
                    border-sky-200

                    flex
                    items-center
                    justify-center

                    group-hover:border-sky-400/60
                    group-hover:scale-110
                    group-hover:-rotate-2

                    transition-all
                    duration-500
                  "
                >

                  <FaGlobe className="text-xl text-sky-500" />

                </div>


                <div>

                  <h2 className="font-bold text-lg text-slate-900">
                    Language
                  </h2>

                  <p className="text-sm text-slate-600 mt-1">
                    Choose your preferred language
                  </p>

                </div>

              </div>


              <select
                value={language}
                onChange={(e) =>
                  setLanguage(e.target.value)
                }
                className="
                  w-full
                  sm:w-72

                  px-4
                  py-3

                  rounded-xl

                  bg-white

                  border
                  border-sky-200

                  text-slate-700
                  text-sm

                  outline-none

                  focus:border-sky-400
                  focus:ring-2
                  focus:ring-sky-100

                  transition-all
                "
              >

                <option value="English">
                  English
                </option>

                <option value="Hindi">
                  Hindi
                </option>

                <option value="Hinglish">
                  Hinglish
                </option>

              </select>

            </div>

          </div>

        </div>


        {/* =====================================================
            SAVE BUTTON
        ===================================================== */}

        <div className="flex justify-center sm:justify-end mt-8">

          <button
            type="button"
            onClick={handleSave}
            className="
              inline-flex
              items-center
              gap-2

              px-7
              py-3.5

              rounded-xl

              bg-gradient-to-r
              from-sky-500
              to-blue-600

              text-white
              text-sm
              font-semibold

              shadow-lg
              shadow-sky-500/20

              hover:scale-[1.02]
              hover:shadow-xl
              hover:shadow-sky-500/25

              transition-all
              duration-300
            "
          >

            {saved && <FaCheck />}

            {saved
              ? "Settings Saved"
              : "Save Settings"}

          </button>

        </div>


        {/* =====================================================
            INFO
        ===================================================== */}

        <div
          className="
            mt-8
            text-center
            text-xs
            text-slate-500
          "
        >

          IntelliGov AI preferences are stored securely
          on this device.

        </div>

      </div>

    </div>
  );
}

export default Settings;