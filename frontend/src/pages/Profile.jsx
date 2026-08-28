import {
  FaUserCircle,
  FaEnvelope,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  const userName =
    localStorage.getItem("userName") || "Citizen";

  const userEmail =
    localStorage.getItem("userEmail") || "Not available";

  return (
    <div
      className="
        h-screen
        overflow-hidden
        bg-white
        text-slate-900
        relative
      "
    >

      {/* =====================================================
          BACKGROUND LIGHTS
      ===================================================== */}

      <div className="absolute inset-0 pointer-events-none">

        <div
          className="
            absolute
            top-[-100px]
            left-[-100px]
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
            bottom-[-120px]
            right-[-80px]
            w-[400px]
            h-[400px]
            bg-blue-400/10
            rounded-full
            blur-3xl
          "
        />

      </div>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div
        className="
          relative
          h-full
          max-w-5xl
          mx-auto
          px-5
          sm:px-8
          py-5
          sm:py-7
          flex
          flex-col
        "
      >

        {/* ===================================================
            BACK BUTTON
        =================================================== */}

        <div>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="
              inline-flex
              items-center
              gap-2

              px-3.5
              py-2

              rounded-xl

              bg-sky-50
              border
              border-sky-200

              text-slate-600
              text-xs
              sm:text-sm
              font-medium

              hover:text-sky-600
              hover:border-sky-400/60
              hover:-translate-x-1

              transition-all
              duration-300
            "
          >
            <FaArrowLeft className="text-[10px]" />
            Back to Dashboard
          </button>

        </div>


        {/* ===================================================
            HEADER
        =================================================== */}

        <div
          className="
            text-center
            max-w-2xl
            mx-auto
            mt-5
            sm:mt-6
            mb-5
          "
        >

          <span
            className="
              inline-flex
              items-center
              gap-2

              px-3.5
              py-1.5

              rounded-full

              bg-sky-50
              border
              border-sky-200

              text-sky-600

              text-[10px]
              sm:text-xs
              font-semibold
              uppercase
              tracking-wider
            "
          >
            Citizen Profile
          </span>


          <h1
            className="
              text-3xl
              sm:text-4xl

              font-black
              text-slate-900

              leading-tight
              mt-3
            "
          >

            My{" "}

            <span
              className="
                bg-gradient-to-r
                from-sky-500
                to-blue-600
                bg-clip-text
                text-transparent
              "
            >
              Profile
            </span>

          </h1>


          <p
            className="
              text-slate-600
              text-xs
              sm:text-sm
              mt-2
            "
          >
            Your IntelliGov AI citizen information
          </p>

        </div>


        {/* ===================================================
            PROFILE CARD
        =================================================== */}

        <div
          className="
            glass-card

            w-full
            max-w-xl
            mx-auto

            rounded-3xl

            border
            border-sky-200/70

            px-6
            py-6
            sm:px-8
            sm:py-7

            relative
            group

            transition-all
            duration-700
            ease-[cubic-bezier(0.22,1,0.36,1)]

            hover:border-sky-400/60
            hover:-translate-y-2
          "
        >

          {/* =================================================
              SUBTLE HOVER GLOW
          ================================================= */}

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


            {/* =================================================
                PROFILE ICON + NAME
            ================================================= */}

            <div className="flex items-center gap-5 mb-6">

              <div
                className="
                  w-20
                  h-20
                  sm:w-22
                  sm:h-22

                  shrink-0

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

                <FaUserCircle
                  className="
                    text-sky-500
                    text-5xl
                  "
                />

              </div>


              <div>

                <h2
                  className="
                    text-xl
                    sm:text-2xl

                    font-bold
                    text-slate-900

                    group-hover:text-sky-600

                    transition-colors
                    duration-300
                  "
                >
                  {userName}
                </h2>

                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  IntelliGov AI Citizen
                </p>

              </div>

            </div>


            {/* =================================================
                INFORMATION
            ================================================= */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">


              {/* =================================================
                  NAME
              ================================================= */}

              <div
                className="
                  p-4

                  rounded-2xl

                  bg-sky-50/60
                  border
                  border-sky-200/70

                  transition-all
                  duration-300

                  hover:border-sky-400/60
                  hover:bg-sky-50
                "
              >

                <div className="flex items-center gap-2 mb-2">

                  <FaUserCircle className="text-sky-500 text-sm" />

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-wider
                      font-semibold
                      text-slate-500
                    "
                  >
                    Full Name
                  </p>

                </div>

                <p className="text-sm font-semibold text-slate-900 truncate">
                  {userName}
                </p>

              </div>


              {/* =================================================
                  EMAIL
              ================================================= */}

              <div
                className="
                  p-4

                  rounded-2xl

                  bg-sky-50/60
                  border
                  border-sky-200/70

                  transition-all
                  duration-300

                  hover:border-sky-400/60
                  hover:bg-sky-50
                "
              >

                <div className="flex items-center gap-2 mb-2">

                  <FaEnvelope className="text-sky-500 text-xs" />

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-wider
                      font-semibold
                      text-slate-500
                    "
                  >
                    Email
                  </p>

                </div>

                <p
                  className="
                    text-sm
                    font-semibold
                    text-slate-900
                    truncate
                  "
                  title={userEmail}
                >
                  {userEmail}
                </p>

              </div>

            </div>


            {/* =================================================
                ACCOUNT STATUS
            ================================================= */}

            <div
              className="
                mt-4
                p-4

                rounded-2xl

                bg-emerald-50
                border
                border-emerald-200

                transition-all
                duration-300

                hover:border-emerald-400/60
              "
            >

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div
                    className="
                      w-9
                      h-9

                      rounded-xl

                      bg-white
                      border
                      border-emerald-200

                      flex
                      items-center
                      justify-center
                    "
                  >

                    <FaCheckCircle className="text-emerald-500" />

                  </div>

                  <div>

                    <p className="text-xs font-semibold text-slate-700">
                      Account Status
                    </p>

                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Your account is active
                    </p>

                  </div>

                </div>


                <span
                  className="
                    px-3
                    py-1

                    rounded-full

                    bg-emerald-100
                    border
                    border-emerald-200

                    text-emerald-600

                    text-[10px]
                    font-semibold
                  "
                >
                  Active
                </span>

              </div>

            </div>


            {/* =================================================
                BOTTOM GLOW
            ================================================= */}

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

        </div>

      </div>

    </div>
  );
}

export default Profile;