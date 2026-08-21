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
     NORMALIZE TYPE
     
     This is the important part.
     It allows old and new saved records to be classified.
  ========================================================= */

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

    /* Scholarship */
    if (
      explicitType.includes("scholar") ||
      explicitType.includes("fellowship") ||
      explicitType.includes("grant")
    ) {
      return "scholarships";
    }

    /* Internship */
    if (
      explicitType.includes("intern") ||
      item?._savedType === "internship"
    ) {
      return "jobs";
    }

    /* Job */
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

    /* Scheme */
    if (
      explicitType.includes("scheme") ||
      explicitType.includes("welfare") ||
      explicitType.includes("government") ||
      item?.scheme_id ||
      item?.schemeId
    ) {
      return "schemes";
    }

    /*
      Additional fallback based on saved name/title.
      This helps classify older records which don't have
      _savedType.
    */

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
      text.includes("intern")
    ) {
      return "jobs";
    }

    if (
      text.includes("job") ||
      text.includes("developer") ||
      text.includes("engineer") ||
      text.includes("analyst") ||
      text.includes("manager") ||
      text.includes("employment")
    ) {
      return "jobs";
    }

    /*
      For the current project, anything without another
      identifiable type is treated as a government scheme.
    */
    return "schemes";
  };

  /* =========================================================
     GET NAME
  ========================================================= */

  const getName = (item) =>
    item?._savedName ||
    item?.name ||
    item?.title ||
    item?.scheme_name ||
    item?.job_title ||
    item?.jobTitle ||
    "Saved Item";

  /* =========================================================
     GET DESCRIPTION
  ========================================================= */

  const getDescription = (item) =>
    item?._savedDescription ||
    item?.description ||
    item?.details ||
    item?.summary ||
    "No description available.";

  /* =========================================================
     GET CATEGORY
  ========================================================= */

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

  /* =========================================================
     GET ELIGIBILITY
  ========================================================= */

  const getEligibility = (item) =>
    item?.eligibility ||
    item?.eligibility_criteria ||
    item?.requirements ||
    "Eligibility details are available on the official portal.";

  /* =========================================================
     GET DOCUMENTS
  ========================================================= */

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

  /* =========================================================
     GET APPLY URL
  ========================================================= */

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

  /* =========================================================
     LOAD ALL SAVED ITEMS
  ========================================================= */

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

    /*
      Remove duplicates.
      This prevents the same item from appearing twice if it
      exists in more than one storage array.
    */

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

  useEffect(() => {
    loadSavedItems();

    const handleStorageChange = () => {
      loadSavedItems();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  /* =========================================================
     FILTER ITEMS
  ========================================================= */

  const filteredItems = useMemo(() => {
    return savedItems.filter(
      (item) => getItemType(item) === activeTab
    );
  }, [savedItems, activeTab]);

  /* =========================================================
     COUNTS
  ========================================================= */

  const schemeCount = savedItems.filter(
    (item) => getItemType(item) === "schemes"
  ).length;

  const jobCount = savedItems.filter(
    (item) => getItemType(item) === "jobs"
  ).length;

  const scholarshipCount = savedItems.filter(
    (item) => getItemType(item) === "scholarships"
  ).length;

  /* =========================================================
     REMOVE ITEM
  ========================================================= */

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
        console.error("Unable to remove saved item:", error);
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
  };

  /* =========================================================
     TAB CONFIG
  ========================================================= */

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

  /* =========================================================
     EMPTY MESSAGE
  ========================================================= */

  const emptyMessages = {
    schemes:
      "You haven't saved any government schemes yet.",
    jobs:
      "You haven't saved any jobs or internships yet.",
    scholarships:
      "You haven't saved any scholarships yet.",
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#060c17] text-white">
      <section className="relative min-h-screen bg-gradient-to-b from-[#060c17] via-[#091528] to-[#060c17] overflow-hidden">

        {/* Background glow */}
        <div className="absolute top-10 left-[-150px] w-[420px] h-[420px] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />

        <div className="absolute top-[400px] right-[-150px] w-[420px] h-[420px] rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0b1528] border border-blue-900/50 text-slate-400 hover:text-white hover:border-blue-700/60 transition text-xs font-medium"
          >
            <FaArrowLeft className="text-[10px]" />
            Back
          </button>

          {/* Heading */}
          <div className="text-center mt-5 mb-7">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-4">
              <FaBookmark />
              Your Saved Items
            </div>

            <h1 className="block w-full text-center text-3xl sm:text-4xl font-black tracking-tight mt-2">
              <span
                style={{
                  background: "linear-gradient(90deg, #22d3ee, #ffffff, #3b82f6)",
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                  color: "transparent",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {tabs.find((tab) => tab.id === activeTab)?.label}
              </span>
            </h1>

            <p className="text-slate-400 text-sm mt-2">
              Access the opportunities you saved for later.
            </p>

          </div>

          {/* =================================================
              SLIDER / TABS
          ================================================= */}

          <div className="max-w-4xl mx-auto mb-8">

            <div className="grid grid-cols-3 bg-[#081224]/90 border border-blue-900/50 rounded-2xl p-1.5">

              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "text-slate-500 hover:text-slate-200"
                  }`}
                >
                  <span className="hidden sm:inline">
                    {tab.icon}
                  </span>

                  <span className="truncate">
                    {tab.label}
                  </span>

                  <span
                    className={`min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] ${
                      activeTab === tab.id
                        ? "bg-white/15 text-white"
                        : "bg-white/5 text-slate-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}

            </div>

          </div>

          {/* =================================================
              CONTENT
          ================================================= */}

          {filteredItems.length > 0 ? (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

              {filteredItems.map((item, index) => {

                const type = getItemType(item);

                return (
                  <div
                    key={`${type}-${item?._savedId || index}`}
                    className="group relative flex flex-col bg-[#081224]/85 border border-blue-900/40 rounded-3xl p-6 hover:border-cyan-400/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/30 transition-all duration-300"
                  >

                    {/* Top line */}
                    <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 group-hover:opacity-100 transition" />

                    <div className="flex items-start justify-between gap-3 mb-5">

                      <span className="px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-[11px] font-semibold">
                        {getCategory(item)}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeItem(item)}
                        className="w-9 h-9 rounded-xl bg-[#0b1528] border border-blue-900/40 flex items-center justify-center text-amber-400 hover:text-red-400 hover:border-red-400/30 transition"
                        title="Remove from saved"
                      >
                        <FaBookmark />
                      </button>

                    </div>

                    {/* Icon */}
                    <div className="w-11 h-11 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center mb-4">

                      {type === "scholarships" ? (
                        <FaGraduationCap className="text-cyan-400" />
                      ) : type === "jobs" ? (
                        <FaBriefcase className="text-cyan-400" />
                      ) : (
                        <FaFileAlt className="text-cyan-400" />
                      )}

                    </div>

                    <h3 className="text-lg font-bold text-white leading-snug mb-3">
                      {getName(item)}
                    </h3>

                    <p className="text-sm text-slate-400 leading-relaxed line-clamp-3 flex-1">
                      {getDescription(item)}
                    </p>

                    <div className="mt-6 pt-4 border-t border-blue-900/40 flex items-center justify-between">

                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-2 transition"
                      >
                        View Details
                        <FaExternalLinkAlt className="text-[9px]" />
                      </button>

                      <span className="text-[10px] text-slate-600">
                        #{String(index + 1).padStart(2, "0")}
                      </span>

                    </div>

                  </div>
                );
              })}

            </div>

          ) : (

            <div className="max-w-md mx-auto py-16 text-center">

              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                <FaBookmark className="text-2xl text-slate-600" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                Nothing Saved Yet
              </h3>

              <p className="text-sm text-slate-500 leading-relaxed mb-6">
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
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold hover:scale-[1.02] transition"
              >
                Explore Now
              </button>

            </div>

          )}

        </div>
      </section>

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedItem && (

        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >

          <div
            className="w-full max-w-2xl max-h-[88vh] overflow-y-auto bg-[#081224] border border-cyan-400/30 rounded-3xl shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Modal header */}
            <div className="sticky top-0 z-10 bg-[#081224]/95 backdrop-blur-xl p-6 border-b border-blue-900/40">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold">
                    {getCategory(selectedItem)}
                  </span>

                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">
                    {getName(selectedItem)}
                  </h2>

                </div>

                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="w-10 h-10 rounded-xl bg-[#0b1528] border border-blue-900/40 text-slate-400 hover:text-white flex items-center justify-center shrink-0"
                >
                  <FaTimes />
                </button>

              </div>

            </div>

            {/* Modal content */}
            <div className="p-6 space-y-7">

              <div>

                <h4 className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-3">
                  Overview & Benefits
                </h4>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {getDescription(selectedItem)}
                </p>

              </div>

              <div>

                <h4 className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-3">
                  Eligibility / Requirements
                </h4>

                <div className="p-4 rounded-2xl bg-[#0b1528] border border-blue-900/40">

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {getEligibility(selectedItem)}
                  </p>

                </div>

              </div>

              <div>

                <h4 className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-3">
                  Documents / Requirements
                </h4>

                <div className="space-y-2">

                  {getDocuments(selectedItem).map(
                    (document, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#0b1528] border border-blue-900/40"
                      >
                        <FaCheckCircle className="text-emerald-400 shrink-0" />

                        <span className="text-sm text-slate-300">
                          {document}
                        </span>
                      </div>
                    )
                  )}

                </div>

              </div>

              {/* Buttons */}
              <div className="pt-5 border-t border-blue-900/40 flex flex-col sm:flex-row justify-end gap-3">

                <button
                  type="button"
                  onClick={() => removeItem(selectedItem)}
                  className="px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm font-semibold hover:bg-red-500/20 transition"
                >
                  Remove Saved
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-5 py-3 rounded-xl bg-[#0b1528] border border-blue-900/40 text-slate-300 text-sm font-semibold hover:text-white transition"
                >
                  Close
                </button>

                <a
                  href={getApplyUrl(selectedItem)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:scale-[1.02] transition"
                >
                  Proceed to Apply
                  <FaExternalLinkAlt className="text-xs" />
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

