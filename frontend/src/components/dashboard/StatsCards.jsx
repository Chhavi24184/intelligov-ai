import { useEffect, useState } from "react";

import {
  FaUniversity,
  FaGraduationCap,
  FaBriefcase,
  FaBookmark,
} from "react-icons/fa";


function StatsCards() {

  const [savedCount, setSavedCount] = useState(0);


  /* =========================================================
     CURRENT USER
  ========================================================= */

  const getCurrentUserKey = () => {

    const email = localStorage.getItem("userEmail");

    if (email) {
      return email.toLowerCase().trim();
    }

    return "guest";
  };


  /* =========================================================
     STORAGE KEYS
  ========================================================= */

  const getStorageKeys = () => {

    const userKey = getCurrentUserKey();

    return [
      `savedSchemes_${userKey}`,
      `savedJobs_${userKey}`,
      `savedInternships_${userKey}`,
      `savedScholarships_${userKey}`,
      `savedItems_${userKey}`,
    ];
  };


  /* =========================================================
     LOAD REAL SAVED COUNT
  ========================================================= */

  const loadSavedCount = () => {

    const keys = getStorageKeys();

    const allItems = [];


    keys.forEach((key) => {

      try {

        const data = localStorage.getItem(key);

        if (!data) return;

        const parsed = JSON.parse(data);

        if (!Array.isArray(parsed)) return;


        parsed.forEach((item) => {

          if (
            item &&
            typeof item === "object"
          ) {
            allItems.push(item);
          }

        });

      } catch (error) {

        console.error(
          `Unable to read saved items from ${key}:`,
          error
        );

      }

    });


    /* =======================================================
       REMOVE DUPLICATES
    ======================================================= */

    const uniqueItems = [];

    const seen = new Set();


    allItems.forEach((item, index) => {

      const id =
        item?._savedId ||
        item?.id ||
        item?.scheme_id ||
        item?.job_id ||
        item?.scholarship_id ||
        `${item?.name || item?.title || "item"}-${index}`;


      const type = String(
        item?._savedType ||
        item?.savedType ||
        item?.itemType ||
        item?.type ||
        item?.category ||
        ""
      )
        .toLowerCase()
        .trim();


      /*
        Internships + Jobs = Jobs category
      */

      let normalizedType = "scheme";


      if (
        type.includes("scholar") ||
        type.includes("fellowship") ||
        type.includes("grant")
      ) {

        normalizedType = "scholarship";

      }

      else if (
        type.includes("intern") ||
        type === "job" ||
        type.includes("jobs") ||
        type.includes("employment") ||
        type.includes("career") ||
        item?.job_id ||
        item?.jobId
      ) {

        normalizedType = "job";

      }

      else if (
        type.includes("scheme") ||
        type.includes("welfare") ||
        type.includes("government") ||
        item?.scheme_id ||
        item?.schemeId
      ) {

        normalizedType = "scheme";

      }


      const uniqueKey =
        `${normalizedType}-${String(id)}`;


      if (!seen.has(uniqueKey)) {

        seen.add(uniqueKey);

        uniqueItems.push(item);

      }

    });


    setSavedCount(uniqueItems.length);

  };


  /* =========================================================
     INITIAL LOAD + STORAGE LISTENER
  ========================================================= */

  useEffect(() => {

    loadSavedCount();


    const handleStorageChange = () => {
      loadSavedCount();
    };


    window.addEventListener(
      "storage",
      handleStorageChange
    );


    const handleSavedItemsChanged = () => {
      loadSavedCount();
    };


    window.addEventListener(
      "savedItemsChanged",
      handleSavedItemsChanged
    );


    const handleVisibilityChange = () => {

      if (!document.hidden) {
        loadSavedCount();
      }

    };


    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );


    return () => {

      window.removeEventListener(
        "storage",
        handleStorageChange
      );

      window.removeEventListener(
        "savedItemsChanged",
        handleSavedItemsChanged
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
      title: "Total Schemes",
      value: "126",
      subtitle: "Available for you",
      icon: <FaUniversity size={22} />,
      gradient: "from-blue-500 to-cyan-400",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },

    {
      title: "Eligible Schemes",
      value: "18",
      subtitle: "You qualify for",
      icon: <FaGraduationCap size={22} />,
      gradient: "from-emerald-500 to-green-400",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },

    {
      title: "Applications",
      value: "07",
      subtitle: "Submitted by you",
      icon: <FaBriefcase size={22} />,
      gradient: "from-purple-500 to-pink-400",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },

    {
      title: "Saved Schemes",
      value: savedCount,
      subtitle: "Saved for later",
      icon: <FaBookmark size={22} />,
      gradient: "from-amber-500 to-orange-400",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },

  ];


  /* =========================================================
     UI
  ========================================================= */

  return (

    <section
      className="
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-4
        gap-5
        mb-4
        w-full
      "
    >

      {stats.map((item, index) => (

        <div
          key={index}
          className="
            group
            w-full
            min-w-0
            bg-white/85
            backdrop-blur-xl
            border
            border-slate-200
            rounded-2xl
            p-5
            shadow-[0_8px_30px_rgba(15,23,42,0.06)]
            transition-all
            duration-300
            hover:-translate-y-1
            hover:shadow-[0_15px_35px_rgba(37,99,235,0.12)]
            hover:border-blue-200
          "
        >

          <div className="flex items-center justify-between gap-4">


            {/* =================================================
                TEXT
            ================================================= */}

            <div className="min-w-0">

              <p
                className="
                  text-slate-600
                  text-sm
                  sm:text-base
                  font-medium
                  truncate
                "
              >
                {item.title}
              </p>


              <h2
                className={`
                  text-3xl
                  font-bold
                  mt-2
                  bg-gradient-to-r
                  ${item.gradient}
                  bg-clip-text
                  text-transparent
                `}
              >
                {item.value}
              </h2>


              <p
                className="
                  text-slate-400
                  text-xs
                  sm:text-sm
                  mt-1
                "
              >
                {item.subtitle}
              </p>

            </div>


            {/* =================================================
                ICON
            ================================================= */}

            <div
              className={`
                shrink-0
                w-12
                h-12
                rounded-xl
                ${item.iconBg}
                ${item.iconColor}
                border
                border-slate-100
                flex
                items-center
                justify-center
                shadow-sm
                group-hover:scale-105
                transition-transform
                duration-300
              `}
            >
              {item.icon}
            </div>

          </div>

        </div>

      ))}

    </section>

  );
}


export default StatsCards;