import { useEffect, useState } from "react";

import {
  FaUniversity,
  FaGraduationCap,
  FaBriefcase,
  FaBookmark,
} from "react-icons/fa";

import api, { eligibilityAPI } from "../../services/api";


function StatsCards() {

  const [totalSchemes, setTotalSchemes] = useState(0);
  const [matchedSchemes, setMatchedSchemes] = useState(0);
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
     EXTRACT MATCHED SCHEMES
  ========================================================= */

  const extractMatchedSchemes = (data) => {

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.recommended_schemes)) {
      return data.recommended_schemes;
    }

    if (Array.isArray(data?.data?.recommended_schemes)) {
      return data.data.recommended_schemes;
    }

    if (Array.isArray(data?.schemes)) {
      return data.schemes;
    }

    if (Array.isArray(data?.data?.schemes)) {
      return data.data.schemes;
    }

    return [];

  };


  /* =========================================================
     LOAD MATCHED SCHEMES FOR CURRENT USER
  ========================================================= */

  const loadMatchedSchemes = async () => {

    const userKey = getCurrentUserKey();

    const eligibilityKey =
      `eligibilityData_${userKey}`;


    try {

      /*
        EligibilityChecker stores the user's
        profile and latest matched schemes here.
      */

      const savedData =
        localStorage.getItem(eligibilityKey);


      /*
        User has never checked eligibility.
      */

      if (!savedData) {

        setMatchedSchemes(0);

        return;

      }


      const parsedData =
        JSON.parse(savedData);


      const profile =
        parsedData?.formData;


      /*
        Make sure the saved profile is complete.
      */

      if (
        !profile ||
        !profile.age ||
        !profile.occupation ||
        !profile.gender ||
        profile.income === "" ||
        profile.income === undefined ||
        profile.income === null ||
        !profile.state
      ) {

        setMatchedSchemes(0);

        return;

      }


      /* =====================================================
         BUILD SAME PAYLOAD USED BY ELIGIBILITY CHECKER
      ===================================================== */

      const payload = {

        age: Number(profile.age),

        occupation: profile.occupation,

        gender: profile.gender,

        income: Number(profile.income),

        state: profile.state,

      };


      console.log(
        "Dashboard Matched Schemes Request:",
        payload
      );


      /* =====================================================
         CALL SAME ELIGIBILITY API
      ===================================================== */

      const response =
        await eligibilityAPI(payload);


      console.log(
        "Dashboard Matched Schemes Response:",
        response
      );


      /* =====================================================
         EXTRACT BACKEND RESULTS
      ===================================================== */

      const schemes =
        extractMatchedSchemes(response);


      /*
        Dashboard card now displays the REAL number
        returned by the eligibility backend.
      */

      setMatchedSchemes(schemes.length);


      /* =====================================================
         UPDATE SAVED ELIGIBILITY DATA
      ===================================================== */

      const updatedEligibilityData = {

        ...parsedData,

        formData: profile,

        schemes: schemes,

        checked: true,

        savedAt:
          parsedData?.savedAt ||
          new Date().toISOString(),

      };


      localStorage.setItem(

        eligibilityKey,

        JSON.stringify(
          updatedEligibilityData
        )

      );


    } catch (error) {

      console.error(
        "Unable to fetch matched schemes:",
        error
      );


      /* =====================================================
         FALLBACK TO LAST SAVED RESULTS
      ===================================================== */

      try {

        const savedData =
          localStorage.getItem(
            eligibilityKey
          );


        if (!savedData) {

          setMatchedSchemes(0);

          return;

        }


        const parsedData =
          JSON.parse(savedData);


        const savedSchemes =
          Array.isArray(parsedData?.schemes)
            ? parsedData.schemes
            : [];


        /*
          If API temporarily fails,
          keep displaying the last successful result.
        */

        setMatchedSchemes(
          savedSchemes.length
        );


      } catch (fallbackError) {

        console.error(
          "Unable to load saved matched schemes:",
          fallbackError
        );

        setMatchedSchemes(0);

      }

    }

  };


  /* =========================================================
     STORAGE KEYS FOR SAVED ITEMS
  ========================================================= */

  const getStorageKeys = () => {

    const userKey =
      getCurrentUserKey();


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

    try {

      const keys =
        getStorageKeys();


      const allItems = [];


      keys.forEach((key) => {

        try {

          const data =
            localStorage.getItem(key);


          if (!data) return;


          const parsed =
            JSON.parse(data);


          if (!Array.isArray(parsed)) {
            return;
          }


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


      /* =====================================================
         REMOVE DUPLICATES
      ===================================================== */

      const uniqueItems =
        new Map();


      allItems.forEach(
        (item, index) => {

          if (!item) return;


          const id =

            item?._savedId ||

            item?.id ||

            item?.scheme_id ||

            item?.job_id ||

            item?.scholarship_id ||

            item?.name ||

            item?.title ||

            `item-${index}`;


          /*
            Use category/type information only
            for distinguishing item groups.

            IMPORTANT:
            `_savedType: "scheme"` should NOT force
            every item to become a scheme.
          */

          const rawType = String(

            item?.savedType ||

            item?.itemType ||

            item?.type ||

            item?.category ||

            ""

          )
            .toLowerCase()
            .trim();


          let normalizedType =
            "scheme";


          /* =================================================
             SCHOLARSHIPS
          ================================================= */

          if (

            rawType.includes("scholar") ||

            rawType.includes("fellowship") ||

            rawType.includes("grant")

          ) {

            normalizedType =
              "scholarship";

          }


          /* =================================================
             JOBS + INTERNSHIPS
          ================================================= */

          else if (

            rawType.includes("intern") ||

            rawType === "job" ||

            rawType.includes("jobs") ||

            rawType.includes("employment") ||

            rawType.includes("career") ||

            item?.job_id ||

            item?.jobId

          ) {

            normalizedType =
              "job";

          }


          /* =================================================
             GOVERNMENT SCHEMES
          ================================================= */

          else if (

            rawType.includes("scheme") ||

            rawType.includes("welfare") ||

            rawType.includes("government") ||

            item?.scheme_id ||

            item?.schemeId

          ) {

            normalizedType =
              "scheme";

          }


          const uniqueKey =
            `${normalizedType}-${String(id)}`;


          if (
            !uniqueItems.has(uniqueKey)
          ) {

            uniqueItems.set(
              uniqueKey,
              item
            );

          }

        }
      );


      setSavedCount(
        uniqueItems.size
      );


    } catch (error) {

      console.error(
        "Unable to load saved count:",
        error
      );

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
      title: "Total Schemes",

      value: totalSchemes,

      subtitle: "Available for you",

      icon:
        <FaUniversity size={22} />,

      gradient:
        "from-blue-500 to-cyan-400",

      iconBg:
        "bg-blue-50",

      iconColor:
        "text-blue-600",
    },


    {
      title: "Matched Schemes",

      value: matchedSchemes,

      subtitle: "Matched with your profile",

      icon:
        <FaGraduationCap size={22} />,

      gradient:
        "from-emerald-500 to-green-400",

      iconBg:
        "bg-emerald-50",

      iconColor:
        "text-emerald-600",
    },

    {
      title: "Saved Schemes",

      value: savedCount,

      subtitle: "Saved for later",

      icon:
        <FaBookmark size={22} />,

      gradient:
        "from-amber-500 to-orange-400",

      iconBg:
        "bg-amber-50",

      iconColor:
        "text-amber-600",
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
        lg:grid-cols-3
        gap-5
        mb-4
        w-full
      "
    >

      {stats.map(
        (item, index) => (

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

            <div
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >

              {/* TEXT */}

              <div
                className="
                  min-w-0
                "
              >

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


              {/* ICON */}

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

        )
      )}

    </section>

  );

}


export default StatsCards;