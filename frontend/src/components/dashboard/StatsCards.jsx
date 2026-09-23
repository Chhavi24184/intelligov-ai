import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaUniversity,
  FaGraduationCap,
  FaBookmark,
  FaArrowRight,
} from "react-icons/fa";

import api, { eligibilityByProfileAPI, getSavedSchemesAPI } from "../../services/api";


function StatsCards() {

  const navigate = useNavigate();

  const [totalSchemes, setTotalSchemes] = useState(0);
  const [matchedSchemes, setMatchedSchemes] = useState(0);
  const [savedCount, setSavedCount] = useState(0);


  /* =========================================================
     LOAD REAL TOTAL SCHEMES COUNT
  ========================================================= */

  const loadTotalSchemes = async () => {

    try {

      const response = await api.get("/schemes");

      const data = response?.data;


      if (Array.isArray(data)) {

        setTotalSchemes(data.length);

      }

      else if (Array.isArray(data?.schemes)) {

        setTotalSchemes(data.schemes.length);

      }

      else if (Array.isArray(data?.data)) {

        setTotalSchemes(data.data.length);

      }

      else {

        setTotalSchemes(0);

      }

    } catch (error) {

      console.error(
        "Unable to fetch total schemes:",
        error
      );

      setTotalSchemes(0);

    }

  };


  /* =========================================================
     LOAD MATCHED SCHEMES — calls /eligibility/by-profile
     which reads the user's DB profile and runs eligibility.
  ========================================================= */

  const loadMatchedSchemes = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) { setMatchedSchemes(0); return; }

    try {
      const response = await eligibilityByProfileAPI(userId);
      const schemes = response?.data?.recommended_schemes;
      setMatchedSchemes(Array.isArray(schemes) ? schemes.length : 0);
    } catch {
      setMatchedSchemes(0);
    }
  };


  /* =========================================================
     LOAD SAVED COUNT FROM DB
  ========================================================= */

  const loadSavedCount = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) { setSavedCount(0); return; }
    try {
      const data = await getSavedSchemesAPI(userId);
      const schemes = data?.schemes || [];
      setSavedCount(schemes.length);
    } catch {
      setSavedCount(0);
    }
  };


  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {

    loadTotalSchemes();

    loadMatchedSchemes();

    loadSavedCount();


    /* =======================================================
       STORAGE CHANGE
    ======================================================= */

    const handleStorageChange = () => {

      loadMatchedSchemes();

      loadSavedCount();

    };


    window.addEventListener(
      "storage",
      handleStorageChange
    );


    /* =======================================================
       SAVED ITEMS CHANGE
    ======================================================= */

    const handleSavedItemsChanged = () => {

      loadSavedCount();

    };


    window.addEventListener(
      "savedItemsChanged",
      handleSavedItemsChanged
    );


    /* =======================================================
       ELIGIBILITY UPDATE
    ======================================================= */

    const handleEligibilityUpdated = () => {

      loadMatchedSchemes();

    };


    window.addEventListener(
      "eligibilityUpdated",
      handleEligibilityUpdated
    );


    /* =======================================================
       VISIBILITY CHANGE
    ======================================================= */

    const handleVisibilityChange = () => {

      if (
        document.visibilityState === "visible"
      ) {

        loadTotalSchemes();

        loadMatchedSchemes();

        loadSavedCount();

      }

    };


    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );


    /* =======================================================
       CLEANUP
    ======================================================= */

    return () => {

      window.removeEventListener(
        "storage",
        handleStorageChange
      );

      window.removeEventListener(
        "savedItemsChanged",
        handleSavedItemsChanged
      );

      window.removeEventListener(
        "eligibilityUpdated",
        handleEligibilityUpdated
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

    };

  }, []);


  /* =========================================================
     DASHBOARD STATS
  ========================================================= */

  const stats = [
    {
      title:     "Total Schemes",
      value:     totalSchemes,
      subtitle:  "Browse all schemes",
      link:      "/schemes",
      linkLabel: "Explore →",
      icon:      <FaUniversity size={22} />,
      gradient:  "from-blue-500 to-cyan-400",
      iconBg:    "bg-blue-50",
      iconColor: "text-blue-600",
      hoverBorder: "hover:border-blue-300",
      hoverShadow: "hover:shadow-[0_15px_35px_rgba(37,99,235,0.13)]",
    },
    {
      title:     "Matched Schemes",
      value:     matchedSchemes,
      subtitle:  "Check your eligibility",
      link:      "/eligibility",
      linkLabel: "Check now →",
      icon:      <FaGraduationCap size={22} />,
      gradient:  "from-emerald-500 to-green-400",
      iconBg:    "bg-emerald-50",
      iconColor: "text-emerald-600",
      hoverBorder: "hover:border-emerald-300",
      hoverShadow: "hover:shadow-[0_15px_35px_rgba(16,185,129,0.13)]",
    },
    {
      title:     "Saved Schemes",
      value:     savedCount,
      subtitle:  "Your saved opportunities",
      link:      "/dashboard#saved",
      linkLabel: "View saved →",
      icon:      <FaBookmark size={22} />,
      gradient:  "from-amber-500 to-orange-400",
      iconBg:    "bg-amber-50",
      iconColor: "text-amber-600",
      hoverBorder: "hover:border-amber-300",
      hoverShadow: "hover:shadow-[0_15px_35px_rgba(245,158,11,0.13)]",
    },
  ];


  /* =========================================================
     UI
  ========================================================= */

  return (

    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-4 w-full">

      {stats.map((item, index) => (

        <button
          key={index}
          type="button"
          onClick={() => {
            if (item.link === "/dashboard#saved") {
              // Scroll to the Saved Opportunities section on the same page
              const el = document.getElementById("saved-opportunities");
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
              } else {
                navigate("/dashboard");
              }
            } else {
              navigate(item.link);
            }
          }}
          className={`
            group
            w-full
            min-w-0
            text-left
            bg-white/85
            backdrop-blur-xl
            border border-slate-200
            rounded-2xl
            p-5
            shadow-[0_8px_30px_rgba(15,23,42,0.06)]
            transition-all duration-300
            hover:-translate-y-1
            cursor-pointer
            ${item.hoverBorder}
            ${item.hoverShadow}
          `}
        >

          <div className="flex items-center justify-between gap-4">

            {/* TEXT */}
            <div className="min-w-0">

              <p className="text-slate-600 text-sm sm:text-base font-medium truncate">
                {item.title}
              </p>

              <h2
                className={`text-3xl font-bold mt-2 bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}
              >
                {item.value}
              </h2>

              <p className="text-slate-400 text-xs sm:text-sm mt-1 flex items-center gap-1">
                {item.subtitle}
                <FaArrowRight className="text-[9px] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
              </p>

            </div>

            {/* ICON */}
            <div
              className={`
                shrink-0 w-12 h-12 rounded-xl
                ${item.iconBg} ${item.iconColor}
                border border-slate-100
                flex items-center justify-center
                shadow-sm
                group-hover:scale-110
                transition-transform duration-300
              `}
            >
              {item.icon}
            </div>

          </div>

        </button>

      ))}

    </section>

  );

}


export default StatsCards;