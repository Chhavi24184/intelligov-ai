import { useState } from "react";

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
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import { eligibilityAPI } from "../services/api";

function EligibilityChecker() {
  // =====================================================
  // FORM STATE
  // =====================================================

  const [formData, setFormData] = useState({
    age: "",
    occupation: "",
    gender: "",
    income: "",
    state: "",
  });

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checked, setChecked] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);

  // Current step:
  // 1 = Personal Details
  // 2 = Financial Details
  // 3 = Location
  // 4 = Results
  const [currentStep, setCurrentStep] = useState(1);

  // =====================================================
  // STEP DATA
  // =====================================================

  const steps = [
    {
      number: 1,
      title: "Personal Details",
      description: "Basic profile",
      icon: FaUser,
    },
    {
      number: 2,
      title: "Financial Details",
      description: "Income & occupation",
      icon: FaMoneyBillWave,
    },
    {
      number: 3,
      title: "Location",
      description: "State of residence",
      icon: FaMapMarkerAlt,
    },
    {
      number: 4,
      title: "Results",
      description: "Matched schemes",
      icon: FaAward,
    },
  ];

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
  // EXTRACT SCHEMES FROM API RESPONSE
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

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    if (Array.isArray(data?.data?.results)) {
      return data.data.results;
    }

    return [];
  };

  // =====================================================
  // SUBMIT ELIGIBILITY
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setChecked(false);
      setSchemes([]);
      setSelectedScheme(null);

      const payload = {
        age: Number(formData.age),
        occupation: formData.occupation,
        gender: formData.gender,
        income: Number(formData.income),
        state: formData.state,
      };

      console.log("Eligibility Request:", payload);

      const data = await eligibilityAPI(payload);

      console.log("Eligibility Response:", data);

      const recommendedSchemes = extractSchemes(data);

      setSchemes(recommendedSchemes);
      setChecked(true);
      setCurrentStep(4);

      if (data?.success === false) {
        setError(
          data?.message || "Unable to process your eligibility."
        );
      }
    } catch (err) {
      console.error("Eligibility API Error:", err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Could not connect to the server. Please make sure the backend server is running."
      );

      setSchemes([]);
      setChecked(true);
      setCurrentStep(4);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RESET
  // =====================================================

  const handleReset = () => {
    setFormData({
      age: "",
      occupation: "",
      gender: "",
      income: "",
      state: "",
    });

    setSchemes([]);
    setError("");
    setChecked(false);
    setSelectedScheme(null);
    setCurrentStep(1);
  };

  // =====================================================
  // STEP NAVIGATION
  // =====================================================

  const goToStep = (step) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step);
    }
  };

  // =====================================================
  // HELPERS
  // =====================================================

  const getSchemeName = (scheme) =>
    scheme?.name ||
    scheme?.title ||
    scheme?.scheme_name ||
    scheme?.schemeName ||
    "Government Welfare Scheme";

  const getCategory = (scheme) =>
    scheme?.category ||
    scheme?.type ||
    "Welfare Scheme";

  const getDescription = (scheme) =>
    scheme?.description ||
    scheme?.details ||
    scheme?.about ||
    "This scheme may provide benefits based on your profile.";

  const getEligibility = (scheme) =>
    scheme?.eligibility ||
    scheme?.eligibility_criteria ||
    scheme?.eligibilityCriteria ||
    "Eligibility details are available on the official scheme portal.";

  const getBenefits = (scheme) => {
    if (Array.isArray(scheme?.benefits)) {
      return scheme.benefits;
    }

    if (scheme?.benefits) {
      return [scheme.benefits];
    }

    if (scheme?.benefit) {
      return [scheme.benefit];
    }

    return ["Benefits are available to eligible citizens under this scheme."];
  };

  const getDocuments = (scheme) => {
    if (Array.isArray(scheme?.documents)) {
      return scheme.documents;
    }

    if (Array.isArray(scheme?.documents_required)) {
      return scheme.documents_required;
    }

    if (Array.isArray(scheme?.documentsRequired)) {
      return scheme.documentsRequired;
    }

    if (scheme?.documents) {
      return [scheme.documents];
    }

    if (scheme?.documents_required) {
      return [scheme.documents_required];
    }

    return [
      "Aadhaar Card",
      "Income Certificate",
      "Residence Proof",
      "Bank Details",
    ];
  };

  const getMinistry = (scheme) =>
    scheme?.ministry ||
    scheme?.department ||
    "Government of India";

  const getApplicationLink = (scheme) =>
    scheme?.application_link ||
    scheme?.apply_url ||
    scheme?.applicationUrl ||
    scheme?.official_website ||
    scheme?.officialWebsite ||
    "https://www.myscheme.gov.in/";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="w-full min-h-screen bg-[#060c17] text-white">

      {/* =====================================================
          MAIN SECTION
      ===================================================== */}

      <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#060c17] via-[#091528] to-[#060c17] py-12 px-4 sm:px-6">

        {/* =================================================
            BACKGROUND GLOW
        ================================================= */}

        <div className="absolute top-10 left-[-120px] w-[450px] h-[450px] bg-blue-600/15 blur-[160px] rounded-full pointer-events-none" />

        <div className="absolute bottom-10 right-[-120px] w-[400px] h-[400px] bg-cyan-500/15 blur-[150px] rounded-full pointer-events-none" />

        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="text-center max-w-3xl mx-auto mb-10">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-5">

              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />

              Smart Citizen Matcher

            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">

              Check Scheme{" "}

              <span className="bg-gradient-to-r from-cyan-300 via-white to-amber-400 bg-clip-text text-transparent">
                Eligibility
              </span>

            </h1>

            <p className="text-slate-400 text-sm sm:text-base mt-4 max-w-2xl mx-auto leading-relaxed">

              Enter your basic profile details and let IntelliGov AI
              identify government schemes that may be suitable for you.

            </p>

          </div>

          {/* =================================================
              STEP INDICATOR
          ================================================= */}

          <div className="mb-10">

            <div className="bg-[#081224]/80 backdrop-blur-xl border border-blue-900/40 rounded-3xl p-5 sm:p-7">

              <div className="flex items-center justify-between">

                {steps.map((step, index) => {

                  const Icon = step.icon;

                  const isActive = currentStep === step.number;
                  const isCompleted = currentStep > step.number;

                  return (
                    <div
                      key={step.number}
                      className="flex items-center flex-1"
                    >

                      {/* STEP */}

                      <div className="flex flex-col items-center min-w-[65px] sm:min-w-[110px]">

                        <button
                          type="button"
                          onClick={() => goToStep(step.number)}
                          className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                            isActive
                              ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20"
                              : isCompleted
                              ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-300"
                              : "bg-[#0b1528] border-blue-900/50 text-slate-500"
                          }`}
                        >

                          {isCompleted ? (
                            <FaCheckCircle className="text-lg sm:text-xl" />
                          ) : (
                            <Icon className="text-base sm:text-lg" />
                          )}

                        </button>

                        <div
                          className={`text-[10px] sm:text-xs font-bold mt-2 text-center ${
                            isActive
                              ? "text-cyan-300"
                              : isCompleted
                              ? "text-emerald-300"
                              : "text-slate-500"
                          }`}
                        >
                          {step.title}
                        </div>

                        <div className="hidden sm:block text-[10px] text-slate-600 mt-1">
                          {step.description}
                        </div>

                      </div>

                      {/* CONNECTOR */}

                      {index < steps.length - 1 && (
                        <div
                          className={`h-[2px] flex-1 mx-1 sm:mx-3 transition-all duration-500 ${
                            currentStep > step.number
                              ? "bg-emerald-400/60"
                              : "bg-blue-900/50"
                          }`}
                        />
                      )}

                    </div>
                  );
                })}

              </div>

            </div>

          </div>

          {/* =================================================
              FORM CARD
          ================================================= */}

          <div className="bg-[#081224]/80 backdrop-blur-xl p-6 sm:p-10 rounded-3xl border border-blue-900/50 shadow-2xl shadow-blue-950/20">

            <form onSubmit={handleSubmit} className="space-y-7">

              {/* =================================================
                  FORM GRID
              ================================================= */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* AGE */}

                <div className="space-y-2">

                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">

                    <FaUser className="text-cyan-400" />

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
                    className="w-full bg-[#0b1528] border border-blue-900/50 focus:border-cyan-400/60 outline-none p-3.5 rounded-xl text-sm text-white placeholder-slate-500 transition"
                  />

                </div>

                {/* OCCUPATION */}

                <div className="space-y-2">

                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">

                    <FaBriefcase className="text-blue-400" />

                    Occupation

                  </label>

                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    placeholder="e.g. Farmer, Student, Artisan"
                    required
                    className="w-full bg-[#0b1528] border border-blue-900/50 focus:border-cyan-400/60 outline-none p-3.5 rounded-xl text-sm text-white placeholder-slate-500 transition"
                  />

                </div>

                {/* GENDER */}

                <div className="space-y-2">

                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">

                    <FaUserCheck className="text-amber-400" />

                    Gender

                  </label>

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0b1528] border border-blue-900/50 focus:border-cyan-400/60 outline-none p-3.5 rounded-xl text-sm text-white transition"
                  >

                    <option value="" className="bg-[#081224]">
                      Select Gender
                    </option>

                    <option value="Male" className="bg-[#081224]">
                      Male
                    </option>

                    <option value="Female" className="bg-[#081224]">
                      Female
                    </option>

                    <option value="Other" className="bg-[#081224]">
                      Other
                    </option>

                  </select>

                </div>

                {/* INCOME */}

                <div className="space-y-2">

                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">

                    <FaMoneyBillWave className="text-emerald-400" />

                    Annual Income

                  </label>

                  <input
                    type="number"
                    name="income"
                    value={formData.income}
                    onChange={handleChange}
                    placeholder="e.g. 250000"
                    min="0"
                    required
                    className="w-full bg-[#0b1528] border border-blue-900/50 focus:border-cyan-400/60 outline-none p-3.5 rounded-xl text-sm text-white placeholder-slate-500 transition"
                  />

                </div>

                {/* STATE */}

                <div className="md:col-span-2 space-y-2">

                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">

                    <FaMapMarkerAlt className="text-rose-400" />

                    State of Residence

                  </label>

                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0b1528] border border-blue-900/50 focus:border-cyan-400/60 outline-none p-3.5 rounded-xl text-sm text-white transition"
                  >

                    <option value="" className="bg-[#081224]">
                      Select State
                    </option>

                    <option value="Haryana">
                      Haryana
                    </option>

                    <option value="Punjab">
                      Punjab
                    </option>

                    <option value="Delhi">
                      Delhi
                    </option>

                    <option value="Uttar Pradesh">
                      Uttar Pradesh
                    </option>

                    <option value="Rajasthan">
                      Rajasthan
                    </option>

                    <option value="Maharashtra">
                      Maharashtra
                    </option>

                    <option value="Gujarat">
                      Gujarat
                    </option>

                    <option value="Other">
                      Other State
                    </option>

                  </select>

                </div>

              </div>

              {/* =================================================
                  BUTTONS
              ================================================= */}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 border-t border-blue-900/40">

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >

                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />

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
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#0b1528] border border-blue-900/50 text-slate-300 text-sm font-semibold hover:text-white hover:border-cyan-400/40 transition flex items-center justify-center gap-2 disabled:opacity-50"
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

            <div className="mt-7 bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-start gap-4">

              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">

                <FaExclamationTriangle className="text-red-400" />

              </div>

              <div>

                <h3 className="text-sm font-bold text-red-300 mb-1">
                  Unable to Check Eligibility
                </h3>

                <p className="text-xs text-red-300/70 leading-relaxed">
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

              {/* RESULTS HEADER */}

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">

                <div>

                  <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold">
                    AI Recommendation Results
                  </span>

                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                    Schemes You May Qualify For
                  </h2>

                  <p className="text-sm text-slate-500 mt-2">
                    Based on the profile information you provided.
                  </p>

                </div>

                <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 w-fit">

                  <FaCheckCircle />

                  {schemes.length} Match
                  {schemes.length !== 1 ? "es" : ""}

                </div>

              </div>

              {/* SCHEME CARDS */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {schemes.map((scheme, index) => (

                  <div
                    key={
                      scheme?.id ||
                      scheme?.scheme_id ||
                      scheme?.schemeId ||
                      index
                    }
                    className="group bg-[#081224]/85 backdrop-blur-xl border border-blue-900/40 rounded-3xl p-6 hover:border-cyan-400/40 hover:-translate-y-1 transition-all duration-300"
                  >

                    {/* CARD HEADER */}

                    <div className="flex items-start justify-between gap-4 mb-5">

                      <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center shrink-0">

                        <FaAward className="text-cyan-400" />

                      </div>

                      <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 text-[11px] font-medium border border-blue-400/30">

                        {getCategory(scheme)}

                      </span>

                    </div>

                    {/* SCHEME NAME */}

                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">

                      {getSchemeName(scheme)}

                    </h3>

                    {/* DESCRIPTION */}

                    <p className="text-sm text-slate-400 leading-relaxed mb-5">

                      {getDescription(scheme)}

                    </p>

                    {/* ELIGIBILITY */}

                    <div className="p-4 rounded-2xl bg-[#0b1528] border border-blue-900/40 mb-4">

                      <div className="text-[11px] uppercase tracking-wider font-bold text-cyan-400 mb-2 flex items-center gap-2">

                        <FaCheckCircle />

                        Eligibility

                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">

                        {getEligibility(scheme)}

                      </p>

                    </div>

                    {/* BENEFITS */}

                    <div className="p-4 rounded-2xl bg-[#0b1528] border border-blue-900/40 mb-4">

                      <div className="text-[11px] uppercase tracking-wider font-bold text-emerald-400 mb-2">

                        Benefits

                      </div>

                      <div className="space-y-1.5">

                        {getBenefits(scheme)
                          .slice(0, 3)
                          .map((benefit, benefitIndex) => (

                            <div
                              key={benefitIndex}
                              className="flex items-start gap-2 text-xs text-slate-300"
                            >

                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />

                              <span>{benefit}</span>

                            </div>

                          ))}

                      </div>

                    </div>

                    {/* DOCUMENTS */}

                    <div className="p-4 rounded-2xl bg-[#0b1528] border border-blue-900/40 mb-5">

                      <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-2 flex items-center gap-2">

                        <FaFileAlt className="text-cyan-400" />

                        Documents Required

                      </div>

                      <div className="space-y-1.5">

                        {getDocuments(scheme)
                          .slice(0, 5)
                          .map((document, docIndex) => (

                            <div
                              key={docIndex}
                              className="flex items-center gap-2 text-xs text-slate-300"
                            >

                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />

                              <span>{document}</span>

                            </div>

                          ))}

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="flex items-center justify-between gap-3">

                      <button
                        type="button"
                        onClick={() => setSelectedScheme(scheme)}
                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-2 transition"
                      >

                        View Details

                        <FaArrowRight className="text-[10px]" />

                      </button>

                      <a
                        href={getApplicationLink(scheme)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold hover:scale-[1.02] transition flex items-center gap-2"
                      >

                        Apply Now

                        <FaExternalLinkAlt className="text-[9px]" />

                      </a>

                    </div>

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

              <div className="mt-10 bg-[#081224]/80 backdrop-blur-xl border border-blue-900/40 p-8 rounded-3xl text-center">

                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-500/10 flex items-center justify-center text-2xl">
                  🔍
                </div>

                <h3 className="text-lg font-bold text-white mb-2">
                  No Schemes Matched
                </h3>

                <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  No schemes were returned for the profile you
                  provided. Try changing your occupation, income,
                  age, or state and check again.
                </p>

                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-[#0b1528] border border-blue-900/50 text-cyan-300 text-xs font-semibold hover:border-cyan-400/40 transition"
                >
                  Try Again
                </button>

              </div>

            )}

        </div>

      </section>

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedScheme && (

        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedScheme(null)}
        >

          <div
            className="w-full max-w-2xl max-h-[88vh] overflow-y-auto bg-[#081224] border border-cyan-400/30 rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}

            <div className="p-6 border-b border-blue-900/40">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold">

                    {getCategory(selectedScheme)}

                  </span>

                  <h2 className="text-2xl font-black text-white mt-3">

                    {getSchemeName(selectedScheme)}

                  </h2>

                  <p className="text-xs text-slate-500 mt-2">

                    {getMinistry(selectedScheme)}

                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => setSelectedScheme(null)}
                  className="w-10 h-10 rounded-xl bg-[#0b1528] border border-blue-900/40 text-slate-400 hover:text-white transition"
                  aria-label="Close details"
                >
                  ✕
                </button>

              </div>

            </div>

            {/* MODAL BODY */}

            <div className="p-6 space-y-6">

              {/* ABOUT */}

              <div>

                <h4 className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-2">
                  About
                </h4>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {getDescription(selectedScheme)}
                </p>

              </div>

              {/* ELIGIBILITY */}

              <div>

                <h4 className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-2">
                  Eligibility
                </h4>

                <p className="text-sm text-slate-300 leading-relaxed p-4 rounded-2xl bg-[#0b1528] border border-blue-900/40">
                  {getEligibility(selectedScheme)}
                </p>

              </div>

              {/* BENEFITS */}

              <div>

                <h4 className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-3">
                  Benefits
                </h4>

                <div className="space-y-2">

                  {getBenefits(selectedScheme).map(
                    (benefit, index) => (

                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-xl bg-[#0b1528] border border-blue-900/40"
                      >

                        <FaCheckCircle className="text-emerald-400 mt-0.5 shrink-0" />

                        <span className="text-sm text-slate-300">
                          {benefit}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>

              {/* DOCUMENTS */}

              <div>

                <h4 className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-3">
                  Documents Required
                </h4>

                <div className="space-y-2">

                  {getDocuments(selectedScheme).map(
                    (document, index) => (

                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#0b1528] border border-blue-900/40"
                      >

                        <FaFileAlt className="text-cyan-400 shrink-0" />

                        <span className="text-sm text-slate-300">
                          {document}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>

              {/* HOW TO APPLY */}

              <div>

                <h4 className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-2">
                  How to Apply
                </h4>

                <p className="text-sm text-slate-300 leading-relaxed p-4 rounded-2xl bg-[#0b1528] border border-blue-900/40">
                  Visit the official scheme portal using the
                  Apply Now button below and follow the application
                  instructions provided by the concerned authority.
                </p>

              </div>

              {/* ACTION */}

              <div className="pt-4 border-t border-blue-900/40 flex flex-col sm:flex-row justify-end gap-3">

                <button
                  type="button"
                  onClick={() => setSelectedScheme(null)}
                  className="px-6 py-3 rounded-xl bg-[#0b1528] border border-blue-900/50 text-slate-300 text-sm font-semibold hover:text-white transition"
                >
                  Close
                </button>

                <a
                  href={getApplicationLink(selectedScheme)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold flex items-center justify-center gap-2"
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