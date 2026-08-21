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
          if (item && typeof item === "object") {
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
        Same logic as Saved.jsx:
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


      const uniqueKey = `${normalizedType}-${String(id)}`;


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


    /*
      This catches changes made from another tab/window.
    */

    const handleStorageChange = () => {
      loadSavedCount();
    };


    window.addEventListener(
      "storage",
      handleStorageChange
    );


    /*
      Custom event catches save/unsave actions
      inside the same React application.
    */

    const handleSavedItemsChanged = () => {
      loadSavedCount();
    };


    window.addEventListener(
      "savedItemsChanged",
      handleSavedItemsChanged
    );


    /*
      Small refresh when dashboard becomes visible again.
    */

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
      icon: <FaUniversity size={24} />,
      color: "from-blue-500 to-cyan-400",
    },

    {
      title: "Eligible Schemes",
      value: "18",
      subtitle: "You qualify for",
      icon: <FaGraduationCap size={24} />,
      color: "from-emerald-500 to-green-400",
    },

    {
      title: "Applications",
      value: "07",
      subtitle: "Submitted by you",
      icon: <FaBriefcase size={24} />,
      color: "from-purple-500 to-pink-400",
    },

    {
      title: "Saved Schemes",
      value: savedCount,
      subtitle: "Saved for later",
      icon: <FaBookmark size={24} />,
      color: "from-amber-500 to-orange-400",
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
            bg-[#101d34]
            border border-blue-900/40
            rounded-2xl
            p-5
            transition-all
            duration-300
            hover:-translate-y-1
            hover:border-cyan-400/30
            hover:shadow-[0_0_25px_rgba(59,130,246,0.20)]
          "
        >

          <div className="flex items-center justify-between gap-4">

            {/* TEXT */}

            <div className="min-w-0">

              <p className="text-gray-300 text-sm sm:text-base font-medium truncate">
                {item.title}
              </p>


              <h2
                className={`
                  text-3xl
                  font-bold
                  mt-2
                  bg-gradient-to-r
                  ${item.color}
                  bg-clip-text
                  text-transparent
                `}
              >
                {item.value}
              </h2>


              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                {item.subtitle}
              </p>

            </div>


            {/* ICON */}

            <div
              className={`
                shrink-0
                w-12
                h-12
                rounded-xl
                bg-gradient-to-br
                ${item.color}
                flex
                items-center
                justify-center
                text-white
                shadow-lg
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
