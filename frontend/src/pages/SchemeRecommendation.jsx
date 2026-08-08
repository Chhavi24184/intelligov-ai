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


  // ===============================
  // LOAD ALL SCHEMES
  // ===============================

  useEffect(() => {

    loadSchemes();

  }, []);


  const loadSchemes = async () => {

    try {

      setLoading(true);
      setError("");

      const data = await schemesAPI();

      console.log("All Schemes:", data);

      setSchemes(
        data.schemes ||
        data.data ||
        []
      );

    } catch (error) {

      console.error("Schemes API Error:", error);

      setError("Unable to load schemes.");

    } finally {

      setLoading(false);

    }

  };


  // ===============================
  // SEARCH SCHEMES
  // ===============================

  const handleSearch = async (e) => {

    e.preventDefault();

    const query = search.trim();


    // Empty search → show all schemes

    if (!query) {

      loadSchemes();

      return;

    }


    try {

      setSearching(true);
      setError("");

      const data = await searchSchemesAPI(query);

      console.log("Search Results:", data);

      setSchemes(
        data.schemes ||
        data.data ||
        []
      );

    } catch (error) {

      console.error("Search API Error:", error);

      setError("Unable to search schemes.");

      setSchemes([]);

    } finally {

      setSearching(false);

    }

  };


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


            <button
              type="submit"
              disabled={searching}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:scale-105 transition disabled:opacity-50"
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

          <div className="text-center text-cyan-300 py-10">

            Loading....

          </div>

        )}


        {/* ===============================
            ERROR
        =============================== */}

        {error && (

          <div className="text-center text-red-400 py-10">

            {error}

          </div>

        )}


        {/* ===============================
            SCHEME CARDS
        =============================== */}

        {!loading && !error && (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">


            {schemes.map((scheme, index) => (

              <div
                key={index}
                className="bg-[#101d34] border border-blue-900/40 rounded-2xl p-5 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] hover:-translate-y-1 transition-all duration-300"
              >


                {/* Scheme Name */}

                <div className="text-xl font-bold text-cyan-300">

                  {scheme.name ||
                    scheme.title ||
                    "Government Scheme"}

                </div>


                {/* Category */}

                <div className="inline-block mt-3 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs">

                  {scheme.category ||
                    "Government Scheme"}

                </div>


                {/* Description */}

                <div className="mt-4">

                  <div className="text-gray-300 text-sm font-semibold">

                    Description

                  </div>

                  <p className="text-gray-400 text-sm mt-1 leading-6">

                    {scheme.description ||
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
                      : scheme.documents_required ||
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

            <div className="text-center text-gray-400 py-10">

              No matching schemes found.

            </div>

          )}

      </div>

    </section>

  );

}

export default SchemeRecommendation;