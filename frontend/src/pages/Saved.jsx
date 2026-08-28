import { useEffect, useMemo, useState } from "react";
import {
  FaBookmark,
  FaArrowLeft,
  FaExternalLinkAlt,
  FaTimes,
  FaFileAlt,
  FaBriefcase,
  FaGraduationCap,
  FaCheckCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Saved() {
  const navigate = useNavigate();

  const [savedItems, setSavedItems] = useState([]);
  const [activeTab, setActiveTab] = useState("schemes");
  const [selectedItem, setSelectedItem] = useState(null);

  // =========================================================
  // CURRENT USER
  // =========================================================

  const getCurrentUserKey = () => {
    const email = localStorage.getItem("userEmail");

    if (email) {
      return email.toLowerCase().trim();
    }

    return "guest";
  };

  // =========================================================
  // STORAGE KEYS
  // =========================================================

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

  // =========================================================
  // NORMALIZE TYPE
  // =========================================================

  const getItemType = (item) => {
    const explicitType = String(
      item?._savedType ||
        item?.savedType ||
        item?.itemType ||
        item?.type ||
        item?.category ||
        ""
    )
      .toLowerCase()
      .trim();

    // Scholarship
    if (
      explicitType.includes("scholar") ||
      explicitType.includes("fellowship") ||
      explicitType.includes("grant")
    ) {
      return "scholarships";
    }

    // Internship
    if (
      explicitType.includes("intern") ||
      item?._savedType === "internship"
    ) {
      return "jobs";
    }

    // Job
    if (
      explicitType === "job" ||
      explicitType.includes("jobs") ||
      explicitType.includes("employment") ||
      explicitType.includes("career") ||
      item?.job_id ||
      item?.jobId
    ) {
      return "jobs";
    }

    // Scheme
    if (
      explicitType.includes("scheme") ||
      explicitType.includes("welfare") ||
      explicitType.includes("government") ||
      item?.scheme_id ||
      item?.schemeId
    ) {
      return "schemes";
    }

    // Fallback using name/title
    const text = String(
      item?._savedName ||
        item?.name ||
        item?.title ||
        item?.scheme_name ||
        item?.job_title ||
        ""
    ).toLowerCase();

    if (
      text.includes("scholarship") ||
      text.includes("fellowship") ||
      text.includes("grant")
    ) {
      return "scholarships";
    }

    if (
      text.includes("internship") ||
      text.includes("intern") ||
      text.includes("job") ||
      text.includes("developer") ||
      text.includes("engineer") ||
      text.includes("analyst") ||
      text.includes("manager") ||
      text.includes("employment")
    ) {
      return "jobs";
    }

    return "schemes";
  };

  // =========================================================
  // GET NAME
  // =========================================================

  const getName = (item) =>
    item?._savedName ||
    item?.name ||
    item?.title ||
    item?.scheme_name ||
    item?.job_title ||
    item?.jobTitle ||
    "Saved Item";

  // =========================================================
  // GET DESCRIPTION
  // =========================================================

  const getDescription = (item) =>
    item?._savedDescription ||
    item?.description ||
    item?.details ||
    item?.summary ||
    "No description available.";

  // =========================================================
  // GET CATEGORY
  // =========================================================

  const getCategory = (item) => {
    const type = getItemType(item);

    if (type === "schemes") {
      return (
        item?._savedCategory ||
        item?.category ||
        item?.scheme_type ||
        "Government Scheme"
      );
    }

    if (type === "scholarships") {
      return (
        item?._savedCategory ||
        item?.category ||
        "Scholarship"
      );
    }

    return (
      item?._savedCategory ||
      item?.category ||
      item?.job_type ||
      "Job / Internship"
    );
  };

  // =========================================================
  // GET ELIGIBILITY
  // =========================================================

  const getEligibility = (item) =>
    item?.eligibility ||
    item?.eligibility_criteria ||
    item?.requirements ||
    "Eligibility details are available on the official portal.";

  // =========================================================
  // GET DOCUMENTS
  // =========================================================

  const getDocuments = (item) => {
    if (Array.isArray(item?.documents_required)) {
      return item.documents_required;
    }

    if (Array.isArray(item?.documents)) {
      return item.documents;
    }

    if (item?.documents_required) {
      return [item.documents_required];
    }

    if (item?.documents) {
      return [item.documents];
    }

    return [
      "Aadhaar Card",
      "Identity Proof",
      "Relevant Certificates",
      "Bank Details",
    ];
  };

  // =========================================================
  // GET APPLY URL
  // =========================================================

  const getApplyUrl = (item) => {
    return (
      item?.apply_url ||
      item?.application_url ||
      item?.applyUrl ||
      item?.url ||
      item?.link ||
      item?.official_url ||
      "https://www.myscheme.gov.in/"
    );
  };

  // =========================================================
  // LOAD ALL SAVED ITEMS
  // =========================================================

  const loadSavedItems = () => {
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
        console.error(`Unable to read ${key}:`, error);
      }
    });

    // Remove duplicates
    const uniqueItems = [];
    const seen = new Set();

    allItems.forEach((item, index) => {
      const id =
        item?._savedId ||
        item?.id ||
        item?.scheme_id ||
        item?.job_id ||
        item?.scholarship_id ||
        `${getName(item)}-${index}`;

      const type = getItemType(item);

      const uniqueKey = `${type}-${String(id)}`;

      if (!seen.has(uniqueKey)) {
        seen.add(uniqueKey);
        uniqueItems.push(item);
      }
    });

    setSavedItems(uniqueItems);
  };

  // =========================================================
  // LOAD + LISTEN
  // =========================================================

  useEffect(() => {
    loadSavedItems();

    const handleStorageChange = () => {
      loadSavedItems();
    };

    const handleSavedItemsChanged = () => {
      loadSavedItems();
    };

    window.addEventListener("storage", handleStorageChange);

    window.addEventListener(
      "savedItemsChanged",
      handleSavedItemsChanged
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
    };
  }, []);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredItems = useMemo(() => {
    return savedItems.filter(
      (item) => getItemType(item) === activeTab
    );
  }, [savedItems, activeTab]);

  // =========================================================
  // COUNTS
  // =========================================================

  const schemeCount = savedItems.filter(
    (item) => getItemType(item) === "schemes"
  ).length;

  const jobCount = savedItems.filter(
    (item) => getItemType(item) === "jobs"
  ).length;

  const scholarshipCount = savedItems.filter(
    (item) => getItemType(item) === "scholarships"
  ).length;

  // =========================================================
  // REMOVE ITEM
  // =========================================================

  const removeItem = (itemToRemove) => {
    const itemId =
      itemToRemove?._savedId ||
      itemToRemove?.id ||
      itemToRemove?.scheme_id ||
      itemToRemove?.job_id ||
      itemToRemove?.scholarship_id;

    const itemType = getItemType(itemToRemove);

    const keys = getStorageKeys();

    keys.forEach((key) => {
      try {
        const data = localStorage.getItem(key);

        if (!data) return;

        const parsed = JSON.parse(data);

        if (!Array.isArray(parsed)) return;

        const updated = parsed.filter((item) => {
          const currentId =
            item?._savedId ||
            item?.id ||
            item?.scheme_id ||
            item?.job_id ||
            item?.scholarship_id;

          const currentType = getItemType(item);

          return !(
            String(currentId) === String(itemId) &&
            currentType === itemType
          );
        });

        localStorage.setItem(
          key,
          JSON.stringify(updated)
        );
      } catch (error) {
        console.error(
          "Unable to remove saved item:",
          error
        );
      }
    });

    setSavedItems((prev) =>
      prev.filter((item) => {
        const currentId =
          item?._savedId ||
          item?.id ||
          item?.scheme_id ||
          item?.job_id ||
          item?.scholarship_id;

        return !(
          String(currentId) === String(itemId) &&
          getItemType(item) === itemType
        );
      })
    );

    setSelectedItem(null);

    window.dispatchEvent(
      new Event("savedItemsChanged")
    );
  };

  // =========================================================
  // TAB CONFIG
  // =========================================================

  const tabs = [
    {
      id: "schemes",
      label: "Schemes",
      count: schemeCount,
      icon: <FaFileAlt />,
    },
    {
      id: "jobs",
      label: "Jobs & Internships",
      count: jobCount,
      icon: <FaBriefcase />,
    },
    {
      id: "scholarships",
      label: "Scholarships",
      count: scholarshipCount,
      icon: <FaGraduationCap />,
    },
  ];

  // =========================================================
  // EMPTY MESSAGES
  // =========================================================

  const emptyMessages = {
    schemes:
      "You haven't saved any government schemes yet.",
    jobs:
      "You haven't saved any jobs or internships yet.",
    scholarships:
      "You haven't saved any scholarships yet.",
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-white text-slate-900">

      <section className="relative min-h-screen bg-gradient-to-b from-white via-sky-50/40 to-white overflow-hidden">

        {/* =====================================================
            BACKGROUND LIGHTS
        ===================================================== */}

        <div className="absolute inset-0 pointer-events-none">

          <div
            className="
              absolute
              top-10
              left-[-150px]
              w-[420px]
              h-[420px]
              bg-sky-400/10
              rounded-full
              blur-3xl
            "
          />

          <div
            className="
              absolute
              top-[420px]
              right-[-150px]
              w-[420px]
              h-[420px]
              bg-blue-400/10
              rounded-full
              blur-3xl
            "
          />

          <div
            className="
              absolute
              bottom-0
              left-1/2
              -translate-x-1/2
              w-[500px]
              h-[220px]
              bg-sky-300/10
              rounded-full
              blur-3xl
            "
          />

        </div>

        {/* =====================================================
            MAIN CONTAINER
        ===================================================== */}

        <div className="relative max-w-7xl mx-auto px-6 py-8 lg:py-12">

          {/* ===================================================
              BACK BUTTON
          =================================================== */}

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              rounded-xl

              bg-white
              border border-sky-200
              text-slate-500

              hover:text-sky-600
              hover:border-sky-400
              hover:-translate-x-1

              shadow-sm
              transition-all
              duration-300

              text-xs
              font-semibold
            "
          >
            <FaArrowLeft className="text-[10px]" />

            Back to Dashboard
          </button>

          {/* ===================================================
              HEADER
          =================================================== */}

          <div className="text-center max-w-3xl mx-auto mt-8 mb-10">

            <div
              className="
                inline-flex
                items-center
                gap-2
                px-4
                py-1.5
                rounded-full

                bg-sky-50
                border border-sky-200

                text-sky-600
                text-xs
                font-semibold
                uppercase
                tracking-wider

                shadow-sm
              "
            >
              <FaBookmark />

              Your Saved Items
            </div>

            <h1
              className="
                text-3xl
                sm:text-4xl
                lg:text-5xl

                font-black
                tracking-tight

                text-slate-900

                mt-5
              "
            >
              Your Saved{" "}

              <span
                className="
                  bg-gradient-to-r
                  from-sky-500
                  to-blue-600
                  bg-clip-text
                  text-transparent
                "
              >
                Opportunities
              </span>
            </h1>

            <p
              className="
                text-slate-600
                text-sm
                sm:text-base
                mt-4
                max-w-2xl
                mx-auto
                leading-relaxed
              "
            >
              Keep track of government schemes, jobs,
              internships, and scholarships you want to
              explore later.
            </p>

          </div>

          {/* ===================================================
              TABS
          =================================================== */}

          <div className="max-w-4xl mx-auto mb-10">

            <div
              className="
                grid
                grid-cols-3
                gap-1

                bg-white
                border border-sky-200

                rounded-2xl
                p-1.5

                shadow-sm
              "
            >

              {tabs.map((tab) => (

                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(tab.id)
                  }
                  className={`
                    relative

                    flex
                    items-center
                    justify-center
                    gap-2

                    px-3
                    py-3

                    rounded-xl

                    text-xs
                    sm:text-sm
                    font-semibold

                    transition-all
                    duration-300

                    ${
                      activeTab === tab.id
                        ? `
                          bg-gradient-to-r
                          from-sky-500
                          to-blue-600
                          text-white
                          shadow-md
                          shadow-sky-200
                        `
                        : `
                          text-slate-500
                          hover:text-sky-600
                          hover:bg-sky-50
                        `
                    }
                  `}
                >

                  <span className="hidden sm:inline">
                    {tab.icon}
                  </span>

                  <span className="truncate">
                    {tab.label}
                  </span>

                  <span
                    className={`
                      min-w-[21px]
                      h-5
                      px-1.5
                      rounded-full
                      flex
                      items-center
                      justify-center
                      text-[10px]

                      ${
                        activeTab === tab.id
                          ? "bg-white/20 text-white"
                          : "bg-sky-50 text-slate-500"
                      }
                    `}
                  >
                    {tab.count}
                  </span>

                </button>

              ))}

            </div>

          </div>

          {/* ===================================================
              SAVED CARDS
          =================================================== */}

          {filteredItems.length > 0 ? (

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                lg:grid-cols-3
                gap-6
                lg:gap-8
              "
            >

              {filteredItems.map((item, index) => {

                const type = getItemType(item);

                return (

                  <div
                    key={`${type}-${item?._savedId || index}`}
                    className="
                      glass-card

                      p-7

                      rounded-3xl
                      relative

                      flex
                      flex-col
                      justify-between

                      group

                      border
                      border-sky-200/70

                      transition-all
                      duration-500
                      ease-[cubic-bezier(0.22,1,0.36,1)]

                      hover:border-sky-400/60
                      hover:-translate-y-2
                    "
                  >

                    {/* =================================================
                        HOVER GLOW
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
                          CATEGORY + REMOVE
                      ================================================= */}

                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-3
                          mb-6
                        "
                      >

                        <span
                          className="
                            px-3
                            py-1.5

                            rounded-full

                            bg-sky-50
                            border border-sky-200

                            text-slate-600

                            text-[11px]
                            font-medium

                            group-hover:border-sky-400/60
                            group-hover:text-sky-600

                            transition-all
                            duration-300
                          "
                        >
                          {getCategory(item)}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(item)
                          }
                          className="
                            w-9
                            h-9
                            rounded-xl

                            bg-sky-50
                            border border-sky-200

                            flex
                            items-center
                            justify-center

                            text-sky-500

                            hover:text-red-500
                            hover:border-red-300
                            hover:bg-red-50
                            hover:scale-110

                            transition-all
                            duration-300
                          "
                          title="Remove from saved"
                        >
                          <FaBookmark />
                        </button>

                      </div>

                      {/* =================================================
                          ICON
                      ================================================= */}

                      <div
                        className="
                          w-12
                          h-12

                          rounded-2xl

                          bg-sky-50
                          border border-sky-200

                          flex
                          items-center
                          justify-center

                          mb-5

                          group-hover:border-sky-400/60
                          group-hover:scale-110
                          group-hover:-rotate-2

                          transition-all
                          duration-500
                        "
                      >

                        {type === "scholarships" ? (

                          <FaGraduationCap
                            className="text-xl text-sky-500"
                          />

                        ) : type === "jobs" ? (

                          <FaBriefcase
                            className="text-xl text-sky-500"
                          />

                        ) : (

                          <FaFileAlt
                            className="text-xl text-sky-500"
                          />

                        )}

                      </div>

                      {/* =================================================
                          TITLE
                      ================================================= */}

                      <h3
                        className="
                          text-xl
                          font-bold
                          text-slate-900

                          leading-snug

                          mb-3

                          group-hover:text-sky-600

                          transition-colors
                          duration-300
                        "
                      >
                        {getName(item)}
                      </h3>

                      {/* =================================================
                          DESCRIPTION
                      ================================================= */}

                      <p
                        className="
                          text-sm
                          text-slate-600
                          leading-relaxed

                          line-clamp-3
                        "
                      >
                        {getDescription(item)}
                      </p>

                    </div>

                    {/* =================================================
                        FOOTER
                    ================================================= */}

                    <div
                      className="
                        relative
                        z-10

                        mt-6
                        pt-5

                        border-t
                        border-sky-100

                        flex
                        items-center
                        justify-between
                      "
                    >

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedItem(item)
                        }
                        className="
                          inline-flex
                          items-center
                          gap-2

                          text-sm
                          font-semibold

                          text-sky-600

                          hover:text-blue-600
                          hover:translate-x-1

                          transition-all
                          duration-300
                        "
                      >
                        View Details

                        <span
                          className="
                            transition-transform
                            duration-300

                            group-hover:translate-x-1
                          "
                        >
                          →
                        </span>
                      </button>

                      <span
                        className="
                          text-[10px]
                          text-slate-400
                          font-medium
                        "
                      >
                        #{String(index + 1).padStart(2, "0")}
                      </span>

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

                );
              })}

            </div>

          ) : (

            /* =================================================
               EMPTY STATE
            ================================================= */

            <div
              className="
                max-w-md
                mx-auto
                py-16
                text-center
              "
            >

              <div
                className="
                  w-16
                  h-16
                  mx-auto
                  mb-5

                  rounded-2xl

                  bg-sky-50
                  border border-sky-200

                  flex
                  items-center
                  justify-center

                  shadow-sm
                "
              >

                <FaBookmark
                  className="
                    text-2xl
                    text-sky-300
                  "
                />

              </div>

              <h3
                className="
                  text-xl
                  font-bold
                  text-slate-900
                  mb-2
                "
              >
                Nothing Saved Yet
              </h3>

              <p
                className="
                  text-sm
                  text-slate-500
                  leading-relaxed
                  mb-6
                "
              >
                {emptyMessages[activeTab]}
              </p>

              <button
                type="button"
                onClick={() => {
                  if (activeTab === "schemes") {
                    navigate("/schemes");
                  } else {
                    navigate("/dashboard");
                  }
                }}
                className="
                  px-6
                  py-3
                  rounded-xl

                  bg-gradient-to-r
                  from-sky-500
                  to-blue-600

                  text-white
                  text-sm
                  font-semibold

                  shadow-md
                  shadow-sky-200

                  hover:scale-[1.03]
                  hover:shadow-lg
                  hover:shadow-sky-200

                  transition-all
                  duration-300
                "
              >
                Explore Now
              </button>

            </div>

          )}

        </div>

      </section>

      {/* =========================================================
          DETAILS MODAL
      ========================================================= */}

      {selectedItem && (

        <div
          className="
            fixed
            inset-0
            z-50

            bg-slate-900/30
            backdrop-blur-md

            flex
            items-center
            justify-center

            p-4
          "
          onClick={() =>
            setSelectedItem(null)
          }
        >

          <div
            className="
              w-full
              max-w-2xl
              max-h-[88vh]

              overflow-y-auto

              bg-white

              border
              border-sky-200

              rounded-3xl

              shadow-2xl
              shadow-sky-900/10
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div
              className="
                sticky
                top-0
                z-10

                bg-white/95
                backdrop-blur-xl

                p-6

                border-b
                border-sky-100
              "
            >

              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                "
              >

                <div>

                  <span
                    className="
                      inline-block

                      px-3
                      py-1

                      rounded-full

                      bg-sky-50
                      border border-sky-200

                      text-sky-600

                      text-xs
                      font-semibold
                    "
                  >
                    {getCategory(selectedItem)}
                  </span>

                  <h2
                    className="
                      text-2xl
                      sm:text-3xl

                      font-black

                      text-slate-900

                      mt-3
                    "
                  >
                    {getName(selectedItem)}
                  </h2>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedItem(null)
                  }
                  className="
                    w-10
                    h-10
                    rounded-xl

                    bg-sky-50
                    border border-sky-200

                    text-slate-400

                    hover:text-sky-600
                    hover:border-sky-400

                    flex
                    items-center
                    justify-center

                    shrink-0

                    transition-all
                    duration-300
                  "
                >
                  <FaTimes />
                </button>

              </div>

            </div>

            {/* =================================================
                MODAL CONTENT
            ================================================= */}

            <div className="p-6 space-y-7">

              {/* Overview */}

              <div>

                <h4
                  className="
                    text-xs
                    uppercase
                    tracking-wider

                    text-sky-600

                    font-semibold

                    mb-3
                  "
                >
                  Overview & Benefits
                </h4>

                <p
                  className="
                    text-sm
                    text-slate-600
                    leading-relaxed
                  "
                >
                  {getDescription(selectedItem)}
                </p>

              </div>

              {/* Eligibility */}

              <div>

                <h4
                  className="
                    text-xs
                    uppercase
                    tracking-wider

                    text-sky-600

                    font-semibold

                    mb-3
                  "
                >
                  Eligibility / Requirements
                </h4>

                <div
                  className="
                    p-4
                    rounded-2xl

                    bg-sky-50/60
                    border border-sky-100
                  "
                >

                  <p
                    className="
                      text-sm
                      text-slate-600
                      leading-relaxed
                    "
                  >
                    {getEligibility(selectedItem)}
                  </p>

                </div>

              </div>

              {/* Documents */}

              <div>

                <h4
                  className="
                    text-xs
                    uppercase
                    tracking-wider

                    text-sky-600

                    font-semibold

                    mb-3
                  "
                >
                  Documents / Requirements
                </h4>

                <div className="space-y-2">

                  {getDocuments(selectedItem).map(
                    (document, index) => (

                      <div
                        key={index}
                        className="
                          flex
                          items-center
                          gap-3

                          p-3

                          rounded-xl

                          bg-slate-50
                          border border-sky-100
                        "
                      >

                        <FaCheckCircle
                          className="
                            text-emerald-500
                            shrink-0
                          "
                        />

                        <span
                          className="
                            text-sm
                            text-slate-600
                          "
                        >
                          {document}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>

              {/* =================================================
                  BUTTONS
              ================================================= */}

              <div
                className="
                  pt-5

                  border-t
                  border-sky-100

                  flex
                  flex-col
                  sm:flex-row

                  justify-end
                  gap-3
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    removeItem(selectedItem)
                  }
                  className="
                    px-5
                    py-3

                    rounded-xl

                    bg-red-50
                    border border-red-200

                    text-red-500

                    text-sm
                    font-semibold

                    hover:bg-red-100
                    hover:border-red-300

                    transition-all
                    duration-300
                  "
                >
                  Remove Saved
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedItem(null)
                  }
                  className="
                    px-5
                    py-3

                    rounded-xl

                    bg-white
                    border border-sky-200

                    text-slate-600

                    text-sm
                    font-semibold

                    hover:text-sky-600
                    hover:border-sky-400

                    transition-all
                    duration-300
                  "
                >
                  Close
                </button>

                <a
                  href={getApplyUrl(selectedItem)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    px-6
                    py-3

                    rounded-xl

                    bg-gradient-to-r
                    from-sky-500
                    to-blue-600

                    text-white

                    text-sm
                    font-semibold

                    flex
                    items-center
                    justify-center
                    gap-2

                    shadow-md
                    shadow-sky-200

                    hover:scale-[1.02]
                    hover:shadow-lg

                    transition-all
                    duration-300
                  "
                >
                  Proceed to Apply

                  <FaExternalLinkAlt
                    className="text-xs"
                  />
                </a>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Saved;