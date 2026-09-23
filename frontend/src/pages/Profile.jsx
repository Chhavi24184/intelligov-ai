import { useEffect, useRef, useState } from "react";
import {
  FaUserCircle,
  FaEnvelope,
  FaArrowLeft,
  FaCheckCircle,
  FaSave,
  FaGlobe,
  FaMapMarkerAlt,
  FaBriefcase,
  FaGraduationCap,
  FaRupeeSign,
  FaUsers,
  FaHeart,
  FaCalendarAlt,
  FaSpinner,
  FaExclamationCircle,
  FaChevronDown,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getProfileAPI, updateProfileAPI } from "../services/api";

// =========================================================
// TRANSLATION STRINGS  (en / hi / pa — others fall back to en)
// =========================================================
const T = {
  en: {
    title: "My Profile",
    subtitle: "Complete your profile to get personalised government scheme recommendations",
    badge: "Citizen Profile",
    back: "Back to Dashboard",
    saveBtn: "Save Profile",
    saving: "Saving…",
    saved: "Saved Successfully!",
    saveError: "Save failed. Please try again.",
    language: "Preferred Language",
    age: "Age",
    agePlaceholder: "e.g. 28",
    state: "State / UT",
    statePrompt: "Select your state",
    district: "District",
    districtPlaceholder: "e.g. Ludhiana",
    education: "Education Level",
    educationPrompt: "Select education",
    occupation: "Occupation",
    occupationPrompt: "Select occupation",
    income: "Annual Family Income",
    incomePrompt: "Select income range",
    category: "Social Category",
    categoryPrompt: "Select category",
    interests: "Areas of Interest",
    interestsHint: "Select all that apply",
    accountStatus: "Account Status",
    active: "Active",
    yourAccountActive: "Your account is active and verified",
    completion: "Profile Completion",
    completionHint: "A complete profile helps AI find the most relevant schemes for you",
    personalInfo: "Personal Information",
    locationInfo: "Location",
    backgroundInfo: "Background",
    preferencesInfo: "Preferences",
  },
  hi: {
    title: "मेरी प्रोफ़ाइल",
    subtitle: "व्यक्तिगत सरकारी योजनाएँ पाने के लिए अपनी प्रोफ़ाइल पूरी करें",
    badge: "नागरिक प्रोफ़ाइल",
    back: "डैशबोर्ड पर वापस जाएं",
    saveBtn: "प्रोफ़ाइल सहेजें",
    saving: "सहेजा जा रहा है…",
    saved: "सफलतापूर्वक सहेजा गया!",
    saveError: "सहेजने में विफल। पुनः प्रयास करें।",
    language: "पसंदीदा भाषा",
    age: "आयु",
    agePlaceholder: "जैसे 28",
    state: "राज्य / केंद्र शासित प्रदेश",
    statePrompt: "अपना राज्य चुनें",
    district: "जिला",
    districtPlaceholder: "जैसे लुधियाना",
    education: "शिक्षा स्तर",
    educationPrompt: "शिक्षा चुनें",
    occupation: "व्यवसाय",
    occupationPrompt: "व्यवसाय चुनें",
    income: "वार्षिक पारिवारिक आय",
    incomePrompt: "आय सीमा चुनें",
    category: "सामाजिक श्रेणी",
    categoryPrompt: "श्रेणी चुनें",
    interests: "रुचि के क्षेत्र",
    interestsHint: "सभी लागू विकल्प चुनें",
    accountStatus: "खाता स्थिति",
    active: "सक्रिय",
    yourAccountActive: "आपका खाता सक्रिय और सत्यापित है",
    completion: "प्रोफ़ाइल पूर्णता",
    completionHint: "पूर्ण प्रोफ़ाइल से AI सर्वाधिक प्रासंगिक योजनाएँ खोजता है",
    personalInfo: "व्यक्तिगत जानकारी",
    locationInfo: "स्थान",
    backgroundInfo: "पृष्ठभूमि",
    preferencesInfo: "प्राथमिकताएँ",
  },
  pa: {
    title: "ਮੇਰੀ ਪ੍ਰੋਫਾਈਲ",
    subtitle: "ਵਿਅਕਤੀਗਤ ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ ਲਈ ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਪੂਰੀ ਕਰੋ",
    badge: "ਨਾਗਰਿਕ ਪ੍ਰੋਫਾਈਲ",
    back: "ਡੈਸ਼ਬੋਰਡ ਤੇ ਵਾਪਸ ਜਾਓ",
    saveBtn: "ਪ੍ਰੋਫਾਈਲ ਸੇਵ ਕਰੋ",
    saving: "ਸੇਵ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ…",
    saved: "ਸਫਲਤਾਪੂਰਵਕ ਸੇਵ ਹੋਇਆ!",
    saveError: "ਸੇਵ ਅਸਫਲ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    language: "ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ",
    age: "ਉਮਰ",
    agePlaceholder: "ਜਿਵੇਂ 28",
    state: "ਸੂਬਾ / ਕੇਂਦਰ ਸ਼ਾਸਿਤ ਪ੍ਰਦੇਸ਼",
    statePrompt: "ਆਪਣਾ ਸੂਬਾ ਚੁਣੋ",
    district: "ਜ਼ਿਲ੍ਹਾ",
    districtPlaceholder: "ਜਿਵੇਂ ਲੁਧਿਆਣਾ",
    education: "ਸਿੱਖਿਆ ਪੱਧਰ",
    educationPrompt: "ਸਿੱਖਿਆ ਚੁਣੋ",
    occupation: "ਕਿੱਤਾ",
    occupationPrompt: "ਕਿੱਤਾ ਚੁਣੋ",
    income: "ਸਾਲਾਨਾ ਪਰਿਵਾਰਕ ਆਮਦਨ",
    incomePrompt: "ਆਮਦਨ ਸੀਮਾ ਚੁਣੋ",
    category: "ਸਮਾਜਿਕ ਸ਼੍ਰੇਣੀ",
    categoryPrompt: "ਸ਼੍ਰੇਣੀ ਚੁਣੋ",
    interests: "ਦਿਲਚਸਪੀ ਦੇ ਖੇਤਰ",
    interestsHint: "ਸਾਰੇ ਲਾਗੂ ਵਿਕਲਪ ਚੁਣੋ",
    accountStatus: "ਖਾਤਾ ਸਥਿਤੀ",
    active: "ਸਰਗਰਮ",
    yourAccountActive: "ਤੁਹਾਡਾ ਖਾਤਾ ਸਰਗਰਮ ਅਤੇ ਤਸਦੀਕਸ਼ੁਦਾ ਹੈ",
    completion: "ਪ੍ਰੋਫਾਈਲ ਪੂਰਨਤਾ",
    completionHint: "ਪੂਰੀ ਪ੍ਰੋਫਾਈਲ ਨਾਲ AI ਸਭ ਤੋਂ ਸੰਬੰਧਿਤ ਯੋਜਨਾਵਾਂ ਲੱਭਦਾ ਹੈ",
    personalInfo: "ਨਿੱਜੀ ਜਾਣਕਾਰੀ",
    locationInfo: "ਸਥਾਨ",
    backgroundInfo: "ਪਿਛੋਕੜ",
    preferencesInfo: "ਪਸੰਦਾਂ",
  },
};

// =========================================================
// SINGLE AUTHORITATIVE LANGUAGE LIST — 23 Indian languages
// Used by the dropdown, display, save/load, and localStorage.
// Do NOT duplicate this list anywhere else in this file.
// =========================================================
const LANGUAGES = [
  { code: "en",  label: "English",   native: "English" },
  { code: "hi",  label: "Hindi",     native: "हिन्दी" },
  { code: "bn",  label: "Bengali",   native: "বাংলা" },
  { code: "te",  label: "Telugu",    native: "తెలుగు" },
  { code: "mr",  label: "Marathi",   native: "मराठी" },
  { code: "ta",  label: "Tamil",     native: "தமிழ்" },
  { code: "gu",  label: "Gujarati",  native: "ગુજરાતી" },
  { code: "ur",  label: "Urdu",      native: "اردو" },
  { code: "kn",  label: "Kannada",   native: "ಕನ್ನಡ" },
  { code: "or",  label: "Odia",      native: "ଓଡ଼ିଆ" },
  { code: "ml",  label: "Malayalam", native: "മലയാളം" },
  { code: "pa",  label: "Punjabi",   native: "ਪੰਜਾਬੀ" },
  { code: "as",  label: "Assamese",  native: "অসমীয়া" },
  { code: "mai", label: "Maithili",  native: "मैथिली" },
  { code: "sa",  label: "Sanskrit",  native: "संस्कृतम्" },
  { code: "ne",  label: "Nepali",    native: "नेपाली" },
  { code: "kok", label: "Konkani",   native: "कोंकणी" },
  { code: "mni", label: "Manipuri",  native: "মণিপুরী" },
  { code: "ks",  label: "Kashmiri",  native: "कश्मीरी" },
  { code: "sd",  label: "Sindhi",    native: "سنڌي" },
  { code: "doi", label: "Dogri",     native: "डोगरी" },
  { code: "brx", label: "Bodo",      native: "बड़ो" },
  { code: "sat", label: "Santali",   native: "সাঁওতালি" },
];

// =========================================================
// DATA CONSTANTS
// =========================================================

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

const EDUCATIONS = [
  "No Formal Education","Primary (1–5)","Middle (6–8)","Secondary (9–10)",
  "Higher Secondary (11–12)","Diploma / ITI","Graduate","Post Graduate","PhD",
];

const OCCUPATIONS = [
  "Farmer","Agricultural Labourer","Self-Employed / Business",
  "Private Sector Employee","Government Employee","Student",
  "Daily Wage Worker","Artisan / Craftsperson","Street Vendor",
  "Unemployed","Homemaker","Other",
];

const INCOMES = [
  "Below ₹1 lakh","₹1–2.5 lakh","₹2.5–5 lakh","₹5–8 lakh","Above ₹8 lakh",
];

const CATEGORIES = [
  "General","OBC","SC","ST","EWS","Minority","PwD",
];

const INTERESTS = [
  "Agriculture","Education","Healthcare","Housing","Business / Startup",
  "Skill Development","Employment","Women Welfare",
  "Pension / Social Security","Energy / Solar","Insurance",
];

// Fields that count toward completion (excluding interests which is optional)
const COMPLETION_FIELDS = ["age","state","district","education","occupation","income","category"];

// =========================================================
// HELPERS
// =========================================================

function calcCompletion(form) {
  const filled = COMPLETION_FIELDS.filter((f) => {
    const v = form[f];
    return v !== "" && v !== null && v !== undefined;
  });
  const interestBonus = form.interests?.length > 0 ? 1 : 0;
  const total = COMPLETION_FIELDS.length + 1;
  return Math.round(((filled.length + interestBonus) / total) * 100);
}

function completionColor(pct) {
  if (pct < 30) return { bar: "bg-red-400",   text: "text-red-600",   label: "Just started" };
  if (pct < 60) return { bar: "bg-amber-400",  text: "text-amber-600", label: "In progress" };
  if (pct < 90) return { bar: "bg-sky-500",    text: "text-sky-600",   label: "Almost there" };
  return           { bar: "bg-emerald-500", text: "text-emerald-600", label: "Complete" };
}

// =========================================================
// SUB-COMPONENTS
// =========================================================

function SectionHeading({ icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-sky-500 text-sm">{icon}</span>
      <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
        {label}
      </span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

function FieldLabel({ label, filled }) {
  return (
    <div className="flex items-center justify-between mb-1">
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      {filled && (
        <FaCheckCircle className="text-emerald-400 text-[10px]" />
      )}
    </div>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-slate-800 " +
  "focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition";

const filledCls   = "border-emerald-300";
const emptyBorder = "border-slate-200";

// =========================================================
// SEARCHABLE LANGUAGE DROPDOWN
// Reads from LANGUAGES — the single authoritative list above.
// =========================================================

function LanguageDropdown({ value, onChange }) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef       = useRef(null);

  // Find selected language entry; default to English if code not found
  const selected = LANGUAGES.find((l) => l.code === value) || LANGUAGES[0];

  // Filter list by search query (matches English label or native name)
  const filtered = query.trim()
    ? LANGUAGES.filter(
        (l) =>
          l.label.toLowerCase().includes(query.toLowerCase()) ||
          l.native.toLowerCase().includes(query.toLowerCase())
      )
    : LANGUAGES;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (code) => {
    onChange(code);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`${inputCls} ${value && value !== "en" ? filledCls : emptyBorder} flex items-center justify-between gap-2`}
      >
        <span className="flex items-center gap-2">
          <FaGlobe className="text-sky-400 shrink-0" />
          <span className="font-medium">{selected.label}</span>
          <span className="text-slate-400 text-xs">— {selected.native}</span>
        </span>
        <FaChevronDown
          className={`text-slate-400 text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
            <FaSearch className="text-slate-400 text-xs shrink-0" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search language…"
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-slate-400 hover:text-slate-600"
              >
                <FaTimes className="text-xs" />
              </button>
            )}
          </div>

          {/* Options list — all 23 languages */}
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-xs text-slate-400 text-center">No language found</li>
            ) : (
              filtered.map((lang) => (
                <li key={lang.code}>
                  <button
                    type="button"
                    onClick={() => select(lang.code)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors duration-100 ${
                      value === lang.code
                        ? "bg-sky-50 text-sky-700 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{lang.label}</span>
                    <span className="text-slate-400 text-xs">{lang.native}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// =========================================================
// MAIN COMPONENT
// =========================================================

function Profile() {
  const navigate  = useNavigate();
  const userId    = localStorage.getItem("userId");
  const userName  = localStorage.getItem("userName") || "Citizen";
  const userEmail = localStorage.getItem("userEmail") || "";

  // language state — initialized from localStorage, overwritten by DB on load
  const [language, setLanguage] = useState(
    localStorage.getItem("userLanguage") || "en"
  );
  // Use translated UI strings; fall back to English for unsupported codes
  const t = T[language] || T.en;

  const EMPTY_FORM = {
    age: "",
    state: "",
    district: "",
    education: "",
    occupation: "",
    income: "",
    category: "",
    interests: [],
    language,
  };

  const [form,       setForm]       = useState(EMPTY_FORM);
  const [loading,    setLoading]    = useState(true);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle|saving|saved|error
  const [loadError,  setLoadError]  = useState(false);

  // -------------------------------------------------------
  // Load profile from server
  // -------------------------------------------------------
  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    setLoading(true);
    getProfileAPI(userId)
      .then((data) => {
        const p = data?.profile || {};
        // Use stored language code; validate it exists in LANGUAGES, else default "en"
        const rawLang = p.language || "en";
        const lang = LANGUAGES.some((l) => l.code === rawLang) ? rawLang : "en";

        setLanguage(lang);
        localStorage.setItem("userLanguage", lang);

        setForm({
          age:        p.age != null ? String(p.age) : "",
          state:      p.state      || "",
          district:   p.district   || "",
          education:  p.education  || "",
          occupation: p.occupation || "",
          income:     p.income     || "",
          category:   p.category   || "",
          interests: p.interests
            ? p.interests.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          language: lang,
        });
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [userId]);

  // -------------------------------------------------------
  // Field change helpers
  // -------------------------------------------------------
  const set = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleInterest = (interest) =>
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));

  // Language change: update both the standalone `language` state
  // AND the `form.language` field, AND localStorage immediately.
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    set("language", lang);
    localStorage.setItem("userLanguage", lang);
  };

  // -------------------------------------------------------
  // Save profile
  // -------------------------------------------------------
  const handleSave = async () => {
    if (!userId) return;
    setSaveStatus("saving");
    try {
      await updateProfileAPI({
        user_id:    Number(userId),
        age:        form.age !== "" ? Number(form.age) : null,
        state:      form.state      || null,
        district:   form.district   || null,
        education:  form.education  || null,
        occupation: form.occupation || null,
        income:     form.income     || null,
        category:   form.category   || null,
        interests:  form.interests.length ? form.interests.join(", ") : null,
        language:   form.language,
      });
      localStorage.setItem("userLanguage", form.language);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3500);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3500);
    }
  };

  // -------------------------------------------------------
  // Completion meter
  // -------------------------------------------------------
  const completion = calcCompletion(form);
  const { bar: barCls, text: textCls, label: pctLabel } = completionColor(completion);

  // -------------------------------------------------------
  // Loading state
  // -------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <FaSpinner className="text-3xl animate-spin text-sky-500" />
          <span className="text-sm">Loading your profile…</span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------
  // Load error state
  // -------------------------------------------------------
  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center max-w-sm space-y-4">
          <FaExclamationCircle className="text-red-400 text-3xl mx-auto" />
          <p className="text-sm font-semibold text-slate-700">
            Could not load your profile. Please check your connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------
  // Main render
  // -------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-400/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-400/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-16 space-y-5">

        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-500 text-xs font-medium hover:text-sky-600 hover:border-sky-300 transition-all"
        >
          <FaArrowLeft className="text-[10px]" />
          {t.back}
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-600 text-[10px] font-semibold uppercase tracking-wider">
            <FaUserCircle /> {t.badge}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{t.title}</h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">{t.subtitle}</p>
        </div>

        {/* User identity card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-14 h-14 shrink-0 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center">
            <FaUserCircle className="text-sky-400 text-3xl" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-800 text-base truncate">{userName}</p>
            {userEmail && (
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                <FaEnvelope className="shrink-0 text-[10px]" /> {userEmail}
              </p>
            )}
          </div>
          <span className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-semibold">
            {t.active}
          </span>
        </div>

        {/* Completion meter */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">{t.completion}</span>
            <span className={`text-xs font-bold ${textCls}`}>
              {completion}% — {pctLabel}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${barCls}`}
              style={{ width: `${completion}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400">{t.completionHint}</p>
        </div>

        {/* ── Language selector ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <SectionHeading icon={<FaGlobe />} label={t.language} />
          <p className="text-[10px] text-slate-400 mb-2">
            AI Chat will respond in your selected language
          </p>
          {/* LanguageDropdown reads LANGUAGES — the single 23-language list */}
          <LanguageDropdown value={language} onChange={handleLanguageChange} />
        </div>

        {/* ── Personal Information ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
          <SectionHeading icon={<FaCalendarAlt />} label={t.personalInfo} />

          <div>
            <FieldLabel label={t.age} filled={form.age !== ""} />
            <input
              type="number"
              min="5"
              max="120"
              value={form.age}
              onChange={(e) => set("age", e.target.value)}
              placeholder={t.agePlaceholder}
              className={`${inputCls} ${form.age ? filledCls : emptyBorder}`}
            />
          </div>
        </div>

        {/* ── Location ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
          <SectionHeading icon={<FaMapMarkerAlt />} label={t.locationInfo} />

          <div>
            <FieldLabel label={t.state} filled={!!form.state} />
            <select
              value={form.state}
              onChange={(e) => set("state", e.target.value)}
              className={`${inputCls} ${form.state ? filledCls : emptyBorder}`}
            >
              <option value="">{t.statePrompt}</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel label={t.district} filled={!!form.district} />
            <input
              type="text"
              value={form.district}
              onChange={(e) => set("district", e.target.value)}
              placeholder={t.districtPlaceholder}
              className={`${inputCls} ${form.district ? filledCls : emptyBorder}`}
            />
          </div>
        </div>

        {/* ── Background ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
          <SectionHeading icon={<FaGraduationCap />} label={t.backgroundInfo} />

          <div>
            <FieldLabel label={t.education} filled={!!form.education} />
            <select
              value={form.education}
              onChange={(e) => set("education", e.target.value)}
              className={`${inputCls} ${form.education ? filledCls : emptyBorder}`}
            >
              <option value="">{t.educationPrompt}</option>
              {EDUCATIONS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel label={t.occupation} filled={!!form.occupation} />
            <select
              value={form.occupation}
              onChange={(e) => set("occupation", e.target.value)}
              className={`${inputCls} ${form.occupation ? filledCls : emptyBorder}`}
            >
              <option value="">{t.occupationPrompt}</option>
              {OCCUPATIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel label={t.income} filled={!!form.income} />
            <select
              value={form.income}
              onChange={(e) => set("income", e.target.value)}
              className={`${inputCls} ${form.income ? filledCls : emptyBorder}`}
            >
              <option value="">{t.incomePrompt}</option>
              {INCOMES.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel label={t.category} filled={!!form.category} />
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set("category", form.category === c ? "" : c)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                    form.category === c
                      ? "bg-sky-500 text-white border-sky-500 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:border-sky-300 hover:bg-sky-50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Interests ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <SectionHeading icon={<FaHeart />} label={t.interests} />
          <p className="text-[10px] text-slate-400 mb-3">{t.interestsHint}</p>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => {
              const sel = form.interests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                    sel
                      ? "bg-sky-500 text-white border-sky-500"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:border-sky-300 hover:bg-sky-50"
                  }`}
                >
                  {sel ? "✓ " : ""}{interest}
                </button>
              );
            })}
          </div>
          {form.interests.length > 0 && (
            <p className="text-[10px] text-sky-600 mt-2">
              {form.interests.length} selected: {form.interests.join(", ")}
            </p>
          )}
        </div>

        {/* ── Save button ── */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 shadow-sm ${
            saveStatus === "saved"
              ? "bg-emerald-500 text-white shadow-emerald-200"
              : saveStatus === "error"
              ? "bg-red-500 text-white"
              : saveStatus === "saving"
              ? "bg-sky-400 text-white cursor-not-allowed"
              : "bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:shadow-md hover:shadow-sky-200 hover:scale-[1.01]"
          }`}
        >
          {saveStatus === "saving" ? (
            <><FaSpinner className="animate-spin" /> {t.saving}</>
          ) : saveStatus === "saved" ? (
            <><FaCheckCircle /> {t.saved}</>
          ) : saveStatus === "error" ? (
            <><FaExclamationCircle /> {t.saveError}</>
          ) : (
            <><FaSave /> {t.saveBtn}</>
          )}
        </button>

        {saveStatus === "saved" && (
          <div className="text-center text-xs text-emerald-600 font-medium animate-pulse">
            ✓ Go to AI Chat to get personalised recommendations based on your profile
          </div>
        )}

      </div>
    </div>
  );
}

export default Profile;
