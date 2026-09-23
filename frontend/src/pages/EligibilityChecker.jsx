import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaUser,
  FaUserCheck,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaBriefcase,
  FaFileAlt,
  FaRedo,
  FaAward,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowRight,
  FaExternalLinkAlt,
} from "react-icons/fa";

import { eligibilityAPI } from "../services/api";

// ── All Indian states + UTs ──────────────────────────────
const ALL_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

// ── Income ranges matching Profile page ─────────────────
const INCOME_OPTIONS = [
  "Below ₹1 lakh",
  "₹1–2.5 lakh",
  "₹2.5–5 lakh",
  "₹5–8 lakh",
  "Above ₹8 lakh",
];

// ── Occupation options matching Profile page ─────────────
const OCCUPATION_OPTIONS = [
  "Farmer","Agricultural Labourer","Self-Employed / Business",
  "Private Sector Employee","Government Employee","Student",
  "Daily Wage Worker","Artisan / Craftsperson","Street Vendor",
  "Unemployed","Homemaker","Other",
];

// ── Social category options ──────────────────────────────
const CATEGORY_OPTIONS = [
  "General",
  "OBC",
  "SC",
  "ST",
  "EWS",
];

// ── Education options ────────────────────────────────────
const EDUCATION_OPTIONS = [
  "Below 10th","10th / Matric","12th / Higher Secondary",
  "Diploma / ITI","Graduate","Post Graduate","PhD / Research","Other",
];

function EligibilityChecker() {
  const navigate = useNavigate();

  // =====================================================
  // STORAGE KEY
  // =====================================================

  const getCurrentUserKey = () => {

    const email = localStorage.getItem("userEmail");

    if (email) {
      return email.toLowerCase().trim();
    }

    return "guest";
  };


  const getEligibilityStorageKey = () => {
    return `eligibilityData_${getCurrentUserKey()}`;
  };


  // =====================================================
  // FORM DATA
  // =====================================================

  const [formData, setFormData] = useState({
    age: "",
    occupation: "",
    gender: "",
    income: "",
    state: "",
    category: "",
    education: "",
  });


  // =====================================================
  // RESULTS
  // =====================================================

  const [schemes, setSchemes] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [checked, setChecked] = useState(false);

  const [selectedScheme, setSelectedScheme] = useState(null);


  // =====================================================
  // RESTORE SAVED ELIGIBILITY DATA
  // =====================================================

  useEffect(() => {

    const storageKey = getEligibilityStorageKey();

    try {

      const savedData = localStorage.getItem(storageKey);

      if (!savedData) {
        return;
      }

      const parsedData = JSON.parse(savedData);


      // Restore profile
      if (
        parsedData?.formData &&
        typeof parsedData.formData === "object"
      ) {

        setFormData({
          age: parsedData.formData.age || "",
          occupation: parsedData.formData.occupation || "",
          gender: parsedData.formData.gender || "",
          income: parsedData.formData.income || "",
          state: parsedData.formData.state || "",
          category: parsedData.formData.category || "",
          education: parsedData.formData.education || "",
        });

      }


      // Restore eligible schemes
      if (Array.isArray(parsedData?.schemes)) {

        setSchemes(parsedData.schemes);

      }


      // Restore checked state
      if (parsedData?.checked === true) {

        setChecked(true);

      }


    } catch (restoreError) {

      console.error(
        "Unable to restore eligibility data:",
        restoreError
      );

    }

  }, []);


  // =====================================================
  // SAVE ELIGIBILITY DATA
  // =====================================================

  const saveEligibilityData = (
    updatedFormData,
    updatedSchemes
  ) => {

    const storageKey = getEligibilityStorageKey();

    const eligibilityData = {

      formData: updatedFormData,

      schemes: updatedSchemes,

      checked: true,

      savedAt: new Date().toISOString(),

    };


    try {

      localStorage.setItem(
        storageKey,
        JSON.stringify(eligibilityData)
      );


      // Tell Dashboard / other components that
      // eligibility data has changed.
      window.dispatchEvent(
        new Event("eligibilityUpdated")
      );


    } catch (storageError) {

      console.error(
        "Unable to save eligibility data:",
        storageError
      );

    }

  };


  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  };


  // =====================================================
  // EXTRACT SCHEMES
  // =====================================================

  const extractSchemes = (data) => {

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


  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      setError("");

      setSelectedScheme(null);


      const payload = {
        age:        Number(formData.age),
        occupation: formData.occupation,
        gender:     formData.gender,
        // income is now a string range — pass as-is, backend handles it
        income:     formData.income || "0",
        state:      formData.state,
        category:   formData.category || "",
        education:  formData.education || "",
      };


      console.log(
        "Eligibility Request:",
        payload
      );


      const data = await eligibilityAPI(payload);


      console.log(
        "Eligibility Response:",
        data
      );


      const recommendedSchemes =
        extractSchemes(data);


      // =================================================
      // UPDATE REACT STATE
      // =================================================

      setSchemes(recommendedSchemes);

      setChecked(true);


      // =================================================
      // SAVE EVERYTHING PERMANENTLY UNTIL RESET
      // =================================================

      saveEligibilityData(
        formData,
        recommendedSchemes
      );


      if (data?.success === false) {

        setError(
          data?.message ||
          "Unable to process your eligibility."
        );

      }


    } catch (err) {

      console.error(
        "Eligibility API Error:",
        err
      );


      const errorMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Could not connect to the server. Please make sure the backend server is running.";


      setError(errorMessage);


      /*
        IMPORTANT:

        We do NOT remove previously saved eligibility
        data here.

        This means if the user already had a successful
        eligibility result, a temporary API error will
        not erase it.
      */

      setChecked(true);


    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // RESET
  // =====================================================

  const handleReset = () => {

    const storageKey =
      getEligibilityStorageKey();


    // =================================================
    // REMOVE SAVED DATA ONLY WHEN RESET IS PRESSED
    // =================================================

    try {

      localStorage.removeItem(
        storageKey
      );

    } catch (storageError) {

      console.error(
        "Unable to remove eligibility data:",
        storageError
      );

    }


    // =================================================
    // CLEAR REACT STATE
    // =================================================

    setFormData({
      age: "",
      occupation: "",
      gender: "",
      income: "",
      state: "",
      category: "",
      education: "",
    });


    setSchemes([]);

    setError("");

    setChecked(false);

    setSelectedScheme(null);


    // =================================================
    // UPDATE DASHBOARD
    // =================================================

    window.dispatchEvent(
      new Event("eligibilityUpdated")
    );

  };


  // =====================================================
  // HELPERS
  // =====================================================

  const getSchemeName = (scheme) =>

    scheme.name ||
    scheme.title ||
    scheme.scheme_name ||
    "Government Welfare Scheme";


  const getCategory = (scheme) =>

    scheme.category ||
    scheme.type ||
    "Welfare Scheme";


  const getDescription = (scheme) =>

    scheme.description ||
    scheme.details ||
    "This scheme may provide benefits based on your profile.";


  const getEligibility = (scheme) =>

    scheme.eligibility ||
    scheme.eligibility_criteria ||
    "Eligibility details are available on the official scheme portal.";


  const getDocuments = (scheme) => {

    if (Array.isArray(scheme.documents)) {

      return scheme.documents;

    }


    if (Array.isArray(scheme.documents_required)) {

      return scheme.documents_required;

    }


    if (scheme.documents) {

      return [scheme.documents];

    }


    if (scheme.documents_required) {

      return [scheme.documents_required];

    }


    return [

      "Aadhaar Card",

      "Income Certificate",

      "Residence Proof",

      "Bank Details",

    ];

  };


  const getApplyUrl = (scheme) =>

    scheme.application_link ||
    scheme.apply_url ||
    scheme.application_url ||
    scheme.url ||
    "https://www.myscheme.gov.in/";


  return (

    <div className="w-full min-h-screen bg-white text-slate-900">

      {/* =====================================================
          MAIN SECTION
      ===================================================== */}

      <section className="relative min-h-screen overflow-hidden bg-white py-12 px-4 sm:px-6">

        {/* =================================================
            BACKGROUND LIGHTS
        ================================================= */}

        <div className="absolute inset-0 pointer-events-none overflow-hidden">

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
              bottom-0
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
              top-[45%]
              left-1/2
              -translate-x-1/2
              w-[500px]
              h-[300px]
              bg-cyan-300/5
              rounded-full
              blur-3xl
            "
          />

        </div>


        <div className="relative max-w-6xl mx-auto">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="text-center max-w-3xl mx-auto mb-10">

            <span
              className="
                inline-block
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
                mb-5
              "
            >
              Smart Citizen Matcher
            </span>


            <h1
              className="
                text-4xl
                sm:text-5xl
                lg:text-6xl
                font-black
                tracking-tight
                text-slate-900
              "
            >

              Check Scheme{" "}

              <span
                className="
                  bg-gradient-to-r
                  from-sky-500
                  to-blue-600
                  bg-clip-text
                  text-transparent
                "
              >
                Eligibility
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
              Enter your basic profile details and let IntelliGov AI
              identify government schemes that may be suitable for you.
            </p>

          </div>


          {/* =================================================
              FORM CARD
          ================================================= */}

          <div
            className="
              bg-white
              p-6
              sm:p-10
              rounded-3xl
              border border-sky-200/70
              shadow-xl
              shadow-sky-100/50
              transition-all
              duration-500
            "
          >

            <form
              onSubmit={handleSubmit}
              className="space-y-7"
            >

              {/* FORM GRID */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* AGE */}

                <div className="space-y-2">

                  <label
                    className="
                      text-xs
                      font-semibold
                      text-slate-700
                      uppercase
                      tracking-wider
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <FaUser className="text-sky-500" />
                    Age
                  </label>


                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="e.g. 24"
                    min="1"
                    max="120"
                    required
                    className="
                      w-full
                      bg-sky-50/50
                      border border-sky-200
                      focus:border-sky-400
                      focus:ring-2
                      focus:ring-sky-100
                      outline-none
                      p-3.5
                      rounded-xl
                      text-sm
                      text-slate-900
                      placeholder-slate-400
                      transition-all
                    "
                  />

                </div>


                {/* OCCUPATION */}

                <div className="space-y-2">

                  <label
                    className="
                      text-xs font-semibold text-slate-700 uppercase
                      tracking-wider flex items-center gap-2
                    "
                  >
                    <FaBriefcase className="text-blue-500" />
                    Occupation
                  </label>

                  <select
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    required
                    className="
                      w-full bg-sky-50/50 border border-sky-200
                      focus:border-sky-400 focus:ring-2 focus:ring-sky-100
                      outline-none p-3.5 rounded-xl text-sm text-slate-900
                      transition-all
                    "
                  >
                    <option value="">Select occupation</option>
                    {OCCUPATION_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>

                </div>


                {/* GENDER */}

                <div className="space-y-2">

                  <label
                    className="
                      text-xs
                      font-semibold
                      text-slate-700
                      uppercase
                      tracking-wider
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <FaUserCheck className="text-amber-500" />
                    Gender
                  </label>


                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="
                      w-full
                      bg-sky-50/50
                      border border-sky-200
                      focus:border-sky-400
                      focus:ring-2
                      focus:ring-sky-100
                      outline-none
                      p-3.5
                      rounded-xl
                      text-sm
                      text-slate-900
                      transition-all
                    "
                  >

                    <option value="">
                      Select Gender
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>


                {/* INCOME */}

                <div className="space-y-2">

                  <label
                    className="
                      text-xs font-semibold text-slate-700 uppercase
                      tracking-wider flex items-center gap-2
                    "
                  >
                    <FaMoneyBillWave className="text-emerald-500" />
                    Annual Family Income
                  </label>

                  <select
                    name="income"
                    value={formData.income}
                    onChange={handleChange}
                    required
                    className="
                      w-full bg-sky-50/50 border border-sky-200
                      focus:border-sky-400 focus:ring-2 focus:ring-sky-100
                      outline-none p-3.5 rounded-xl text-sm text-slate-900
                      transition-all
                    "
                  >
                    <option value="">Select income range</option>
                    {INCOME_OPTIONS.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>

                </div>


                {/* STATE */}

                <div className="md:col-span-2 space-y-2">

                  <label
                    className="
                      text-xs
                      font-semibold
                      text-slate-700
                      uppercase
                      tracking-wider
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <FaMapMarkerAlt className="text-rose-500" />
                    State of Residence
                  </label>


                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="
                      w-full
                      bg-sky-50/50
                      border border-sky-200
                      focus:border-sky-400
                      focus:ring-2
                      focus:ring-sky-100
                      outline-none
                      p-3.5
                      rounded-xl
                      text-sm
                      text-slate-900
                      transition-all
                    "
                  >
                    <option value="">Select State / UT</option>
                    {ALL_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                </div>

                {/* SOCIAL CATEGORY */}

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <FaUserCheck className="text-purple-500" />
                    Social Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-sky-50/50 border border-sky-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none p-3.5 rounded-xl text-sm text-slate-900 transition-all"
                  >
                    <option value="">Select category (optional)</option>
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* EDUCATION */}

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <FaAward className="text-indigo-500" />
                    Education
                  </label>
                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    className="w-full bg-sky-50/50 border border-sky-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none p-3.5 rounded-xl text-sm text-slate-900 transition-all"
                  >
                    <option value="">Select education (optional)</option>
                    {EDUCATION_OPTIONS.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>

              </div>


              {/* =================================================
                  BUTTONS
              ================================================= */}

              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  items-center
                  justify-center
                  gap-3
                  pt-6
                  border-t
                  border-sky-100
                "
              >

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full
                    sm:w-auto
                    px-8
                    py-3.5
                    rounded-xl
                    bg-gradient-to-r
                    from-sky-500
                    to-blue-600
                    text-white
                    font-bold
                    text-sm
                    shadow-lg
                    shadow-sky-200/60
                    hover:scale-[1.02]
                    hover:shadow-xl
                    transition-all
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    flex
                    items-center
                    justify-center
                    gap-2
                  "
                >

                  {loading ? (
                    <>
                      <span
                        className="
                          w-4
                          h-4
                          border-2
                          border-white
                          border-t-transparent
                          rounded-full
                          animate-spin
                        "
                      />

                      Evaluating Profile...
                    </>
                  ) : (
                    <>
                      <FaAward />
                      Check Schemes
                    </>
                  )}

                </button>


                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="
                    w-full
                    sm:w-auto
                    px-7
                    py-3.5
                    rounded-xl
                    bg-white
                    border border-sky-200
                    text-slate-600
                    text-sm
                    font-semibold
                    hover:text-sky-600
                    hover:border-sky-400
                    hover:bg-sky-50
                    transition-all
                    flex
                    items-center
                    justify-center
                    gap-2
                    disabled:opacity-50
                  "
                >

                  <FaRedo className="text-xs" />

                  Reset

                </button>

              </div>

            </form>

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div
              className="
                mt-7
                bg-red-50
                border border-red-200
                rounded-2xl
                p-5
                flex
                items-start
                gap-4
              "
            >

              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-red-100
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >

                <FaExclamationTriangle className="text-red-500" />

              </div>


              <div>

                <h3 className="text-sm font-bold text-red-600 mb-1">
                  Unable to Check Eligibility
                </h3>


                <p className="text-xs text-red-500/80 leading-relaxed">
                  {error}
                </p>

              </div>

            </div>

          )}


          {/* =================================================
              RESULTS
          ================================================= */}

          {checked && !error && schemes.length > 0 && (

            <div className="mt-12">

              {/* Results Header */}

              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-end
                  justify-between
                  gap-3
                  mb-6
                "
              >

                <div>

                  <span
                    className="
                      text-xs
                      uppercase
                      tracking-wider
                      text-sky-600
                      font-semibold
                    "
                  >
                    AI Recommendation Results
                  </span>


                  <h2
                    className="
                      text-2xl
                      sm:text-3xl
                      font-black
                      text-slate-900
                      mt-1
                    "
                  >
                    Schemes You May Qualify For
                  </h2>

                </div>


                <div
                  className="
                    px-4
                    py-2
                    rounded-full
                    bg-emerald-50
                    border border-emerald-200
                    text-emerald-600
                    text-xs
                    font-semibold
                    flex
                    items-center
                    gap-2
                    w-fit
                  "
                >

                  <FaCheckCircle />

                  {schemes.length} Match
                  {schemes.length !== 1 ? "es" : ""}

                </div>

              </div>


              {/* Scheme Cards */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {schemes.map((scheme, index) => (

                  <div
                    key={
                      scheme.id ||
                      scheme.scheme_id ||
                      index
                    }
                    className="
                      group
                      relative
                      bg-white
                      border border-sky-200/70
                      rounded-3xl
                      p-6
                      flex
                      flex-col
                      shadow-sm
                      transition-all
                      duration-500
                      ease-[cubic-bezier(0.22,1,0.36,1)]
                      hover:border-sky-400/60
                      hover:-translate-y-2
                      hover:shadow-xl
                      hover:shadow-sky-100/70
                    "
                  >

                    {/* Hover Glow */}

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

                      {/* Card Header */}

                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-4
                          mb-5
                        "
                      >

                        <div
                          className="
                            w-11
                            h-11
                            rounded-xl
                            bg-sky-50
                            border border-sky-200
                            flex
                            items-center
                            justify-center
                            shrink-0
                            group-hover:border-sky-400/60
                            group-hover:scale-110
                            group-hover:-rotate-2
                            transition-all
                            duration-500
                          "
                        >

                          <FaAward className="text-sky-500" />

                        </div>


                        {scheme.category && (

                          <span
                            className="
                              px-3
                              py-1.5
                              rounded-full
                              bg-sky-50
                              border border-sky-200
                              text-sky-600
                              text-[11px]
                              font-medium
                            "
                          >
                            {scheme.category}
                          </span>

                        )}

                      </div>


                      {/* Name */}

                      <h3
                        className="
                          text-xl
                          font-bold
                          text-slate-900
                          mb-3
                          group-hover:text-sky-600
                          transition-colors
                          duration-300
                        "
                      >
                        {getSchemeName(scheme)}
                      </h3>


                      {/* Description */}

                      <p
                        className="
                          text-sm
                          text-slate-600
                          leading-relaxed
                          mb-5
                        "
                      >
                        {getDescription(scheme)}
                      </p>


                      {/* Eligibility */}

                      <div
                        className="
                          p-4
                          rounded-2xl
                          bg-sky-50/70
                          border border-sky-100
                          mb-4
                        "
                      >

                        <div
                          className="
                            text-[11px]
                            uppercase
                            tracking-wider
                            font-bold
                            text-sky-600
                            mb-2
                            flex
                            items-center
                            gap-2
                          "
                        >

                          <FaCheckCircle />

                          Eligibility

                        </div>


                        <p className="text-xs text-slate-600 leading-relaxed">
                          {getEligibility(scheme)}
                        </p>

                      </div>


                      {/* Documents */}

                      <div
                        className="
                          p-4
                          rounded-2xl
                          bg-slate-50
                          border border-slate-200
                          mb-5
                        "
                      >

                        <div
                          className="
                            text-[11px]
                            uppercase
                            tracking-wider
                            font-bold
                            text-slate-500
                            mb-2
                            flex
                            items-center
                            gap-2
                          "
                        >

                          <FaFileAlt className="text-sky-500" />

                          Documents Required

                        </div>


                        <div className="space-y-1.5">

                          {getDocuments(scheme)
                            .slice(0, 5)
                            .map((document, docIndex) => (

                              <div
                                key={docIndex}
                                className="
                                  flex
                                  items-center
                                  gap-2
                                  text-xs
                                  text-slate-600
                                "
                              >

                                <span
                                  className="
                                    w-1.5
                                    h-1.5
                                    rounded-full
                                    bg-sky-400
                                    shrink-0
                                  "
                                />

                                {document}

                              </div>

                            ))}

                        </div>

                      </div>


                      {/* Actions */}

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-3
                          pt-2
                        "
                      >

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedScheme(scheme)
                          }
                          className="
                            text-xs
                            font-semibold
                            text-sky-600
                            hover:text-blue-600
                            flex
                            items-center
                            gap-2
                            transition-all
                            group-hover:translate-x-1
                          "
                        >

                          View Details

                          <FaArrowRight className="text-[10px]" />

                        </button>


                        <div className="flex gap-2 flex-wrap">
                          {/* Apply with AI Agent */}
                          <button
                            type="button"
                            onClick={() => {
                              const encoded = encodeURIComponent(JSON.stringify(scheme));
                              navigate(`/apply?scheme=${encoded}`);
                            }}
                            className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-xs font-semibold hover:scale-[1.02] transition-all shadow-sm"
                          >
                            Apply with AI Agent ✦
                          </button>
                          {/* Direct portal */}
                          {(scheme.official_url || getApplyUrl(scheme) !== "https://www.myscheme.gov.in/") && (
                            <a
                              href={scheme.official_url || getApplyUrl(scheme)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:border-sky-300 hover:text-sky-600 transition-all flex items-center gap-1"
                            >
                              Portal <FaExternalLinkAlt className="text-[9px]" />
                            </a>
                          )}
                        </div>

                      </div>

                    </div>


                    {/* Bottom Glow */}

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

                ))}

              </div>

            </div>

          )}


          {/* =================================================
              EMPTY RESULTS
          ================================================= */}

          {checked &&
            !error &&
            schemes.length === 0 && (

              <div
                className="
                  mt-10
                  bg-white
                  border border-sky-200
                  p-8
                  rounded-3xl
                  text-center
                  shadow-sm
                "
              >

                <div
                  className="
                    w-14
                    h-14
                    mx-auto
                    mb-4
                    rounded-2xl
                    bg-sky-50
                    border border-sky-200
                    flex
                    items-center
                    justify-center
                    text-2xl
                  "
                >
                  🔍
                </div>


                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  No Schemes Matched
                </h3>


                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  No schemes were returned for the profile you
                  provided. Try changing your occupation, income,
                  age, or state and check again.
                </p>

              </div>

            )}

        </div>

      </section>


      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedScheme && (

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
          onClick={() => setSelectedScheme(null)}
        >

          <div
            className="
              w-full
              max-w-2xl
              max-h-[88vh]
              overflow-y-auto
              bg-white
              border border-sky-200
              rounded-3xl
              shadow-2xl
            "
            onClick={(e) => e.stopPropagation()}
          >

            {/* Modal Header */}

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

              <div className="flex items-start justify-between gap-4">

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
                    {getCategory(selectedScheme)}
                  </span>


                  <h2
                    className="
                      text-2xl
                      font-black
                      text-slate-900
                      mt-3
                    "
                  >
                    {getSchemeName(selectedScheme)}
                  </h2>

                </div>


                <button
                  type="button"
                  onClick={() => setSelectedScheme(null)}
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-slate-50
                    border border-slate-200
                    text-slate-500
                    hover:text-sky-600
                    hover:border-sky-300
                    flex
                    items-center
                    justify-center
                    transition-all
                  "
                  aria-label="Close details"
                >
                  ✕
                </button>

              </div>

            </div>


            {/* Modal Content */}

            <div className="p-6 space-y-6">

              <div>

                <h4
                  className="
                    text-xs
                    uppercase
                    tracking-wider
                    text-sky-600
                    font-semibold
                    mb-2
                  "
                >
                  Description
                </h4>


                <p className="text-sm text-slate-600 leading-relaxed">
                  {getDescription(selectedScheme)}
                </p>

              </div>


              <div>

                <h4
                  className="
                    text-xs
                    uppercase
                    tracking-wider
                    text-sky-600
                    font-semibold
                    mb-2
                  "
                >
                  Eligibility
                </h4>


                <p
                  className="
                    text-sm
                    text-slate-600
                    leading-relaxed
                    p-4
                    rounded-2xl
                    bg-sky-50/70
                    border border-sky-100
                  "
                >
                  {getEligibility(selectedScheme)}
                </p>

              </div>


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


                <div className="space-y-2">

                  {getDocuments(selectedScheme).map(
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
                          border border-slate-200
                        "
                      >

                        <FaCheckCircle className="text-emerald-500" />

                        <span className="text-sm text-slate-600">
                          {document}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>


              {/* Modal Action */}

              <div
                className="
                  pt-4
                  border-t
                  border-sky-100
                  flex
                  justify-end
                "
              >

                <a
                  href={getApplyUrl(selectedScheme)}
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
                    gap-2
                    shadow-lg
                    shadow-sky-200/50
                    hover:scale-[1.02]
                    transition-all
                  "
                >

                  Apply Now

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

export default EligibilityChecker;