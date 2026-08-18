import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaBookmark,
  FaBriefcase,
  FaGraduationCap,
  FaClipboardList,
  FaRegBookmark,
} from "react-icons/fa";

function Saved() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("schemes");

  // Temporary saved data.
  // Later this will be connected to the actual saved-items system.
  const savedItems = {
    schemes: [],
    jobs: [],
    scholarships: [],
  };

  const tabs = [
    {
      id: "schemes",
      label: "Schemes",
      icon: <FaClipboardList />,
    },
    {
      id: "jobs",
      label: "Jobs & Internships",
      icon: <FaBriefcase />,
    },
    {
      id: "scholarships",
      label: "Scholarships",
      icon: <FaGraduationCap />,
    },
  ];

  const getActiveItems = () => {
    return savedItems[activeTab] || [];
  };

  const getActiveTitle = () => {
    if (activeTab === "schemes") {
      return "Saved Schemes";
    }

    if (activeTab === "jobs") {
      return "Saved Jobs & Internships";
    }

    return "Saved Scholarships";
  };

  const getActiveDescription = () => {
    if (activeTab === "schemes") {
      return "Government schemes you have saved";
    }

    if (activeTab === "jobs") {
      return "Jobs and internships you have saved";
    }

    return "Scholarships you have saved";
  };

  const activeItems = getActiveItems();

  return (
    <div className="min-h-screen bg-[#060c17] text-white overflow-hidden">

      {/* ================= BACKGROUND GLOW ================= */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">

        <div className="absolute top-[-150px] left-[-150px] w-[450px] h-[450px] rounded-full bg-blue-600/10 blur-[150px]" />

        <div className="absolute top-[35%] right-[-150px] w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[150px]" />

        <div className="absolute bottom-[-150px] left-1/3 w-[500px] h-[300px] rounded-full bg-indigo-600/10 blur-[150px]" />

      </div>


      {/* ================= MAIN CONTENT ================= */}

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 pb-8">


        {/* =====================================================
            TOP HEADER
            Back button LEFT + Heading CENTER
        ===================================================== */}

        <div className="relative min-h-[52px] flex items-center justify-center mb-5">

          {/* Back Button */}

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="
              absolute
              left-0
              top-1/6
              -translate-y-1/2
              inline-flex
              items-center
              gap-2
              px-3
              py-1.5
              rounded-lg
              bg-[#081224]
              border
              border-blue-900/40
              text-slate-400
              text-xs
              font-medium
              hover:text-white
              hover:border-cyan-400/40
              hover:bg-blue-900/20
              transition-all
              duration-300
            "
          >
            <FaArrowLeft className="text-[9px]" />
            <span>Back</span>
          </button>


          {/* Center Heading */}

          <div className="text-center">

            <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/25 text-cyan-300 text-[11px] font-semibold mb-2">

              <FaBookmark className="text-cyan-400 text-[10px]" />

              Your Saved Items

            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">

              Saved{" "}

              <span className="bg-gradient-to-r from-cyan-300 via-white to-blue-400 bg-clip-text text-transparent">
                Items
              </span>

            </h1>

          </div>

        </div>


        {/* =====================================================
            DESCRIPTION
        ===================================================== */}

        <p className="text-center text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mb-6">

          Keep your important government schemes, career opportunities and
          scholarships in one place for easy access.

        </p>


        {/* =====================================================
            CATEGORY SLIDER
        ===================================================== */}

        <div className="mb-7 flex justify-center">

          <div
            className="
              inline-flex
              max-w-full
              overflow-x-auto
              p-1
              rounded-2xl
              bg-[#081224]/90
              border
              border-blue-900/40
              backdrop-blur-xl
              shadow-xl
              shadow-black/20
              scrollbar-thin
            "
          >

            <div className="flex min-w-max gap-1">

              {tabs.map((tab) => {

                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex
                      items-center
                      justify-center
                      gap-2
                      px-5
                      sm:px-7
                      py-3
                      rounded-xl
                      text-xs
                      sm:text-sm
                      font-semibold
                      whitespace-nowrap
                      transition-all
                      duration-300

                      ${
                        isActive
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "text-slate-400 hover:text-white hover:bg-blue-900/20"
                      }
                    `}
                  >

                    <span className="text-sm">
                      {tab.icon}
                    </span>

                    <span>
                      {tab.label}
                    </span>

                  </button>
                );

              })}

            </div>

          </div>

        </div>


        {/* =====================================================
            ACTIVE SECTION HEADING
        ===================================================== */}

        <div className="text-center mb-6">

          <h2 className="text-xl sm:text-2xl font-bold text-white">

            {getActiveTitle()}

          </h2>

          <p className="text-xs text-slate-500 mt-1">

            {getActiveDescription()}

          </p>

        </div>


        {/* =====================================================
            SAVED ITEMS
        ===================================================== */}

        {activeItems.length > 0 ? (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {activeItems.map((item, index) => (

              <div
                key={index}
                className="
                  group
                  relative
                  bg-[#081224]/80
                  backdrop-blur-xl
                  border
                  border-blue-900/40
                  rounded-3xl
                  p-6
                  hover:border-cyan-400/40
                  hover:-translate-y-1
                  hover:shadow-xl
                  hover:shadow-blue-950/30
                  transition-all
                  duration-300
                "
              >

                <div className="flex items-start justify-between gap-3 mb-5">

                  <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">

                    <FaBookmark className="text-cyan-400" />

                  </div>

                  <button
                    type="button"
                    className="w-9 h-9 rounded-xl bg-[#0b1528] border border-blue-900/40 flex items-center justify-center text-amber-400"
                  >
                    <FaBookmark />
                  </button>

                </div>

                <h3 className="text-lg font-bold text-white mb-2">
                  {item.title || item.name}
                </h3>

                <p className="text-sm text-slate-400 leading-relaxed">
                  {item.description || "Saved item details will appear here."}
                </p>

              </div>

            ))}

          </div>

        ) : (

          /* ================= EMPTY STATE ================= */

          <div
            className="
              max-w-2xl
              mx-auto
              rounded-3xl
              bg-[#081224]/70
              backdrop-blur-xl
              border
              border-blue-900/40
              p-8
              sm:p-12
              text-center
              shadow-xl
              shadow-black/20
            "
          >

            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">

              <FaRegBookmark className="text-cyan-400 text-xl" />

            </div>


            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">

              No Saved{" "}

              {activeTab === "schemes"
                ? "Schemes"
                : activeTab === "jobs"
                ? "Jobs or Internships"
                : "Scholarships"}{" "}

              Yet

            </h3>


            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">

              {activeTab === "schemes"
                ? "When you find a government scheme you want to revisit, save it and it will appear here."
                : activeTab === "jobs"
                ? "Save interesting jobs and internships to easily find them later."
                : "Save scholarships that interest you and access them quickly whenever you need."}

            </p>

          </div>

        )}

      </main>

    </div>
  );
}

export default Saved;

