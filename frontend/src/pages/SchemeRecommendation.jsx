import { useEffect, useMemo, useState } from "react";
import {
  FaSearch,
  FaTimes,
  FaBookmark,
  FaRegBookmark,
  FaFileAlt,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFilter,
  FaExternalLinkAlt,
} from "react-icons/fa";

import {
  schemesAPI,
  searchSchemesAPI,
} from "../services/api";

function SchemeRecommendation() {
  const [schemes, setSchemes] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [selectedSchemeModal, setSelectedSchemeModal] = useState(null);

  /* =========================================================
     GET CURRENT USER
  ========================================================= */

  const getCurrentUserKey = () => {
    const email = localStorage.getItem("userEmail");

    if (email) {
      return email.toLowerCase().trim();
    }

    return "guest";
  };


  /* =========================================================
     GET SAVED STORAGE KEY
  ========================================================= */

  const getSavedSchemesKey = () => {
    return `savedSchemes_${getCurrentUserKey()}`;
  };


  /* =========================================================
     EXTRACT SCHEMES FROM API RESPONSE
  ========================================================= */

  const extractSchemes = (response) => {
    if (Array.isArray(response)) return response;

    if (Array.isArray(response?.schemes)) {
      return response.schemes;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.schemes)) {
      return response.data.schemes;
    }

    if (Array.isArray(response?.recommended_schemes)) {
      return response.recommended_schemes;
    }

    if (Array.isArray(response?.data?.recommended_schemes)) {
      return response.data.recommended_schemes;
    }

    return [];
  };


  /* =========================================================
     SCHEME NAME
  ========================================================= */

  const getSchemeName = (scheme) =>
    scheme.name ||
    scheme.title ||
    scheme.scheme_name ||
    "Government Welfare Scheme";


  /* =========================================================
     SCHEME CATEGORY
  ========================================================= */

  const getCategory = (scheme) =>
    scheme.category ||
    scheme.type ||
    "Welfare Scheme";


  /* =========================================================
     SCHEME DESCRIPTION
  ========================================================= */

  const getDescription = (scheme) =>
    scheme.description ||
    scheme.details ||
    "No description available for this scheme.";


  /* =========================================================
     SCHEME ELIGIBILITY
  ========================================================= */

  const getEligibility = (scheme) =>
    scheme.eligibility ||
    scheme.eligibility_criteria ||
    "Eligibility details available on the official scheme portal.";


  /* =========================================================
     SCHEME DOCUMENTS
  ========================================================= */

  const getDocuments = (scheme) => {
    if (Array.isArray(scheme.documents_required)) {
      return scheme.documents_required;
    }

    if (Array.isArray(scheme.documents)) {
      return scheme.documents;
    }

    if (scheme.documents_required) {
      return [scheme.documents_required];
    }

    if (scheme.documents) {
      return [scheme.documents];
    }

    return [
      "Aadhaar Card",
      "Income Certificate",
      "Residence Proof",
      "Bank Details",
    ];
  };


  /* =========================================================
     LOAD SAVED SCHEMES FROM LOCAL STORAGE
  ========================================================= */

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(
        getSavedSchemesKey()
      );

      if (savedData) {
        const savedSchemes = JSON.parse(savedData);

        if (Array.isArray(savedSchemes)) {
          const savedIds = savedSchemes.map(
            (scheme) => scheme._savedId
          );

          setBookmarkedIds(savedIds);
        }
      }
    } catch (error) {
      console.error(
        "Unable to load saved schemes:",
        error
      );
    }
  }, []);


  /* =========================================================
     LOAD SCHEMES
  ========================================================= */

  const loadSchemes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await schemesAPI();

      console.log("Schemes API Response:", response);

      const schemeList = extractSchemes(response);

      setSchemes(schemeList);
    } catch (err) {
      console.error("Schemes API Error:", err);

      setError(
        "Unable to connect to server. Please make sure the backend is running."
      );

      setSchemes([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadSchemes();
  }, []);


  /* =========================================================
     SEARCH
  ========================================================= */

  const handleSearch = async (e) => {
    e.preventDefault();

    const query = search.trim();

    if (!query) {
      await loadSchemes();
      return;
    }

    try {
      setSearching(true);
      setError("");

      const response = await searchSchemesAPI(query);

      console.log("Search API Response:", response);

      const searchResults = extractSchemes(response);

      setSchemes(searchResults);
    } catch (err) {
      console.error("Search API Error:", err);

      setError(
        "Unable to search schemes. Please check if the backend is running."
      );

      setSchemes([]);
    } finally {
      setSearching(false);
    }
  };


  /* =========================================================
     CLEAR SEARCH
  ========================================================= */

  const handleClearSearch = async () => {
    setSearch("");
    setSelectedCategory("All");

    await loadSchemes();
  };


  /* =========================================================
     SAVE / UNSAVE SCHEME
  ========================================================= */

  const toggleBookmark = (scheme, schemeId) => {
    try {
      const storageKey = getSavedSchemesKey();

      const existingData = localStorage.getItem(storageKey);

      let savedSchemes = [];

      if (existingData) {
        savedSchemes = JSON.parse(existingData);

        if (!Array.isArray(savedSchemes)) {
          savedSchemes = [];
        }
      }


      /* =========================
         REMOVE SCHEME
      ========================= */

      if (bookmarkedIds.includes(schemeId)) {

        const updatedSchemes = savedSchemes.filter(
          (item) => item._savedId !== schemeId
        );

        localStorage.setItem(
          storageKey,
          JSON.stringify(updatedSchemes)
        );

        setBookmarkedIds((prev) =>
          prev.filter((item) => item !== schemeId)
        );

        return;
      }


      /* =========================
         SAVE SCHEME
      ========================= */

      const savedScheme = {
        ...scheme,

        _savedId: schemeId,

        _savedType: "scheme",

        _savedName: getSchemeName(scheme),

        _savedCategory: getCategory(scheme),

        _savedDescription: getDescription(scheme),

        _savedAt: new Date().toISOString(),
      };


      const alreadySaved = savedSchemes.some(
        (item) => item._savedId === schemeId
      );

      if (!alreadySaved) {
        savedSchemes.push(savedScheme);
      }


      localStorage.setItem(
        storageKey,
        JSON.stringify(savedSchemes)
      );


      setBookmarkedIds((prev) => [
        ...prev,
        schemeId,
      ]);

    } catch (error) {
      console.error(
        "Unable to save scheme:",
        error
      );

      alert(
        "Unable to save this scheme. Please try again."
      );
    }
  };


  /* =========================================================
     CATEGORIES
  ========================================================= */

  const categories = useMemo(() => {
    const categorySet = new Set();

    schemes.forEach((scheme) => {
      const category = scheme.category || scheme.type;

      if (category) {
        categorySet.add(category);
      }
    });

    return ["All", ...Array.from(categorySet)];
  }, [schemes]);


  /* =========================================================
     FILTER
  ========================================================= */

  const filteredSchemes = schemes.filter((scheme) => {

    if (selectedCategory === "All") {
      return true;
    }

    const category = (
      scheme.category ||
      scheme.type ||
      ""
    ).toLowerCase();

    return category.includes(
      selectedCategory.toLowerCase()
    );
  });


  return (
    <div className="min-h-screen bg-[#060c17] text-white">

      <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#060c17] via-[#091528] to-[#060c17]">

        {/* ================= BACKGROUND GLOW ================= */}

        <div className="absolute top-10 left-[-120px] w-[420px] h-[420px] rounded-full bg-blue-600/15 blur-[150px] pointer-events-none" />

        <div className="absolute top-[420px] right-[-120px] w-[420px] h-[420px] rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />


        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">


          {/* ================= HEADER ================= */}

          <div className="text-center max-w-3xl mx-auto mb-10">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-5">

              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />

              Smart Scheme Discovery

            </div>


            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">

              Discover Government{" "}

              <span className="bg-gradient-to-r from-cyan-300 via-white to-blue-400 bg-clip-text text-transparent">

                Schemes

              </span>

            </h1>


            <p className="text-slate-400 text-sm sm:text-base mt-4 max-w-2xl mx-auto leading-relaxed">

              Find welfare schemes, scholarships, healthcare benefits,
              agricultural support and career opportunities that match
              your needs.

            </p>

          </div>


          {/* ================= SEARCH ================= */}

          <form
            onSubmit={handleSearch}
            className="max-w-4xl mx-auto mb-8"
          >

            <div className="flex items-center gap-2 bg-[#081224]/90 backdrop-blur-xl border border-blue-900/60 rounded-2xl p-2 shadow-xl shadow-blue-950/20 focus-within:border-cyan-400/50 transition-all">

              <FaSearch className="text-slate-400 ml-4 shrink-0" />


              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search schemes... e.g. farmer, student, health"
                className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder-slate-500 outline-none py-3 px-1"
              />


              {search && (

                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-2 text-slate-400 hover:text-white transition"
                  title="Clear search"
                >
                  <FaTimes />
                </button>

              )}


              <button
                type="submit"
                disabled={searching}
                className="px-5 sm:px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-600/20 hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >

                {searching
                  ? "Searching..."
                  : "Search"}

              </button>

            </div>

          </form>


          {/* ================= CATEGORY FILTER ================= */}

          {!loading &&
            !error &&
            schemes.length > 0 && (

              <div className="max-w-6xl mx-auto mb-8">

                <div className="flex items-center gap-2 mb-3 text-xs text-slate-400">

                  <FaFilter className="text-cyan-400" />

                  <span className="font-semibold">
                    Filter by category
                  </span>

                </div>


                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">

                  {categories.map((category) => (

                    <button
                      key={category}
                      onClick={() =>
                        setSelectedCategory(category)
                      }
                      className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                        selectedCategory === category
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-400/40 text-white shadow-lg shadow-blue-600/20"
                          : "bg-[#081224] border-blue-900/50 text-slate-400 hover:text-white hover:border-cyan-400/40"
                      }`}
                    >
                      {category}
                    </button>

                  ))}

                </div>

              </div>

            )}


          {/* ================= LOADING ================= */}

          {loading && (

            <div className="max-w-xl mx-auto py-16 text-center">

              <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center">

                <FaSearch className="text-cyan-400 text-xl animate-pulse" />

              </div>


              <h3 className="text-white font-semibold mb-1">
                Loading schemes...
              </h3>


              <p className="text-xs text-slate-500">
                Fetching government scheme records
              </p>

            </div>

          )}


          {/* ================= ERROR ================= */}

          {!loading && error && (

            <div className="max-w-xl mx-auto glass-card p-8 rounded-3xl border border-red-500/30 text-center">

              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center">

                <FaExclamationTriangle className="text-red-400 text-xl" />

              </div>


              <h3 className="text-lg font-bold text-white mb-2">
                Unable to Load Schemes
              </h3>


              <p className="text-sm text-slate-400 mb-5">
                {error}
              </p>


              <button
                onClick={loadSchemes}
                className="px-5 py-2.5 rounded-xl bg-red-500/15 border border-red-400/30 text-red-300 text-xs font-semibold hover:bg-red-500/25 transition"
              >
                Retry
              </button>

            </div>

          )}


          {/* ================= SCHEME CARDS ================= */}

          {!loading &&
            !error &&
            filteredSchemes.length > 0 && (

              <div>

                <div className="flex items-center justify-between mb-5 px-1">

                  <div className="text-xs sm:text-sm text-slate-400">

                    Showing{" "}

                    <span className="text-white font-semibold">
                      {filteredSchemes.length}
                    </span>{" "}

                    scheme
                    {filteredSchemes.length !== 1
                      ? "s"
                      : ""}

                  </div>


                  {bookmarkedIds.length > 0 && (

                    <div className="flex items-center gap-1.5 text-xs text-amber-400">

                      <FaBookmark />

                      {bookmarkedIds.length} saved

                    </div>

                  )}

                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                  {filteredSchemes.map(
                    (scheme, idx) => {

                      const schemeId =
                        scheme.id ||
                        scheme.scheme_id ||
                        `${getSchemeName(
                          scheme
                        )}-${idx}`;


                      const isSaved =
                        bookmarkedIds.includes(
                          schemeId
                        );


                      return (

                        <div
                          key={schemeId}
                          className="group relative flex flex-col bg-[#081224]/80 backdrop-blur-xl border border-blue-900/40 rounded-3xl p-6 hover:border-cyan-400/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/30 transition-all duration-300"
                        >

                          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-0 group-hover:opacity-100 transition" />


                          {/* CATEGORY + BOOKMARK */}

                          <div className="flex items-start justify-between gap-3 mb-5">

                            <span className="px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/25 text-cyan-300 text-[11px] font-semibold">

                              {getCategory(
                                scheme
                              )}

                            </span>


                            <button
                              type="button"
                              onClick={() =>
                                toggleBookmark(
                                  scheme,
                                  schemeId
                                )
                              }
                              className={`w-9 h-9 rounded-xl bg-[#0b1528] border flex items-center justify-center transition ${
                                isSaved
                                  ? "border-amber-400/40 text-amber-400"
                                  : "border-blue-900/40 text-slate-400 hover:text-amber-400 hover:border-amber-400/30"
                              }`}
                              title={
                                isSaved
                                  ? "Remove from saved"
                                  : "Save scheme"
                              }
                            >

                              {isSaved ? (
                                <FaBookmark />
                              ) : (
                                <FaRegBookmark />
                              )}

                            </button>

                          </div>


                          {/* ICON */}

                          <div className="w-11 h-11 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center mb-4">

                            <FaFileAlt className="text-cyan-400" />

                          </div>


                          {/* TITLE */}

                          <h3 className="text-lg font-bold text-white leading-snug mb-3 group-hover:text-cyan-300 transition-colors">

                            {getSchemeName(
                              scheme
                            )}

                          </h3>


                          {/* DESCRIPTION */}

                          <p className="text-sm text-slate-400 leading-relaxed line-clamp-3 flex-1">

                            {getDescription(
                              scheme
                            )}

                          </p>


                          {/* FOOTER */}

                          <div className="mt-6 pt-4 border-t border-blue-900/40 flex items-center justify-between">

                            <button
                              onClick={() =>
                                setSelectedSchemeModal(
                                  scheme
                                )
                              }
                              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-2 transition"
                            >

                              View Details

                              <FaArrowRight className="text-[10px]" />

                            </button>


                            <span className="text-[10px] text-slate-600">

                              #{String(
                                idx + 1
                              ).padStart(2, "0")}

                            </span>

                          </div>

                        </div>

                      );

                    }
                  )}

                </div>

              </div>

            )}


          {/* ================= EMPTY SEARCH ================= */}

          {!loading &&
            !error &&
            filteredSchemes.length === 0 && (

              <div className="max-w-md mx-auto py-16 text-center">

                <div className="text-5xl mb-5">
                  🔍
                </div>


                <h3 className="text-xl font-bold text-white mb-2">
                  No Schemes Found
                </h3>


                <p className="text-sm text-slate-400 leading-relaxed mb-5">

                  No matching government schemes
                  were found

                  {search
                    ? ` for "${search}"`
                    : selectedCategory !==
                      "All"
                    ? ` in ${selectedCategory}`
                    : ""}.

                </p>


                <button
                  onClick={handleClearSearch}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition"
                >
                  Reset Filters
                </button>

              </div>

            )}

        </div>

      </section>


      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedSchemeModal && (

        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() =>
            setSelectedSchemeModal(null)
          }
        >

          <div
            className="w-full max-w-2xl max-h-[88vh] overflow-y-auto bg-[#081224] border border-cyan-400/30 rounded-3xl shadow-2xl shadow-black/50"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 bg-[#081224]/95 backdrop-blur-xl p-6 border-b border-blue-900/40">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold">

                    {getCategory(
                      selectedSchemeModal
                    )}

                  </span>


                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">

                    {getSchemeName(
                      selectedSchemeModal
                    )}

                  </h2>

                </div>


                <button
                  onClick={() =>
                    setSelectedSchemeModal(
                      null
                    )
                  }
                  className="w-10 h-10 rounded-xl bg-[#0b1528] border border-blue-900/40 text-slate-400 hover:text-white flex items-center justify-center shrink-0"
                >
                  <FaTimes />
                </button>

              </div>

            </div>


            {/* MODAL CONTENT */}

            <div className="p-6 space-y-7">

              <div>

                <h4 className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-3">
                  Overview & Benefits
                </h4>

                <p className="text-sm text-slate-300 leading-relaxed">

                  {getDescription(
                    selectedSchemeModal
                  )}

                </p>

              </div>


              <div>

                <h4 className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-3">
                  Eligibility Criteria
                </h4>


                <div className="p-4 rounded-2xl bg-[#0b1528] border border-blue-900/40">

                  <p className="text-sm text-slate-300 leading-relaxed">

                    {getEligibility(
                      selectedSchemeModal
                    )}

                  </p>

                </div>

              </div>


              <div>

                <h4 className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-3">
                  Documents Required
                </h4>


                <div className="space-y-2">

                  {getDocuments(
                    selectedSchemeModal
                  ).map(
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


              {/* MODAL BUTTONS */}

              <div className="pt-5 border-t border-blue-900/40 flex flex-col sm:flex-row justify-end gap-3">

                <button
                  onClick={() =>
                    setSelectedSchemeModal(
                      null
                    )
                  }
                  className="px-5 py-3 rounded-xl bg-[#0b1528] border border-blue-900/40 text-slate-300 text-sm font-semibold hover:text-white transition"
                >
                  Close
                </button>


                <a
                  href="https://myScheme.gov.in"
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

export default SchemeRecommendation;

