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

  const [selectedSchemeModal, setSelectedSchemeModal] =
    useState(null);


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
  // SAVED SCHEMES STORAGE KEY
  // =========================================================

  const getSavedSchemesKey = () => {

    return `savedSchemes_${getCurrentUserKey()}`;

  };


  // =========================================================
  // EXTRACT SCHEMES
  // =========================================================

  const extractSchemes = (response) => {

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

    if (Array.isArray(response?.recommended_schemes)) {
      return response.recommended_schemes;
    }

    if (
      Array.isArray(
        response?.data?.recommended_schemes
      )
    ) {
      return response.data.recommended_schemes;
    }

    return [];
  };


  // =========================================================
  // GET NAME
  // =========================================================

  const getSchemeName = (scheme) =>

    scheme?.name ||
    scheme?.title ||
    scheme?.scheme_name ||
    scheme?._savedName ||
    "Government Welfare Scheme";


  // =========================================================
  // GET CATEGORY
  // =========================================================

  const getCategory = (scheme) =>

    scheme?.category ||
    scheme?.type ||
    scheme?._savedCategory ||
    "Welfare Scheme";


  // =========================================================
  // GET DESCRIPTION
  // =========================================================

  const getDescription = (scheme) =>

    scheme?.description ||
    scheme?.details ||
    scheme?._savedDescription ||
    "No description available for this item.";


  // =========================================================
  // GET ELIGIBILITY
  // =========================================================

  const getEligibility = (scheme) =>

    scheme?.eligibility ||
    scheme?.eligibility_criteria ||
    "Eligibility details are available on the official portal.";


  // =========================================================
  // GET DOCUMENTS
  // =========================================================

  const getDocuments = (scheme) => {

    if (Array.isArray(scheme?.documents_required)) {
      return scheme.documents_required;
    }

    if (Array.isArray(scheme?.documents)) {
      return scheme.documents;
    }

    if (scheme?.documents_required) {
      return [scheme.documents_required];
    }

    if (scheme?.documents) {
      return [scheme.documents];
    }

    return [
      "Aadhaar Card",
      "Income Certificate",
      "Residence Proof",
      "Bank Details",
    ];
  };


  // =========================================================
  // CLASSIFY SAVED ITEM
  // =========================================================

  const classifySavedItem = (item) => {

    const text = [

      item?.name,
      item?.title,
      item?.scheme_name,
      item?.category,
      item?.description,
      item?.details,
      item?.eligibility,
      item?.eligibility_criteria,
      item?.type,
      item?._savedName,
      item?._savedCategory,
      item?._savedDescription,
      item?._savedType,

    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();


    // SCHOLARSHIPS

    const scholarshipKeywords = [

      "scholarship",
      "scholarships",
      "fellowship",
      "fellowships",
      "student grant",
      "education grant",
      "financial assistance for students",
      "financial support for students",
      "student financial assistance",
      "merit scholarship",
      "education scholarship",
      "student scholarship",
      "post matric scholarship",
      "pre matric scholarship",
      "post-matric scholarship",
      "pre-matric scholarship",

    ];


    if (
      scholarshipKeywords.some(
        (keyword) =>
          text.includes(keyword)
      )
    ) {

      return "scholarship";

    }


    // JOBS / INTERNSHIPS

    const jobKeywords = [

      "job",
      "jobs",
      "employment",
      "employability",
      "career",
      "careers",
      "internship",
      "internships",
      "intern",
      "vacancy",
      "vacancies",
      "recruitment",
      "placement",
      "placements",
      "job fair",
      "career fair",
      "career counselling",
      "career counseling",
      "career guidance",
      "work opportunity",
      "work opportunities",
      "wage employment",
      "job search",
      "employment opportunity",
      "employment opportunities",
      "employment service",
      "employment services",

    ];


    if (
      jobKeywords.some(
        (keyword) =>
          text.includes(keyword)
      )
    ) {

      return "job";

    }


    return "scheme";
  };


  // =========================================================
  // LOAD SAVED IDS
  // =========================================================

  const loadSavedIds = () => {

    try {

      const storageKey =
        getSavedSchemesKey();

      const savedData =
        localStorage.getItem(storageKey);


      if (!savedData) {

        setBookmarkedIds([]);

        return;
      }


      const savedItems =
        JSON.parse(savedData);


      if (!Array.isArray(savedItems)) {

        setBookmarkedIds([]);

        return;
      }


      const ids = savedItems

        .map(
          (item) =>
            String(item?._savedId || "")
        )

        .filter(Boolean);


      setBookmarkedIds(ids);

    }

    catch (error) {

      console.error(
        "Unable to load saved items:",
        error
      );

      setBookmarkedIds([]);

    }

  };


  // =========================================================
  // LOAD SCHEMES
  // =========================================================

  const loadSchemes = async () => {

    try {

      setLoading(true);

      setError("");


      const response =
        await schemesAPI();


      console.log(
        "Schemes API Response:",
        response
      );


      const schemeList =
        extractSchemes(response);


      setSchemes(schemeList);

    }

    catch (err) {

      console.error(
        "Schemes API Error:",
        err
      );


      setError(
        "Unable to connect to server. Please make sure the backend is running."
      );


      setSchemes([]);

    }

    finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadSavedIds();

    loadSchemes();

  }, []);


  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = async (e) => {

    e.preventDefault();


    const query =
      search.trim();


    if (!query) {

      await loadSchemes();

      return;
    }


    try {

      setSearching(true);

      setError("");


      const response =
        await searchSchemesAPI(query);


      console.log(
        "Search API Response:",
        response
      );


      const searchResults =
        extractSchemes(response);


      setSchemes(searchResults);

    }

    catch (err) {

      console.error(
        "Search API Error:",
        err
      );


      setError(
        "Unable to search schemes. Please check if the backend is running."
      );


      setSchemes([]);

    }

    finally {

      setSearching(false);

    }

  };


  // =========================================================
  // CLEAR SEARCH
  // =========================================================

  const handleClearSearch = async () => {

    setSearch("");

    setSelectedCategory("All");

    await loadSchemes();

  };


  // =========================================================
  // SAVE / UNSAVE
  // =========================================================

  const toggleBookmark = (
    scheme,
    schemeId
  ) => {

    try {

      const storageKey =
        getSavedSchemesKey();


      const existingData =
        localStorage.getItem(storageKey);


      let savedItems = [];


      if (existingData) {

        try {

          savedItems =
            JSON.parse(existingData);


          if (!Array.isArray(savedItems)) {
            savedItems = [];
          }

        }

        catch {

          savedItems = [];

        }

      }


      // REMOVE

      if (
        bookmarkedIds.includes(
          schemeId
        )
      ) {

        const updatedItems =
          savedItems.filter(
            (item) =>
              String(item?._savedId) !==
              String(schemeId)
          );


        localStorage.setItem(
          storageKey,
          JSON.stringify(updatedItems)
        );


        setBookmarkedIds(
          (prev) =>
            prev.filter(
              (id) =>
                String(id) !==
                String(schemeId)
            )
        );


        window.dispatchEvent(
          new Event("savedItemsChanged")
        );


        return;
      }


      // CLASSIFY

      const savedType =
        classifySavedItem(scheme);


      // SAVE

      const savedItem = {

        ...scheme,

        _savedId:
          String(schemeId),

        _savedType:
          savedType,

        _savedName:
          getSchemeName(scheme),

        _savedCategory:
          getCategory(scheme),

        _savedDescription:
          getDescription(scheme),

        _savedAt:
          new Date().toISOString(),

      };


      const alreadySaved =
        savedItems.some(
          (item) =>
            String(item?._savedId) ===
            String(schemeId)
        );


      let updatedItems;


      if (alreadySaved) {

        updatedItems =
          savedItems.map(
            (item) =>
              String(item?._savedId) ===
              String(schemeId)
                ? savedItem
                : item
          );

      }

      else {

        updatedItems = [
          ...savedItems,
          savedItem,
        ];

      }


      localStorage.setItem(
        storageKey,
        JSON.stringify(
          updatedItems
        )
      );


      setBookmarkedIds(
        (prev) =>
          prev.includes(schemeId)
            ? prev
            : [...prev, schemeId]
      );


      window.dispatchEvent(
        new Event("savedItemsChanged")
      );

    }

    catch (error) {

      console.error(
        "Unable to save item:",
        error
      );


      alert(
        "Unable to save this item. Please try again."
      );

    }

  };


  // =========================================================
  // CATEGORIES
  // =========================================================

  const categories = useMemo(() => {

    const categorySet =
      new Set();


    schemes.forEach(
      (scheme) => {

        const category =
          scheme?.category ||
          scheme?.type;


        if (category) {

          categorySet.add(
            category
          );

        }

      }
    );


    return [
      "All",
      ...Array.from(
        categorySet
      ),
    ];

  }, [schemes]);


  // =========================================================
  // FILTER
  // =========================================================

  const filteredSchemes =
    schemes.filter(
      (scheme) => {

        if (
          selectedCategory ===
          "All"
        ) {

          return true;

        }


        const category = (

          scheme?.category ||
          scheme?.type ||
          ""

        )
          .toLowerCase();


        return category.includes(
          selectedCategory.toLowerCase()
        );

      }
    );


  // =========================================================
  // UI
  // =========================================================

  return (

    <div
      className="
        min-h-screen
        bg-white
        text-slate-900
      "
    >

      <section
        className="
          relative
          min-h-screen
          overflow-hidden
          bg-white
        "
      >

        {/* =================================================
            BACKGROUND LIGHTS
        ================================================= */}

        <div
          className="
            absolute
            inset-0
            pointer-events-none
          "
        >

          <div
            className="
              absolute
              top-20
              left-0
              w-96
              h-96
              bg-sky-400/10
              rounded-full
              blur-3xl
            "
          />

          <div
            className="
              absolute
              top-[450px]
              right-0
              w-96
              h-96
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
              w-[600px]
              h-[250px]
              bg-sky-400/10
              rounded-full
              blur-3xl
            "
          />

        </div>


        {/* =================================================
            MAIN CONTAINER
        ================================================= */}

        <div
          className="
            relative
            max-w-7xl
            mx-auto
            px-6
            py-12
            lg:py-16
          "
        >


          {/* =================================================
              HEADER
          ================================================= */}

          <div
            className="
              text-center
              max-w-3xl
              mx-auto
              mb-10
              lg:mb-14
            "
          >

            <span
              className="
                inline-block
                px-4
                py-1.5
                rounded-full
                bg-sky-50
                border
                border-sky-200
                text-sky-600
                text-xs
                font-semibold
                uppercase
                tracking-wider
                mb-5
              "
            >

              Smart Scheme Discovery

            </span>


            <h1
              className="
                text-3xl
                sm:text-4xl
                lg:text-5xl
                font-black
                text-slate-900
                leading-tight
              "
            >

              Discover Government{" "}

              <span
                className="
                  bg-gradient-to-r
                  from-sky-500
                  to-blue-600
                  bg-clip-text
                  text-transparent
                "
              >
                Schemes
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

              Find welfare schemes, scholarships,
              healthcare benefits, agricultural
              support and career opportunities
              that match your needs.

            </p>

          </div>


          {/* =================================================
              SEARCH
          ================================================= */}

          <form
            onSubmit={handleSearch}
            className="
              max-w-4xl
              mx-auto
              mb-8
            "
          >

            <div
              className="
                flex
                items-center
                gap-2
                bg-white
                border
                border-sky-200
                rounded-2xl
                p-2
                shadow-lg
                shadow-sky-100
                focus-within:border-sky-400
                transition-all
              "
            >

              <FaSearch
                className="
                  text-sky-500
                  ml-4
                  shrink-0
                "
              />


              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search schemes... e.g. farmer, student, health"
                className="
                  flex-1
                  min-w-0
                  bg-transparent
                  text-sm
                  text-slate-900
                  placeholder-slate-400
                  outline-none
                  py-3
                  px-1
                "
              />


              {search && (

                <button
                  type="button"
                  onClick={
                    handleClearSearch
                  }
                  className="
                    p-2
                    text-slate-400
                    hover:text-slate-700
                    transition
                  "
                  title="Clear search"
                >

                  <FaTimes />

                </button>

              )}


              <button
                type="submit"
                disabled={searching}
                className="
                  px-5
                  sm:px-7
                  py-3
                  rounded-xl
                  bg-gradient-to-r
                  from-sky-500
                  to-blue-600
                  text-white
                  text-sm
                  font-semibold
                  shadow-lg
                  shadow-blue-200
                  hover:scale-[1.02]
                  transition-all
                  duration-300
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >

                {searching
                  ? "Searching..."
                  : "Search"}

              </button>

            </div>

          </form>


          {/* =================================================
              CATEGORY FILTER
          ================================================= */}

          {!loading &&
            !error &&
            schemes.length > 0 && (

              <div
                className="
                  max-w-6xl
                  mx-auto
                  mb-10
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    mb-3
                    text-xs
                    text-slate-500
                  "
                >

                  <FaFilter
                    className="
                      text-sky-500
                    "
                  />

                  <span
                    className="
                      font-semibold
                    "
                  >
                    Filter by category
                  </span>

                </div>


                <div
                  className="
                    flex
                    gap-2
                    overflow-x-auto
                    pb-2
                  "
                >

                  {categories.map(
                    (category) => (

                      <button
                        key={category}
                        onClick={() =>
                          setSelectedCategory(
                            category
                          )
                        }
                        className={`

                          whitespace-nowrap
                          px-4
                          py-2
                          rounded-full
                          text-xs
                          font-semibold
                          border
                          transition-all
                          duration-300

                          ${
                            selectedCategory ===
                            category

                              ? `
                                bg-gradient-to-r
                                from-sky-500
                                to-blue-600
                                border-sky-400
                                text-white
                                shadow-lg
                                shadow-sky-200
                              `

                              : `
                                bg-sky-50
                                border-sky-200
                                text-slate-600
                                hover:text-sky-600
                                hover:border-sky-400
                              `
                          }

                        `}
                      >

                        {category}

                      </button>

                    )
                  )}

                </div>

              </div>

            )}


          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (

            <div
              className="
                max-w-xl
                mx-auto
                py-16
                text-center
              "
            >

              <div
                className="
                  w-14
                  h-14
                  mx-auto
                  mb-5
                  rounded-2xl
                  bg-sky-50
                  border
                  border-sky-200
                  flex
                  items-center
                  justify-center
                "
              >

                <FaSearch
                  className="
                    text-sky-500
                    text-xl
                    animate-pulse
                  "
                />

              </div>


              <h3
                className="
                  text-slate-900
                  font-semibold
                  mb-1
                "
              >
                Loading schemes...
              </h3>


              <p
                className="
                  text-xs
                  text-slate-500
                "
              >
                Fetching government scheme records
              </p>

            </div>

          )}


          {/* =================================================
              ERROR
          ================================================= */}

          {!loading &&
            error && (

              <div
                className="
                  max-w-xl
                  mx-auto
                  p-8
                  rounded-3xl
                  border
                  border-red-200
                  bg-white
                  text-center
                  shadow-lg
                  shadow-red-100
                "
              >

                <div
                  className="
                    w-14
                    h-14
                    mx-auto
                    mb-4
                    rounded-2xl
                    bg-red-50
                    flex
                    items-center
                    justify-center
                  "
                >

                  <FaExclamationTriangle
                    className="
                      text-red-500
                      text-xl
                    "
                  />

                </div>


                <h3
                  className="
                    text-lg
                    font-bold
                    text-slate-900
                    mb-2
                  "
                >
                  Unable to Load Schemes
                </h3>


                <p
                  className="
                    text-sm
                    text-slate-500
                    mb-5
                  "
                >
                  {error}
                </p>


                <button
                  onClick={loadSchemes}
                  className="
                    px-5
                    py-2.5
                    rounded-xl
                    bg-red-50
                    border
                    border-red-200
                    text-red-600
                    text-xs
                    font-semibold
                    hover:bg-red-100
                    transition
                  "
                >
                  Retry
                </button>

              </div>

            )}


          {/* =================================================
              CARDS
          ================================================= */}

          {!loading &&
            !error &&
            filteredSchemes.length > 0 && (

              <div>


                <div
                  className="
                    flex
                    items-center
                    justify-between
                    mb-6
                    px-1
                  "
                >

                  <div
                    className="
                      text-xs
                      sm:text-sm
                      text-slate-500
                    "
                  >

                    Showing{" "}

                    <span
                      className="
                        text-slate-900
                        font-semibold
                      "
                    >
                      {filteredSchemes.length}
                    </span>{" "}

                    item
                    {filteredSchemes.length !==
                    1
                      ? "s"
                      : ""}

                  </div>


                  {bookmarkedIds.length >
                    0 && (

                    <div
                      className="
                        flex
                        items-center
                        gap-1.5
                        text-xs
                        text-amber-500
                      "
                    >

                      <FaBookmark />

                      {bookmarkedIds.length}
                      {" "}
                      saved

                    </div>

                  )}

                </div>


                {/* =================================================
                    GRID
                ================================================= */}

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

                  {filteredSchemes.map(
                    (scheme, idx) => {

                      const schemeId =
                        String(
                          scheme?.id ||
                          scheme?.scheme_id ||
                          `${getSchemeName(
                            scheme
                          )}-${idx}`
                        );


                      const isSaved =
                        bookmarkedIds.includes(
                          schemeId
                        );


                      return (

                        <div
                          key={schemeId}
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
                            duration-700
                            ease-[cubic-bezier(0.22,1,0.36,1)]

                            hover:border-sky-400/60
                            hover:-translate-y-2
                          "
                        >


                          {/* =================================================
                              SUBTLE HOVER GLOW
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


                          {/* =================================================
                              CARD CONTENT
                          ================================================= */}

                          <div
                            className="
                              relative
                              z-10
                            "
                          >


                            {/* CATEGORY + BOOKMARK */}

                            <div
                              className="
                                flex
                                items-center
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
                                  border
                                  border-sky-200
                                  text-slate-600
                                  text-[11px]
                                  font-medium

                                  group-hover:border-sky-400/60
                                  group-hover:text-sky-600

                                  transition-all
                                  duration-300
                                "
                              >

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
                                className={`

                                  w-10
                                  h-10
                                  rounded-xl
                                  bg-sky-50
                                  border
                                  flex
                                  items-center
                                  justify-center

                                  transition-all
                                  duration-500

                                  ${
                                    isSaved

                                      ? `
                                        border-amber-300
                                        text-amber-500
                                      `

                                      : `
                                        border-sky-200
                                        text-slate-400
                                        hover:text-amber-500
                                        hover:border-amber-300
                                      `
                                  }

                                `}
                                title={
                                  isSaved
                                    ? "Remove from saved"
                                    : "Save item"
                                }
                              >

                                {isSaved ? (
                                  <FaBookmark />
                                ) : (
                                  <FaRegBookmark />
                                )}

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
                                border
                                border-sky-200
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

                              <FaFileAlt
                                className="
                                  text-sky-500
                                  text-xl
                                "
                              />

                            </div>


                            {/* =================================================
                                TITLE
                            ================================================= */}

                            <h3
                              className="
                                text-xl
                                font-bold
                                text-slate-900
                                mb-3
                                leading-snug

                                group-hover:text-sky-600

                                transition-colors
                                duration-300
                              "
                            >

                              {getSchemeName(
                                scheme
                              )}

                            </h3>


                            {/* =================================================
                                DESCRIPTION
                            ================================================= */}

                            <p
                              className="
                                text-slate-600
                                text-sm
                                leading-relaxed
                                mb-6
                                line-clamp-4
                              "
                            >

                              {getDescription(
                                scheme
                              )}

                            </p>

                          </div>


                          {/* =================================================
                              FOOTER
                          ================================================= */}

                          <div
                            className="
                              relative
                              z-10
                              pt-4
                              border-t
                              border-sky-100
                              flex
                              items-center
                              justify-between
                            "
                          >

                            <button
                              onClick={() =>
                                setSelectedSchemeModal(
                                  scheme
                                )
                              }
                              className="
                                inline-flex
                                items-center
                                gap-2
                                text-sm
                                font-semibold
                                text-sky-600
                                hover:text-blue-600
                                transition-all
                                duration-300
                                group-hover:translate-x-1
                              "
                            >

                              <span>
                                View Details
                              </span>

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
                              "
                            >

                              #
                              {String(
                                idx + 1
                              ).padStart(
                                2,
                                "0"
                              )}

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

                    }
                  )}

                </div>

              </div>

            )}


          {/* =================================================
              EMPTY
          ================================================= */}

          {!loading &&
            !error &&
            filteredSchemes.length === 0 && (

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
                    text-5xl
                    mb-5
                  "
                >
                  🔍
                </div>


                <h3
                  className="
                    text-xl
                    font-bold
                    text-slate-900
                    mb-2
                  "
                >
                  No Schemes Found
                </h3>


                <p
                  className="
                    text-sm
                    text-slate-500
                    leading-relaxed
                    mb-5
                  "
                >

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
                  onClick={
                    handleClearSearch
                  }
                  className="
                    px-5
                    py-2.5
                    rounded-xl
                    bg-gradient-to-r
                    from-sky-500
                    to-blue-600
                    text-white
                    text-xs
                    font-semibold
                    shadow-lg
                    shadow-sky-200
                    hover:scale-105
                    transition-all
                    duration-300
                  "
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
          className="
            fixed
            inset-0
            z-50
            bg-slate-900/40
            backdrop-blur-md
            flex
            items-center
            justify-center
            p-4
          "
          onClick={() =>
            setSelectedSchemeModal(
              null
            )
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
              shadow-sky-200/40
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* MODAL HEADER */}

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
                      border
                      border-sky-200
                      text-sky-600
                      text-xs
                      font-semibold
                    "
                  >

                    {getCategory(
                      selectedSchemeModal
                    )}

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
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-sky-50
                    border
                    border-sky-200
                    text-slate-400
                    hover:text-slate-800
                    hover:border-sky-400
                    flex
                    items-center
                    justify-center
                    shrink-0
                    transition
                  "
                >

                  <FaTimes />

                </button>

              </div>

            </div>


            {/* MODAL CONTENT */}

            <div
              className="
                p-6
                space-y-7
              "
            >


              {/* OVERVIEW */}

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

                  {getDescription(
                    selectedSchemeModal
                  )}

                </p>

              </div>


              {/* ELIGIBILITY */}

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
                  Eligibility Criteria
                </h4>


                <div
                  className="
                    p-4
                    rounded-2xl
                    bg-sky-50
                    border
                    border-sky-100
                  "
                >

                  <p
                    className="
                      text-sm
                      text-slate-600
                      leading-relaxed
                    "
                  >

                    {getEligibility(
                      selectedSchemeModal
                    )}

                  </p>

                </div>

              </div>


              {/* DOCUMENTS */}

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
                  Documents Required
                </h4>


                <div
                  className="
                    space-y-2
                  "
                >

                  {getDocuments(
                    selectedSchemeModal
                  ).map(
                    (
                      document,
                      index
                    ) => (

                      <div
                        key={index}
                        className="
                          flex
                          items-center
                          gap-3
                          p-3
                          rounded-xl
                          bg-sky-50
                          border
                          border-sky-100
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


              {/* ACTIONS */}

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
                  onClick={() =>
                    setSelectedSchemeModal(
                      null
                    )
                  }
                  className="
                    px-5
                    py-3
                    rounded-xl
                    bg-sky-50
                    border
                    border-sky-200
                    text-slate-600
                    text-sm
                    font-semibold
                    hover:text-slate-900
                    hover:border-sky-400
                    transition
                  "
                >
                  Close
                </button>


                <a
                  href="https://myScheme.gov.in"
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

                    shadow-lg
                    shadow-sky-200

                    hover:scale-[1.02]

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


export default SchemeRecommendation;