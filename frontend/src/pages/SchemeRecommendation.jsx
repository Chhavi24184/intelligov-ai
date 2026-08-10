import { useEffect, useState } from "react";
import {
  schemesAPI,
  searchSchemesAPI,
} from "../services/api";

function SchemeRecommendation() {
  const [schemes, setSchemes] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const [error, setError] = useState("");

  // =========================================
  // NORMALIZE API RESPONSE
  // =========================================

  const extractSchemes = (response) => {
    // Backend may return:
    // { schemes: [...] }
    // { data: [...] }
    // { data: { schemes: [...] } }

    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.schemes)) {
      return response.schemes;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.schemes)) {
      return response.data.schemes;
    }

    if (Array.isArray(response?.data?.recommended_schemes)) {
      return response.data.recommended_schemes;
    }

    return [];
  };

  // =========================================
  // LOAD ALL SCHEMES
  // =========================================

  const loadSchemes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await schemesAPI();

      console.log("All Schemes API Response:", response);

      const schemeList = extractSchemes(response);

      setSchemes(schemeList);
    } catch (error) {
      console.error("Schemes API Error:", error);

      setError(
        "Unable to load schemes. Please make sure the backend server is running."
      );

      setSchemes([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {
    loadSchemes();
  }, []);

  // =========================================
  // SEARCH SCHEMES
  // =========================================

  const handleSearch = async (e) => {
    e.preventDefault();

    const query = search.trim();

    // Empty search → load all schemes
    if (!query) {
      await loadSchemes();
      return;
    }

    try {
      setSearching(true);
      setError("");

      const response = await searchSchemesAPI(query);

      console.log("Search Schemes API Response:", response);

      const schemeList = extractSchemes(response);

      setSchemes(schemeList);
    } catch (error) {
      console.error("Search API Error:", error);

      setError(
        "Unable to search schemes. Please try again."
      );

      setSchemes([]);
    } finally {
      setSearching(false);
    }
  };

  // =========================================
  // CLEAR SEARCH
  // =========================================

  const handleClearSearch = async () => {
    setSearch("");
    await loadSchemes();
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <section className="relative min-h-screen bg-[#0a1628] overflow-hidden">

      {/* ===============================
          BACKGROUND GLOW
      =============================== */}

      <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-blue-600/20 blur-[160px] rounded-full"></div>

      <div className="absolute bottom-0 right-10 w-[350px] h-[350px] bg-purple-600/20 blur-[150px] rounded-full"></div>


      {/* ===============================
          MAIN CONTENT
      =============================== */}

      <div className="relative max-w-6xl mx-auto px-6 py-8">

        {/* ===============================
            HEADING
        =============================== */}

        <div className="text-center mb-6">

          <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-300 via-white to-yellow-400 bg-clip-text text-transparent">

            Government Schemes

          </div>

          <p className="text-gray-300 mt-3">

            Explore government schemes and discover
            benefits available for you.

          </p>

        </div>


        {/* ===============================
            SEARCH BAR
        =============================== */}

        <form
          onSubmit={handleSearch}
          className="max-w-2xl mx-auto mb-8"
        >

          <div className="flex items-center bg-[#101d34] border border-blue-900/50 rounded-2xl p-2 focus-within:border-cyan-400 transition">

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search schemes... e.g. farmer"
              className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 px-4 py-2"
            />

            {/* Clear button */}

            {search && !searching && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-3 py-2 text-gray-400 hover:text-white transition"
                title="Clear search"
              >
                ✕
              </button>
            )}

            <button
              type="submit"
              disabled={searching}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >

              {searching
                ? "Searching..."
                : "Search"}

            </button>

          </div>

        </form>


        {/* ===============================
            LOADING
        =============================== */}

        {loading && (

          <div className="text-center py-16">

            <div className="inline-flex items-center gap-3 text-cyan-300">

              <div className="w-5 h-5 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin"></div>

              <span>
                Loading schemes...
              </span>

            </div>

          </div>

        )}


        {/* ===============================
            ERROR
        =============================== */}

        {!loading && error && (

          <div className="max-w-xl mx-auto text-center py-12">

            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">

              <div className="text-red-400 text-lg font-semibold mb-2">

                Something went wrong

              </div>

              <p className="text-gray-400 text-sm mb-5">

                {error}

              </p>

              <button
                onClick={loadSchemes}
                className="px-5 py-2.5 rounded-xl bg-red-500/20 border border-red-400/30 text-red-300 hover:bg-red-500/30 transition"
              >

                Retry

              </button>

            </div>

          </div>

        )}


        {/* ===============================
            RESULT COUNT
        =============================== */}

        {!loading && !error && schemes.length > 0 && (

          <div className="flex justify-between items-center mb-5">

            <p className="text-gray-400 text-sm">

              {search.trim()
                ? `Search results for "${search.trim()}"`
                : "Available government schemes"}

            </p>

            <span className="text-cyan-300 text-sm font-semibold">

              {schemes.length} scheme
              {schemes.length !== 1 ? "s" : ""}

            </span>

          </div>

        )}


        {/* ===============================
            SCHEME CARDS
        =============================== */}

        {!loading && !error && schemes.length > 0 && (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {schemes.map((scheme, index) => (

              <div
                key={scheme.id || scheme.scheme_id || index}
                className="bg-[#101d34] border border-blue-900/40 rounded-2xl p-5 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] hover:-translate-y-1 transition-all duration-300"
              >

                {/* Scheme Name */}

                <div className="text-xl font-bold text-cyan-300">

                  {scheme.name ||
                    scheme.title ||
                    scheme.scheme_name ||
                    "Government Scheme"}

                </div>


                {/* Category */}

                <div className="inline-block mt-3 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs">

                  {scheme.category ||
                    scheme.type ||
                    "Government Scheme"}

                </div>


                {/* Description */}

                <div className="mt-4">

                  <div className="text-gray-300 text-sm font-semibold">

                    Description

                  </div>

                  <p className="text-gray-400 text-sm mt-1 leading-6">

                    {scheme.description ||
                      scheme.details ||
                      "No description available."}

                  </p>

                </div>


                {/* Eligibility */}

                <div className="mt-4">

                  <div className="text-gray-300 text-sm font-semibold">

                    Eligibility

                  </div>

                  <p className="text-gray-400 text-sm mt-1 leading-6">

                    {scheme.eligibility ||
                      scheme.eligibility_criteria ||
                      "Eligibility details not available."}

                  </p>

                </div>


                {/* Documents Required */}

                <div className="mt-4">

                  <div className="text-gray-300 text-sm font-semibold">

                    Documents Required

                  </div>

                  <p className="text-gray-400 text-sm mt-1 leading-6">

                    {Array.isArray(
                      scheme.documents_required
                    )
                      ? scheme.documents_required.join(", ")
                      : Array.isArray(
                          scheme.documents
                        )
                      ? scheme.documents.join(", ")
                      : scheme.documents_required ||
                        scheme.documents ||
                        "Information not available."}

                  </p>

                </div>

              </div>

            ))}

          </div>

        )}


        {/* ===============================
            NO RESULTS
        =============================== */}

        {!loading &&
          !error &&
          schemes.length === 0 && (

            <div className="max-w-xl mx-auto text-center py-16">

              <div className="bg-[#101d34] border border-blue-900/40 rounded-2xl p-8">

                <div className="text-4xl mb-4">
                  🔍
                </div>

                <div className="text-gray-200 text-lg font-semibold">

                  No matching schemes found

                </div>

                <p className="text-gray-500 text-sm mt-2">

                  Try searching with another keyword such as
                  farmer, student, women, education, or health.

                </p>

                {search && (
                  <button
                    onClick={handleClearSearch}
                    className="mt-5 px-5 py-2.5 rounded-xl bg-blue-600/20 border border-blue-400/30 text-blue-300 hover:bg-blue-600/30 transition"
                  >
                    View All Schemes
                  </button>
                )}

              </div>

            </div>

          )}

      </div>

    </section>
  );
}

export default SchemeRecommendation;