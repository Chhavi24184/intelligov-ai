import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaSearch,
  FaTimes,
  FaBookmark,
  FaRegBookmark,
  FaFileAlt,
  FaCheckCircle,
  FaFilter,
  FaExternalLinkAlt,
  FaCalendarAlt,
  FaGift,
  FaExclamationTriangle,
} from "react-icons/fa";

import {
  schemesAPI,
  searchSchemesAPI,
  saveSchemeAPI,
  removeSavedSchemeAPI,
  getSavedSchemesAPI,
} from "../services/api";

// Inline source fetch (no need to add to api.js for this small call)
const BASE_URL =
  import.meta.env.VITE_API_URL || "https://intelligov-ai.onrender.com";
const fetchSchemesSource = () =>
  fetch(`${BASE_URL}/schemes/source`)
    .then((r) => r.json())
    .catch(() => null);


function SchemeRecommendation() {
  const navigate = useNavigate();

  const [schemes, setSchemes] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const [error, setError] = useState("");

  // bookmarkedIds: set of scheme names (as primary key for DB-backed saves)
  const [bookmarkedNames, setBookmarkedNames] = useState(new Set());
  // savedIdMap: schemeName → saved_id (DB primary key) for removal
  const [savedIdMap, setSavedIdMap] = useState({});

  const [selectedSchemeModal, setSelectedSchemeModal] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [dataSource, setDataSource] = useState(null);

  const userId = localStorage.getItem("userId");


  // =========================================================
  // HELPERS
  // =========================================================

  const getSchemeName = (s) =>
    s?.name || s?.title || s?.scheme_name || "Government Scheme";

  const getCategory = (s) =>
    s?.category || s?.type || "Welfare Scheme";

  const getDescription = (s) =>
    s?.description || s?.details || "No description available.";

  const getBenefits = (s) =>
    s?.benefits || s?.benefit || "";

  const getEligibility = (s) =>
    s?.eligibility || s?.eligibility_criteria || "";

  const getDocuments = (s) => {
    if (Array.isArray(s?.documents)) return s.documents;
    if (Array.isArray(s?.documents_required)) return s.documents_required;
    return [];
  };

  const getDeadline = (s) => s?.deadline || "";

  const getOfficialUrl = (s) => {
    const raw = s?.official_url || s?.application_url || s?.schemeUrl || "";
    if (!raw) return "";
    // Ensure absolute URL — if no protocol, prepend https://
    if (/^https?:\/\//i.test(raw)) return raw;
    return "https://" + raw;
  };


  // =========================================================
  // LOAD SAVED SCHEMES FROM DB
  // =========================================================

  const loadSavedFromDB = async () => {
    if (!userId) return;
    try {
      const data = await getSavedSchemesAPI(userId);
      const schemes = data?.schemes || [];
      const names = new Set(schemes.map((s) => s.name));
      const idMap = {};
      schemes.forEach((s) => { idMap[s.name] = s.saved_id; });
      setBookmarkedNames(names);
      setSavedIdMap(idMap);
    } catch {
      // silent — don't break scheme listing
    }
  };


  // =========================================================
  // LOAD SCHEMES
  // =========================================================

  const loadSchemes = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await schemesAPI();
      const list = extractSchemes(response);
      setSchemes(list);
    } catch (err) {
      setError("Unable to connect to server. Please make sure the backend is running.");
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  };

  const extractSchemes = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.schemes)) return response.schemes;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.schemes)) return response.data.schemes;
    if (Array.isArray(response?.recommended_schemes)) return response.recommended_schemes;
    if (Array.isArray(response?.data?.recommended_schemes)) return response.data.recommended_schemes;
    return [];
  };


  useEffect(() => {
    loadSavedFromDB();
    loadSchemes();
    // Load data-source metadata (shows users whether data is live or curated)
    fetchSchemesSource().then((src) => src && setDataSource(src));
  }, []);


  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = search.trim();
    if (!query) { await loadSchemes(); return; }
    try {
      setSearching(true);
      setError("");
      const response = await searchSchemesAPI(query);
      setSchemes(extractSchemes(response));
    } catch {
      setError("Unable to search schemes.");
      setSchemes([]);
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = async () => {
    setSearch("");
    setSelectedCategory("All");
    await loadSchemes();
  };


  // =========================================================
  // SAVE / UNSAVE (PostgreSQL)
  // =========================================================

  const toggleBookmark = async (scheme) => {
    if (!userId) {
      alert("Please log in to save schemes.");
      return;
    }
    const name = getSchemeName(scheme);
    const isBookmarked = bookmarkedNames.has(name);

    setSaveLoading(true);
    try {
      if (isBookmarked) {
        const savedId = savedIdMap[name];
        if (savedId) {
          await removeSavedSchemeAPI(savedId);
        }
        setBookmarkedNames((prev) => {
          const next = new Set(prev);
          next.delete(name);
          return next;
        });
        setSavedIdMap((prev) => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      } else {
        const result = await saveSchemeAPI(userId, scheme);
        const savedId = result?.saved_id;
        setBookmarkedNames((prev) => new Set([...prev, name]));
        if (savedId) {
          setSavedIdMap((prev) => ({ ...prev, [name]: savedId }));
        }
      }
    } catch {
      alert("Unable to save/remove scheme. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };


  // =========================================================
  // CATEGORIES
  // =========================================================

  const categories = useMemo(() => {
    const set = new Set();
    schemes.forEach((s) => {
      const cat = s?.category || s?.type;
      if (cat) set.add(cat);
    });
    return ["All", ...Array.from(set)];
  }, [schemes]);


  // =========================================================
  // FILTER
  // =========================================================

  const filteredSchemes = schemes.filter((s) => {
    if (selectedCategory === "All") return true;
    const cat = (s?.category || s?.type || "").toLowerCase();
    return cat.includes(selectedCategory.toLowerCase());
  });


  // =========================================================
  // CATEGORY COLOR
  // =========================================================

  const catColor = (cat = "") => {
    const c = cat.toLowerCase();
    if (c.includes("farm") || c.includes("agri")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (c.includes("health")) return "bg-red-50 text-red-600 border-red-200";
    if (c.includes("edu") || c.includes("scholar")) return "bg-blue-50 text-blue-700 border-blue-200";
    if (c.includes("employ") || c.includes("career") || c.includes("job")) return "bg-amber-50 text-amber-700 border-amber-200";
    if (c.includes("housing") || c.includes("awas")) return "bg-purple-50 text-purple-700 border-purple-200";
    if (c.includes("skill") || c.includes("train")) return "bg-indigo-50 text-indigo-700 border-indigo-200";
    if (c.includes("women") || c.includes("maternity") || c.includes("girl")) return "bg-pink-50 text-pink-700 border-pink-200";
    if (c.includes("pension") || c.includes("social") || c.includes("insur")) return "bg-teal-50 text-teal-700 border-teal-200";
    return "bg-sky-50 text-sky-700 border-sky-200";
  };


  // =========================================================
  // SCHEME CARD MODAL
  // =========================================================

  const SchemeModal = ({ scheme, onClose }) => {
    if (!scheme) return null;
    const name = getSchemeName(scheme);
    const benefits = getBenefits(scheme);
    const eligibility = getEligibility(scheme);
    const docs = getDocuments(scheme);
    const deadline = getDeadline(scheme);
    const url = getOfficialUrl(scheme);
    const isBookmarked = bookmarkedNames.has(name);

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-2xl bg-white rounded-3xl border border-sky-200 shadow-2xl overflow-y-auto max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 p-6 border-b border-sky-100">
            <div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border mb-2 ${catColor(getCategory(scheme))}`}>
                {getCategory(scheme)}
              </span>
              <h2 className="text-xl font-black text-slate-900">{name}</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 shrink-0">
              <FaTimes />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Description */}
            <p className="text-sm text-slate-700 leading-relaxed">{getDescription(scheme)}</p>

            {/* Benefits */}
            {benefits && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <FaGift className="text-emerald-500 text-sm" />
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700">Benefits</span>
                </div>
                <p className="text-sm text-slate-700">{benefits}</p>
              </div>
            )}

            {/* Eligibility */}
            {eligibility && (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <FaCheckCircle className="text-blue-500 text-sm" />
                  <span className="text-[10px] uppercase tracking-wider font-bold text-blue-700">Eligibility</span>
                </div>
                <p className="text-sm text-slate-700">{eligibility}</p>
              </div>
            )}

            {/* Documents */}
            {docs.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaFileAlt className="text-amber-500 text-sm" />
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-700">Documents Required</span>
                </div>
                <ul className="space-y-1">
                  {docs.map((doc, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Deadline */}
            {deadline && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <FaCalendarAlt className="text-sky-500" />
                <span className="font-medium">Deadline:</span>
                <span>{deadline}</span>
              </div>
            )}

            {/* Official source note */}
            {url && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                <FaExclamationTriangle className="inline mr-1 text-amber-400" />
                Information sourced from official government data. Verify latest requirements before applying.
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {/* Apply with AI Agent */}
              <button
                type="button"
                onClick={() => {
                  const encoded = encodeURIComponent(JSON.stringify(scheme));
                  navigate(`/apply?scheme=${encoded}`);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-sm font-bold hover:scale-[1.02] transition-all duration-200 shadow-sm"
              >
                Apply with AI Agent ✦
              </button>
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:border-sky-300 hover:text-sky-600 transition-all duration-200"
                >
                  <FaExternalLinkAlt className="text-xs" />
                  Official Portal
                </a>
              )}
              <button
                type="button"
                onClick={() => toggleBookmark(scheme)}
                disabled={saveLoading}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl text-sm font-bold border transition-all duration-200 ${
                  isBookmarked
                    ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                    : "bg-sky-50 border-sky-300 text-sky-700 hover:bg-sky-100"
                }`}
              >
                {isBookmarked ? (
                  <><FaBookmark /> Saved</>
                ) : (
                  <><FaRegBookmark /> Save Scheme</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };


  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-white text-slate-900">

      <section className="relative min-h-screen overflow-hidden bg-white">

        {/* Background lights */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-0 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl" />
          <div className="absolute top-[450px] right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-sky-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-12 lg:py-16">

          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 lg:mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-600 text-xs font-semibold uppercase tracking-wider mb-5">
              Verified Scheme Catalog
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
              Government Scheme{" "}
              <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                Directory
              </span>
            </h1>
            <p className="text-slate-600 text-sm sm:text-base mt-4 max-w-2xl mx-auto leading-relaxed">
              Browse the complete curated catalog of verified government schemes. For personalised
              3–5 recommendations based on your profile, use{" "}
              <a href="/chat" className="text-sky-600 font-semibold hover:underline">AI Chat</a>.
            </p>

            {/* Catalog info banner */}
            <div className="mt-5 max-w-xl mx-auto px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-left">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-800 mb-0.5">Fallback / Reference Catalog</p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    This page shows all available schemes for your own research. AI Chat uses
                    RAG + IBM Granite to surface only the 3–5 most relevant matches for your
                    profile — use it for personalised recommendations.
                  </p>
                </div>
              </div>
            </div>

            {/* Data source badge */}
            {dataSource && (
              <div className="inline-flex items-center gap-2 mt-4 px-3.5 py-1.5 rounded-full border text-xs font-medium
                bg-white border-slate-200 text-slate-500">
                <span className={`w-2 h-2 rounded-full ${
                  dataSource.source_type === "dynamic" ? "bg-emerald-400" : "bg-amber-400"
                }`} />
                Curated data: {dataSource.source} — {dataSource.total_schemes} schemes
              </div>
            )}
            {!dataSource && (
              <div className="inline-flex items-center gap-2 mt-4 px-3.5 py-1.5 rounded-full border text-xs font-medium bg-white border-slate-200 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Curated government scheme catalog
              </div>
            )}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center gap-2 bg-white border border-sky-200 rounded-2xl p-2 shadow-lg shadow-sky-100 focus-within:border-sky-400 transition-all">
              <FaSearch className="text-sky-500 ml-4 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search schemes, categories, benefits..."
                className="flex-1 bg-transparent px-3 py-2.5 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none"
              />
              {search && (
                <button type="button" onClick={handleClearSearch} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
                  <FaTimes />
                </button>
              )}
              <button
                type="submit"
                disabled={searching}
                className="px-5 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition-all"
              >
                {searching ? "..." : "Search"}
              </button>
            </div>
          </form>

          {/* Category filter */}
          {categories.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 max-w-4xl mx-auto">
              <FaFilter className="text-slate-400 shrink-0 text-xs" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                    selectedCategory === cat
                      ? "bg-sky-500 text-white border-sky-500"
                      : "bg-white text-slate-600 border-slate-200 hover:border-sky-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="max-w-4xl mx-auto mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <FaExclamationTriangle />
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="text-center py-20 text-slate-500">Loading schemes...</div>
          ) : (

            /* Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSchemes.map((scheme, index) => {
                const name = getSchemeName(scheme);
                const category = getCategory(scheme);
                const description = getDescription(scheme);
                const benefits = getBenefits(scheme);
                const url = getOfficialUrl(scheme);
                const deadline = getDeadline(scheme);
                const isBookmarked = bookmarkedNames.has(name);
                const schemeId = scheme?.id || `scheme-${index}`;

                return (
                  <div
                    key={schemeId}
                    className="relative bg-white rounded-3xl border border-sky-100 shadow-[0_4px_24px_rgba(14,165,233,0.07)] hover:shadow-[0_8px_32px_rgba(14,165,233,0.13)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group"
                  >
                    {/* Top accent */}
                    <div className="h-1 w-full bg-gradient-to-r from-sky-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="p-5 flex flex-col flex-1">
                      {/* Category badge */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${catColor(category)}`}>
                          {category}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleBookmark(scheme)}
                          disabled={saveLoading}
                          className={`shrink-0 p-1.5 rounded-xl transition-all duration-200 ${
                            isBookmarked
                              ? "text-amber-500 hover:bg-amber-50"
                              : "text-slate-400 hover:text-sky-500 hover:bg-sky-50"
                          }`}
                          title={isBookmarked ? "Remove from saved" : "Save scheme"}
                        >
                          {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
                        </button>
                      </div>

                      {/* Name */}
                      <h3 className="text-base font-bold text-slate-900 leading-snug mb-2 line-clamp-2">
                        {name}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-3 flex-1">
                        {description}
                      </p>

                      {/* Benefits preview */}
                      {benefits && (
                        <div className="mb-3 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
                          <p className="text-xs text-emerald-700 line-clamp-2">
                            <FaGift className="inline mr-1 text-emerald-500" />
                            {benefits}
                          </p>
                        </div>
                      )}

                      {/* Deadline */}
                      {deadline && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                          <FaCalendarAlt className="text-sky-400 shrink-0" />
                          <span className="truncate">{deadline}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-auto">
                        <button
                          type="button"
                          onClick={() => setSelectedSchemeModal(scheme)}
                          className="flex-1 py-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold hover:bg-sky-100 transition-all"
                        >
                          View Details
                        </button>
                        {url && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-semibold hover:scale-[1.02] transition-all shadow-sm"
                          >
                            <FaExternalLinkAlt className="text-[10px]" />
                            Apply
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredSchemes.length === 0 && !loading && (
                <div className="col-span-3 text-center py-16 text-slate-400">
                  No schemes found matching your criteria.
                </div>
              )}
            </div>
          )}

          {/* AI Chat CTA */}
          {!loading && filteredSchemes.length > 0 && (
            <div className="max-w-2xl mx-auto mt-12 px-4 py-5 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 text-center">
              <p className="text-sm font-semibold text-slate-700 mb-1">
                Want personalised recommendations?
              </p>
              <p className="text-xs text-slate-500 mb-4">
                AI Chat uses IBM Granite + your profile to pick only the 3–5 schemes that best match you.
              </p>
              <button
                type="button"
                onClick={() => navigate("/chat")}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-bold hover:scale-[1.02] transition-all shadow-sm"
              >
                Get AI Recommendations ✦
              </button>
            </div>
          )}

        </div>
      </section>

      {/* Modal */}
      {selectedSchemeModal && (
        <SchemeModal
          scheme={selectedSchemeModal}
          onClose={() => setSelectedSchemeModal(null)}
        />
      )}
    </div>
  );
}

export default SchemeRecommendation;
