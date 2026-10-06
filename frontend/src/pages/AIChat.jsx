import { useEffect, useRef, useState } from "react";

import {
  FaRobot,
  FaUser,
  FaTrashAlt,
  FaCopy,
  FaCheck,
  FaPaperPlane,
  FaMicrophone,
  FaShieldAlt,
  FaSearch,
  FaGraduationCap,
  FaTractor,
  FaBriefcase,
  FaHistory,
  FaBookmark,
  FaExternalLinkAlt,
  FaUserEdit,
  FaCalendarAlt,
  FaFileAlt,
} from "react-icons/fa";

import { PiStudentFill } from "react-icons/pi";
import { HiBriefcase } from "react-icons/hi";

import { useNavigate } from "react-router-dom";

import {
  chatAPI,
  saveChatHistoryAPI,
  getProfileAPI,
  saveSchemeAPI,
} from "../services/api";

import robot from "../assets/robot.png";


// =====================================================
// CLEAN AI RESPONSE / HTML ENTITIES
// =====================================================
function cleanAIText(value) {
  if (value == null) return "";

  let text = String(value);

  // Decode common HTML entities emitted by some model responses.
  if (typeof document !== "undefined") {
    const el = document.createElement("textarea");
    el.innerHTML = text;
    text = el.value;
  }

  // Remove escaped markdown markers while keeping readable text.
  text = text.replace(/\\\\\*\\\\\*/g, "**");

  // Remove icon serialization artifacts if they appear in plain text.
  text = text.replace(/svg(?=Save|Deadline|Documents|Official Portal)/g, "");

  // Put numbered recommendations and common fields on separate lines.
  text = text
    .replace(/\\s+(?=\\d+\\.\\s*\\*\\*)/g, "\\n")
    .replace(/\\s+(?=(?:श्रेणी|विवरण|लाभ|पात्रता|क्यों प्रासंगिक|अंतिम तिथि|आवश्यक दस्तावेज़):)/g, "\\n")
    .replace(/\\s+(?=(?:Category|Description|Benefits|Eligibility|Why relevant|Deadline|Documents):)/g, "\\n")
    .replace(/\\n{3,}/g, "\\n\\n")
    .trim();

  return text;
}


// =====================================================
// INLINE SCHEME CARD
// =====================================================

function InlineSchemCard({ scheme, userId, navigate }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const name =
    scheme.name ||
    scheme.scheme_name ||
    "Government Scheme";

  const category = scheme.category || "";

  const description =
    scheme.description || "";

  const benefits =
    scheme.benefits || "";

  const eligibility =
    scheme.eligibility || "";

  const deadline =
    scheme.deadline || "";

  const officialUrl = (() => {
    const raw = scheme.official_url || "";

    if (!raw) return "";

    if (/^https?:\/\//i.test(raw)) {
      return raw;
    }

    return "https://" + raw;
  })();

  const documents = Array.isArray(scheme.documents)
    ? scheme.documents
    : [];

  const reasons = Array.isArray(scheme.eligibility_reasons)
    ? scheme.eligibility_reasons
    : [];


  const handleSave = async () => {
    if (!userId || saving || saved) return;

    setSaving(true);

    try {
      await saveSchemeAPI(userId, scheme);
      setSaved(true);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };


  const handleApplyWithAgent = () => {
    const encoded = encodeURIComponent(
      JSON.stringify(scheme)
    );

    navigate(`/apply?scheme=${encoded}`);
  };


  return (
    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm text-xs space-y-2">

      {/* Header */}
      <div className="flex items-start justify-between gap-2">

        <div>

          <div className="font-bold text-slate-800 text-sm">
            {name}
          </div>

          {category && (
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 text-[10px] font-semibold">
              {category}
            </span>
          )}

        </div>


        {userId && (
          <button
            onClick={handleSave}
            disabled={saving || saved}
            title={saved ? "Saved" : "Save scheme"}
            className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-semibold transition ${
              saved
                ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-cyan-50 hover:border-cyan-200 hover:text-cyan-600"
            }`}
          >
            <FaBookmark className="text-[9px]" />

            {saved
              ? "Saved"
              : saving
              ? "…"
              : "Save"}
          </button>
        )}

      </div>


      {/* Description */}
      {description && (
        <p className="text-slate-600 leading-relaxed">
          {description}
        </p>
      )}


      {/* Benefits */}
      {benefits && (
        <div>
          <span className="font-semibold text-slate-700">
            Benefits:{" "}
          </span>

          <span className="text-slate-600">
            {benefits}
          </span>
        </div>
      )}


      {/* Eligibility */}
      {eligibility && (
        <div>
          <span className="font-semibold text-slate-700">
            Eligibility:{" "}
          </span>

          <span className="text-slate-600">
            {eligibility}
          </span>
        </div>
      )}


      {/* Why relevant */}
      {reasons.length > 0 && (
        <div className="flex flex-wrap gap-1">

          {reasons.map((r, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]"
            >
              ✓ {r}
            </span>
          ))}

        </div>
      )}


      {/* Deadline */}
      {deadline && (
        <div className="flex items-center gap-1 text-amber-700">

          <FaCalendarAlt className="text-[9px]" />

          <span>
            Deadline: {deadline}
          </span>

        </div>
      )}


      {/* Documents */}
      {documents.length > 0 && (
        <div className="flex items-start gap-1 text-slate-600">

          <FaFileAlt className="text-[9px] mt-0.5 shrink-0" />

          <span>

            <span className="font-semibold text-slate-700">
              Documents:{" "}
            </span>

            {documents.join(", ")}

          </span>

        </div>
      )}


      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-1">

        {/* Apply with Agent */}
        {userId && (
          <button
            onClick={handleApplyWithAgent}
            className="
              inline-flex items-center gap-1.5
              px-3 py-1.5
              rounded-lg
              bg-gradient-to-r from-emerald-500 to-cyan-600
              text-white font-semibold text-[11px]
              hover:shadow-md transition
            "
          >
            Apply with AI Agent ✦
          </button>
        )}


        {/* Official Portal */}
        {officialUrl && (
          <a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-1.5
              px-3 py-1.5
              rounded-lg
              bg-white border border-slate-200
              text-slate-600 font-semibold text-[11px]
              hover:border-cyan-300 hover:text-cyan-600 transition
            "
          >
            Official Portal
            <FaExternalLinkAlt className="text-[9px]" />
          </a>
        )}

      </div>

    </div>
  );
}


// =====================================================
// AI CHAT
// =====================================================

function AIChat() {

  const navigate = useNavigate();


  // =====================================================
  // STATES
  // =====================================================

  const [message, setMessage] = useState("");

  const [isListening, setIsListening] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [messages, setMessages] =
    useState([]);

  const [copiedIndex, setCopiedIndex] =
    useState(null);

  const [showChatBottomButton, setShowChatBottomButton] =
    useState(false);

  const [userProfile, setUserProfile] =
    useState(null);


  const chatContainerRef =
    useRef(null);


  const userId =
    localStorage.getItem("userId");

  const language =
    localStorage.getItem("userLanguage") || "en";


  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {

    if (userId) {

      getProfileAPI(userId)
        .then((data) => {

          if (data?.profile) {
            setUserProfile(data.profile);
          }

        })
        .catch(() => {});

    }

  }, [userId]);


  // =====================================================
  // VOICE INPUT
  // =====================================================

  const handleVoiceInput = () => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

      alert(
        "Voice input is not supported in this browser."
      );

      return;
    }


    if (isListening) {
      return;
    }


    const recognition =
      new SpeechRecognition();


    recognition.lang = "en-IN";

    recognition.continuous = false;

    recognition.interimResults = false;


    recognition.onstart = () => {
      setIsListening(true);
    };


    recognition.onresult = (event) => {

      const transcript =
        event.results[0][0].transcript;


      setMessage((prev) =>
        prev
          ? `${prev} ${transcript}`
          : transcript
      );

    };


    recognition.onerror = (event) => {

      console.error(
        "Speech recognition error:",
        event.error
      );

      setIsListening(false);
    };


    recognition.onend = () => {
      setIsListening(false);
    };


    recognition.start();
  };


  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const handleSend = async () => {

    if (!message.trim() || loading) {
      return;
    }


    const userMessage =
      message.trim();


    // User message
    setMessages((prev) => [

      ...prev,

      {
        type: "user",

        text: userMessage,

        timestamp:
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
      },

    ]);


    setMessage("");

    setLoading(true);


    try {

      console.log(
        "Sending message:",
        userMessage
      );


      // =================================================
      // CALL AI CHAT API
      // =================================================

      const response =
        await chatAPI(
          userMessage,
          userProfile,
          language
        );


      console.log(
        "FULL CHAT API RESPONSE:",
        response
      );


      const chatData =
        response?.data ||
        response?.result ||
        response;


      // =================================================
      // AI REPLY
      // =================================================

      const reply =
        chatData?.reply ||
        chatData?.response ||
        chatData?.answer ||
        chatData?.message ||
        response?.reply ||
        response?.response ||
        response?.answer ||
        response?.message ||
        "Sorry, I could not generate a response.";


      // =================================================
      // SCHEMES
      // =================================================

      const recommendedScheme =
        chatData?.recommended_scheme ||
        chatData?.recommendedScheme ||
        response?.recommended_scheme ||
        response?.recommendedScheme ||
        null;


      const recommendedSchemes =
        chatData?.recommended_schemes ||
        response?.recommended_schemes ||
        (recommendedScheme
          ? [recommendedScheme]
          : []);


      const intentType =
        chatData?.intent_type ||
        response?.intent_type ||
        "scheme";


      const profileMissing =
        chatData?.profile_missing ||
        response?.profile_missing ||
        false;


      // =================================================
      // DOCUMENT ELIGIBILITY
      // =================================================

      const documentEligibilityRaw =
        chatData?.document_eligibility ||
        response?.document_eligibility ||
        null;


      const documentEligibility =
        Array.isArray(documentEligibilityRaw)
          ? documentEligibilityRaw[0] || null
          : documentEligibilityRaw;


      const availableDocuments =
        chatData?.available_documents ||
        response?.available_documents ||
        [];


      // =================================================
      // SAVE CHAT HISTORY
      // =================================================

      if (userId) {

        try {

          await saveChatHistoryAPI(
            userId,
            userMessage,
            reply
          );


          console.log(
            "Chat history saved successfully."
          );

        } catch (historyError) {

          console.error(
            "Chat history save failed:",
            historyError
          );

        }

      } else {

        console.warn(
          "No userId found. Chat history was not saved."
        );

      }


      // =================================================
      // SHOW AI RESPONSE
      // =================================================

      setMessages((prev) => [

        ...prev,

        {
          type: "ai",

          text: reply,

          scheme: recommendedScheme,

          schemes: recommendedSchemes,

          intentType,

          profileMissing,

          documentEligibility,

          availableDocuments,

          timestamp:
            new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
        },

      ]);


    } catch (error) {

      console.error(
        "Chat API Error:",
        error
      );


      setMessages((prev) => [

        ...prev,

        {
          type: "ai",

          text:
            "Sorry, I couldn't connect to the server. Please make sure the backend server is running and try again.",

          error: true,

          timestamp:
            new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
        },

      ]);

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // ENTER KEY
  // =====================================================

  const handleKeyDown = (e) => {

    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {

      e.preventDefault();

      handleSend();

    }

  };


  // =====================================================
  // CHAT SCROLL
  // =====================================================

  useEffect(() => {

    const container =
      chatContainerRef.current;


    if (!container) {
      return;
    }


    const handleScroll = () => {

      const distanceFromBottom =
        container.scrollHeight -
        container.scrollTop -
        container.clientHeight;


      setShowChatBottomButton(
        distanceFromBottom > 120
      );

    };


    container.addEventListener(
      "scroll",
      handleScroll
    );


    handleScroll();


    return () => {

      container.removeEventListener(
        "scroll",
        handleScroll
      );

    };

  }, []);


  // =====================================================
  // AUTO SCROLL
  // =====================================================

  useEffect(() => {

    const container =
      chatContainerRef.current;


    if (!container) {
      return;
    }


    setTimeout(() => {

      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });


      setShowChatBottomButton(false);

    }, 50);

  }, [messages, loading]);


  // =====================================================
  // SCROLL TO BOTTOM
  // =====================================================

  const scrollToChatBottom = () => {

    const container =
      chatContainerRef.current;


    if (!container) {
      return;
    }


    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });


    setShowChatBottomButton(false);
  };


  // =====================================================
  // SUGGESTION
  // =====================================================

  const useSuggestion = (question) => {

    setMessage(question);

  };


  // =====================================================
  // CLEAR CURRENT CHAT
  // =====================================================

  const clearHistory = () => {

    setMessages([]);

    setCopiedIndex(null);

  };


  // =====================================================
  // COPY RESPONSE
  // =====================================================

  const copyToClipboard = async (
    text,
    index
  ) => {

    try {

      await navigator.clipboard.writeText(
        text
      );


      setCopiedIndex(index);


      setTimeout(() => {

        setCopiedIndex(null);

      }, 2000);


    } catch (error) {

      console.error(
        "Copy failed:",
        error
      );

    }

  };


  // =====================================================
  // SUGGESTED QUESTIONS
  // =====================================================

  const suggestions = [

    {
      icon: <FaTractor />,

      title: "Farmer Schemes",

      question:
        "What agricultural schemes are available for farmers?",

      color: "text-cyan-500",
    },

    {
      icon: <PiStudentFill />,

      title: "Scholarships",

      question:
        "Tell me about scholarships for college students.",

      color: "text-blue-500",
    },

    {
      icon: <FaShieldAlt />,

      title: "Health Benefits",

      question:
        "How to check eligibility for health schemes?",

      color: "text-emerald-500",
    },

    {
      icon: <HiBriefcase />,

      title: "Jobs & Internships",

      question:
        "Show government job vacancies and internships.",

      color: "text-amber-500",
    },

  ];


  // =====================================================
  // PART 1 ENDS HERE
  // =====================================================
    // =====================================================
  // RETURN UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      <section className="relative max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-8">

        {/* =================================================
            CHAT HEADER
        ================================================= */}

        <div
          className="
            bg-white
            rounded-2xl
            sm:rounded-3xl
            border
            border-slate-200
            shadow-sm
            p-4
            sm:p-6
            mb-4
            sm:mb-5
          "
        >

          <div className="flex items-center justify-between gap-3">

            {/* =================================================
                AI INFORMATION
            ================================================= */}

            <div className="flex items-center gap-3 min-w-0">

              <div className="relative shrink-0">

                <div
                  className="
                    relative
                    w-12
                    h-12
                    sm:w-14
                    sm:h-14
                    rounded-2xl
                    overflow-hidden
                    bg-gradient-to-br
                    from-cyan-100
                    via-blue-50
                    to-white
                    border
                    border-cyan-200
                    flex
                    items-center
                    justify-center
                  "
                >

                  <img
                    src={robot}
                    alt="IntelliGov AI Assistant"
                    className="
                      absolute
                      inset-0
                      w-full
                      h-full
                      object-cover
                    "
                  />

                  <div className="absolute inset-0 bg-cyan-400/5 pointer-events-none" />

                </div>


                <span
                  className="
                    w-3
                    h-3
                    rounded-full
                    bg-emerald-400
                    border-2
                    border-white
                    absolute
                    bottom-0
                    right-0
                  "
                />

              </div>


              <div className="min-w-0">

                <div
                  className="
                    text-base
                    sm:text-2xl
                    font-black
                    text-slate-800
                    flex
                    items-center
                    gap-2
                    flex-wrap
                  "
                >

                  <span>
                    IntelliGov AI Assistant
                  </span>


                  <span
                    className="
                      text-[10px]
                      sm:text-xs
                      px-2.5
                      py-0.5
                      rounded-full
                      bg-emerald-50
                      text-emerald-600
                      border
                      border-emerald-200
                    "
                  >
                    Online
                  </span>

                </div>


                <p
                  className="
                    text-[11px]
                    sm:text-xs
                    text-slate-500
                    mt-1
                    truncate
                    sm:whitespace-normal
                  "
                >
                  Your AI assistant for government schemes,
                  scholarships, healthcare & careers.
                </p>

              </div>

            </div>


            {/* =================================================
                HEADER BUTTONS
            ================================================= */}

            <div className="flex items-center gap-2 shrink-0">

              {/* CHAT HISTORY */}

              <button
                type="button"
                onClick={() =>
                  navigate("/chat-history")
                }
                className="
                  px-3
                  sm:px-4
                  py-2
                  rounded-xl
                  bg-cyan-50
                  border
                  border-cyan-200
                  text-cyan-600
                  text-xs
                  sm:text-sm
                  font-semibold
                  hover:bg-cyan-100
                  hover:border-cyan-300
                  transition
                  flex
                  items-center
                  gap-2
                "
                title="View Chat History"
              >

                <FaHistory />

                <span className="hidden sm:inline">
                  Chat History
                </span>

              </button>


              {/* CLEAR CHAT */}

              {messages.length > 0 && (

                <button
                  type="button"
                  onClick={clearHistory}
                  className="
                    shrink-0
                    px-3
                    sm:px-4
                    py-2
                    rounded-xl
                    bg-red-50
                    border
                    border-red-200
                    text-red-500
                    text-xs
                    font-semibold
                    hover:bg-red-100
                    transition
                    flex
                    items-center
                    gap-2
                  "
                  title="Clear current chat"
                >

                  <FaTrashAlt />

                  <span className="hidden sm:inline">
                    Clear Chat
                  </span>

                </button>

              )}

            </div>

          </div>

        </div>


        {/* =================================================
            CHAT BOX
        ================================================= */}

        <div
          className="
            relative
            bg-white
            rounded-2xl
            sm:rounded-3xl
            border
            border-slate-200
            shadow-sm
            overflow-hidden
          "
        >

          {/* =================================================
              INTERNAL CHAT AREA
          ================================================= */}

          <div
            ref={chatContainerRef}
            className="
              relative
              h-[500px]
              sm:h-[540px]
              overflow-y-auto
              p-3
              sm:p-6
              space-y-5
              scroll-smooth
            "
          >

            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {messages.length === 0 &&
              !loading && (

                <div
                  className="
                    relative
                    min-h-full
                    flex
                    flex-col
                    items-center
                    justify-center
                    text-center
                    px-4
                    py-8
                    overflow-hidden
                  "
                >

                  {/* ROBOT BACKGROUND */}

                  <div
                    className="
                      absolute
                      left-1/2
                      top-1/2
                      -translate-x-1/2
                      -translate-y-[58%]
                      w-[300px]
                      h-[300px]
                      sm:w-[380px]
                      sm:h-[380px]
                      rounded-full
                      bg-cyan-100/60
                      blur-3xl
                      pointer-events-none
                    "
                  />


                  {/* ROBOT */}

                  <div
                    className="
                      relative
                      w-32
                      h-32
                      sm:w-40
                      sm:h-40
                      mb-4
                      flex
                      items-center
                      justify-center
                    "
                  >

                    <div
                      className="
                        absolute
                        inset-[-35px]
                        rounded-full
                        bg-cyan-100
                        blur-3xl
                        pointer-events-none
                      "
                    />


                    <div
                      className="
                        absolute
                        inset-[-10px]
                        rounded-full
                        bg-blue-100
                        blur-2xl
                        pointer-events-none
                      "
                    />


                    <img
                      src={robot}
                      alt="IntelliGov AI"
                      className="
                        relative
                        w-full
                        h-full
                        object-contain
                        opacity-90
                        drop-shadow-[0_0_30px_rgba(34,211,238,0.20)]
                      "
                    />

                  </div>


                  {/* GREETING */}

                  <div
                    className="
                      relative
                      text-2xl
                      sm:text-3xl
                      font-black
                      text-slate-800
                      mb-2
                    "
                  >
                    👋 Namaste!
                  </div>


                  <div
                    className="
                      relative
                      text-lg
                      sm:text-xl
                      font-bold
                      text-cyan-600
                      mb-2
                    "
                  >
                    I'm IntelliGov AI.
                  </div>


                  <p
                    className="
                      relative
                      text-sm
                      text-slate-500
                      max-w-md
                      mb-7
                    "
                  >
                    How can I help you today?
                  </p>


                  {/* QUICK QUESTIONS */}

                  <div className="relative w-full max-w-3xl">

                    <div
                      className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        text-xs
                        text-slate-500
                        uppercase
                        tracking-wider
                        font-semibold
                        mb-3
                      "
                    >

                      <FaSearch className="text-cyan-500" />

                      Try asking

                    </div>


                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                      {/* FARMER */}

                      <button
                        onClick={() =>
                          useSuggestion(
                            "What schemes are available for farmers?"
                          )
                        }
                        className="
                          text-left
                          p-3
                          sm:p-4
                          rounded-xl
                          bg-slate-50
                          border
                          border-slate-200
                          hover:border-cyan-300
                          hover:bg-cyan-50
                          transition-all
                          group
                        "
                      >

                        <div className="flex items-center gap-3">

                          <FaTractor
                            className="
                              text-cyan-500
                              text-lg
                              group-hover:scale-110
                              transition-transform
                            "
                          />

                          <span
                            className="
                              text-xs
                              sm:text-sm
                              text-slate-700
                            "
                          >
                            What schemes are available for farmers?
                          </span>

                        </div>

                      </button>


                      {/* SCHOLARSHIP */}

                      <button
                        onClick={() =>
                          useSuggestion(
                            "Am I eligible for any scholarship?"
                          )
                        }
                        className="
                          text-left
                          p-3
                          sm:p-4
                          rounded-xl
                          bg-slate-50
                          border
                          border-slate-200
                          hover:border-blue-300
                          hover:bg-blue-50
                          transition-all
                          group
                        "
                      >

                        <div className="flex items-center gap-3">

                          <FaGraduationCap
                            className="
                              text-blue-500
                              text-lg
                              group-hover:scale-110
                              transition-transform
                            "
                          />

                          <span
                            className="
                              text-xs
                              sm:text-sm
                              text-slate-700
                            "
                          >
                            Am I eligible for any scholarship?
                          </span>

                        </div>

                      </button>


                      {/* DOCUMENTS */}

                      <button
                        onClick={() =>
                          useSuggestion(
                            "What documents do I need for government schemes?"
                          )
                        }
                        className="
                          text-left
                          p-3
                          sm:p-4
                          rounded-xl
                          bg-slate-50
                          border
                          border-slate-200
                          hover:border-emerald-300
                          hover:bg-emerald-50
                          transition-all
                          group
                        "
                      >

                        <div className="flex items-center gap-3">

                          <FaSearch
                            className="
                              text-emerald-500
                              text-lg
                              group-hover:scale-110
                              transition-transform
                            "
                          />

                          <span
                            className="
                              text-xs
                              sm:text-sm
                              text-slate-700
                            "
                          >
                            What documents do I need?
                          </span>

                        </div>

                      </button>


                      {/* PM KISAN */}

                      <button
                        onClick={() =>
                          useSuggestion(
                            "Tell me about PM Kisan."
                          )
                        }
                        className="
                          text-left
                          p-3
                          sm:p-4
                          rounded-xl
                          bg-slate-50
                          border
                          border-slate-200
                          hover:border-amber-300
                          hover:bg-amber-50
                          transition-all
                          group
                        "
                      >

                        <div className="flex items-center gap-3">

                          <FaBriefcase
                            className="
                              text-amber-500
                              text-lg
                              group-hover:scale-110
                              transition-transform
                            "
                          />

                          <span
                            className="
                              text-xs
                              sm:text-sm
                              text-slate-700
                            "
                          >
                            Tell me about PM Kisan.
                          </span>

                        </div>

                      </button>

                    </div>

                  </div>

                </div>

              )}


            {/* =================================================
                MESSAGES
            ================================================= */}

            {messages.map((msg, idx) => (

              <div key={idx}>

                {/* =================================================
                    USER MESSAGE
                ================================================= */}

                {msg.type === "user" ? (

                  <div className="flex justify-end">

                    <div
                      className="
                        flex
                        gap-2
                        sm:gap-3
                        max-w-[90%]
                        sm:max-w-2xl
                        items-end
                      "
                    >

                      <div
                        className="
                          bg-blue-600
                          text-white
                          rounded-2xl
                          rounded-br-md
                          px-4
                          py-3
                          shadow-sm
                        "
                      >

                        <div className="text-sm whitespace-pre-wrap">
                          {msg.text}
                        </div>


                        <div
                          className="
                            text-[10px]
                            text-blue-100
                            mt-1
                            text-right
                          "
                        >
                          {msg.timestamp}
                        </div>

                      </div>


                      <div
                        className="
                          w-9
                          h-9
                          sm:w-10
                          sm:h-10
                          rounded-xl
                          bg-blue-50
                          border
                          border-blue-200
                          flex
                          items-center
                          justify-center
                          text-blue-600
                          shrink-0
                        "
                      >

                        <FaUser />

                      </div>

                    </div>

                  </div>

                ) : (

                  /* =================================================
                     AI MESSAGE
                  ================================================= */

                  <div
                    className="
                      flex
                      gap-2
                      sm:gap-4
                      max-w-[95%]
                      sm:max-w-2xl
                    "
                  >

                    <div
                      className="
                        w-9
                        h-9
                        sm:w-10
                        sm:h-10
                        rounded-xl
                        bg-cyan-50
                        border
                        border-cyan-200
                        flex
                        items-center
                        justify-center
                        text-cyan-600
                        shrink-0
                      "
                    >

                      <FaRobot />

                    </div>


                    <div className="w-full min-w-0">

                      {/* AI RESPONSE */}

                      <div
                        className={`
                          p-4
                          rounded-2xl
                          text-sm
                          leading-relaxed
                          relative
                          group
                          ${
                            msg.error
                              ? "bg-red-50 border border-red-200 text-red-600"
                              : "bg-slate-50 border border-slate-200 text-slate-700"
                          }
                        `}
                      >

                        <div className="whitespace-pre-wrap pr-6">
                          {msg.text}
                        </div>


                        {/* COPY */}

                        {!msg.error && (

                          <button
                            onClick={() =>
                              copyToClipboard(
                                msg.text,
                                idx
                              )
                            }
                            className="
                              absolute
                              top-3
                              right-3
                              text-slate-400
                              hover:text-cyan-600
                              transition
                              opacity-0
                              group-hover:opacity-100
                              p-1
                            "
                            title="Copy response"
                          >

                            {copiedIndex === idx ? (
                              <FaCheck className="text-emerald-500" />
                            ) : (
                              <FaCopy />
                            )}

                          </button>

                        )}

                      </div>


                      {/* =================================================
                          PROFILE MISSING NUDGE
                      ================================================= */}

                      {msg.profileMissing && (

                        <div
                          className="
                            mt-3
                            p-3
                            rounded-xl
                            bg-amber-50
                            border
                            border-amber-200
                            flex
                            items-center
                            gap-3
                          "
                        >

                          <FaUserEdit className="text-amber-500 shrink-0" />

                          <span className="text-xs text-amber-800">

                            Fill in your{" "}

                            <button
                              onClick={() =>
                                navigate("/profile")
                              }
                              className="
                                underline
                                font-semibold
                                hover:text-amber-600
                              "
                            >
                              Profile
                            </button>

                            {" "}
                            for personalised scheme recommendations.

                          </span>

                        </div>

                      )}


                      {/* =================================================
                          ENRICHED SCHEME CARDS
                      ================================================= */}

                      {!msg.profileMissing &&
                        msg.schemes &&
                        msg.schemes.length > 0 && (

                          <div className="mt-3 space-y-3">

                            <div
                              className="
                                text-xs
                                text-slate-500
                                font-semibold
                                uppercase
                                tracking-wider
                              "
                            >

                              {msg.intentType === "job"
                                ? "🏢 Job Opportunities"
                                : msg.intentType === "scholarship"
                                ? "🎓 Scholarships"
                                : msg.intentType === "internship"
                                ? "💼 Internships"
                                : "📋 Recommended Schemes"}

                              {" "}({msg.schemes.length})

                            </div>


                            {msg.schemes.map(
                              (scheme, si) => (

                                <InlineSchemCard
                                  key={si}
                                  scheme={scheme}
                                  userId={userId}
                                  navigate={navigate}
                                />

                              )
                            )}

                          </div>

                        )}


                      {/* =================================================
                          DOCUMENT ELIGIBILITY
                      ================================================= */}

                      {msg.documentEligibility && (

                        <div
                          className="
                            mt-4
                            rounded-2xl
                            border
                            border-slate-200
                            bg-white
                            shadow-sm
                            overflow-hidden
                          "
                        >

                          {/* HEADER */}

                          <div
                            className="
                              px-4
                              py-3
                              bg-gradient-to-r
                              from-emerald-50
                              to-cyan-50
                              border-b
                              border-slate-200
                              flex
                              items-center
                              justify-between
                              gap-3
                            "
                          >

                            <div className="flex items-center gap-2">

                              <div
                                className="
                                  w-9
                                  h-9
                                  rounded-xl
                                  bg-white
                                  border
                                  border-emerald-200
                                  flex
                                  items-center
                                  justify-center
                                  text-emerald-600
                                "
                              >
                                <FaFileAlt />
                              </div>


                              <div>

                                <div
                                  className="
                                    text-sm
                                    font-bold
                                    text-slate-800
                                  "
                                >
                                  Document Eligibility
                                </div>


                                <div
                                  className="
                                    text-[11px]
                                    text-slate-500
                                  "
                                >
                                  {msg.documentEligibility.scheme_name ||
                                    "Scheme Document Check"}
                                </div>

                              </div>

                            </div>


                            {/* MATCH PERCENTAGE */}

                            <div
                              className="
                                shrink-0
                                px-3
                                py-1.5
                                rounded-full
                                bg-emerald-100
                                text-emerald-700
                                text-xs
                                font-bold
                                border
                                border-emerald-200
                              "
                            >
                              {msg.documentEligibility.document_match_percentage ?? 0}% Match
                            </div>

                          </div>


                          {/* CONTENT */}

                          <div className="p-4 space-y-4">

                            {/* AVAILABLE DOCUMENTS */}

                            {msg.availableDocuments &&
                              msg.availableDocuments.length > 0 && (

                                <div>

                                  <div
                                    className="
                                      text-xs
                                      font-semibold
                                      text-slate-700
                                      mb-2
                                    "
                                  >
                                    Your Available Documents
                                  </div>


                                  <div className="flex flex-wrap gap-2">

                                    {msg.availableDocuments.map(
                                      (doc, i) => (

                                        <span
                                          key={i}
                                          className="
                                            inline-flex
                                            items-center
                                            gap-1
                                            px-2.5
                                            py-1
                                            rounded-full
                                            bg-blue-50
                                            border
                                            border-blue-200
                                            text-blue-700
                                            text-[11px]
                                            font-medium
                                          "
                                        >
                                          ✓ {doc}
                                        </span>

                                      )
                                    )}

                                  </div>

                                </div>

                              )}


                            {/* MATCHED DOCUMENTS */}

                            {msg.documentEligibility.matched_documents &&
                              msg.documentEligibility.matched_documents.length > 0 && (

                                <div>

                                  <div
                                    className="
                                      text-xs
                                      font-semibold
                                      text-emerald-700
                                      mb-2
                                    "
                                  >
                                    Matched Documents
                                  </div>


                                  <div className="space-y-1.5">

                                    {msg.documentEligibility.matched_documents.map(
                                      (doc, i) => (

                                        <div
                                          key={i}
                                          className="
                                            flex
                                            items-center
                                            gap-2
                                            text-xs
                                            text-emerald-700
                                            bg-emerald-50
                                            border
                                            border-emerald-100
                                            rounded-lg
                                            px-3
                                            py-2
                                          "
                                        >
                                          <FaCheck className="shrink-0" />
                                          <span>{doc}</span>
                                        </div>

                                      )
                                    )}

                                  </div>

                                </div>

                              )}


                            {/* MISSING DOCUMENTS */}

                            {msg.documentEligibility.missing_documents &&
                              msg.documentEligibility.missing_documents.length > 0 && (

                                <div>

                                  <div
                                    className="
                                      text-xs
                                      font-semibold
                                      text-red-600
                                      mb-2
                                    "
                                  >
                                    Missing Documents
                                  </div>


                                  <div className="space-y-1.5">

                                    {msg.documentEligibility.missing_documents.map(
                                      (doc, i) => (

                                        <div
                                          key={i}
                                          className="
                                            flex
                                            items-center
                                            gap-2
                                            text-xs
                                            text-red-600
                                            bg-red-50
                                            border
                                            border-red-100
                                            rounded-lg
                                            px-3
                                            py-2
                                          "
                                        >
                                          <span className="font-bold">
                                            ✕
                                          </span>

                                          <span>{doc}</span>

                                        </div>

                                      )
                                    )}

                                  </div>

                                </div>

                              )}


                            {/* STATUS */}

                            <div
                              className="
                                flex
                                items-center
                                justify-between
                                pt-2
                                border-t
                                border-slate-100
                              "
                            >

                              <span
                                className="
                                  text-xs
                                  font-semibold
                                  text-slate-600
                                "
                              >
                                Status
                              </span>


                              <span
                                className={`
                                  px-2.5
                                  py-1
                                  rounded-full
                                  text-[11px]
                                  font-bold
                                  ${
                                    msg.documentEligibility.document_status ===
                                    "Complete"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : msg.documentEligibility.document_status ===
                                        "Partially Complete"
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-slate-100 text-slate-600"
                                  }
                                `}
                              >
                                {msg.documentEligibility.document_status ||
                                  "Not Available"}
                              </span>

                            </div>

                          </div>

                        </div>

                      )}

                    </div>

                  </div>

                )}

              </div>

            ))}


            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (

              <div className="flex gap-2 sm:gap-4 max-w-[95%] sm:max-w-2xl">

                <div
                  className="
                    w-9
                    h-9
                    sm:w-10
                    sm:h-10
                    rounded-xl
                    bg-cyan-50
                    border
                    border-cyan-200
                    flex
                    items-center
                    justify-center
                    text-cyan-600
                    shrink-0
                  "
                >
                  <FaRobot />
                </div>


                <div
                  className="
                    bg-slate-50
                    border
                    border-slate-200
                    rounded-2xl
                    px-4
                    py-3
                    text-sm
                    text-slate-500
                  "
                >
                  <div className="flex items-center gap-1">

                    <span className="animate-bounce">
                      •
                    </span>

                    <span
                      className="animate-bounce"
                      style={{ animationDelay: "0.15s" }}
                    >
                      •
                    </span>

                    <span
                      className="animate-bounce"
                      style={{ animationDelay: "0.3s" }}
                    >
                      •
                    </span>

                  </div>
                </div>

              </div>

            )}

          </div>
                    {/* =================================================
              SCROLL TO BOTTOM BUTTON
          ================================================= */}

          {showChatBottomButton && (

            <button
              type="button"
              onClick={scrollToChatBottom}
              className="
                absolute
                right-4
                bottom-24
                z-20
                w-10
                h-10
                rounded-full
                bg-white
                border
                border-slate-200
                shadow-md
                text-cyan-600
                hover:bg-cyan-50
                hover:border-cyan-300
                transition
                flex
                items-center
                justify-center
              "
              title="Scroll to latest message"
            >
              ↓
            </button>

          )}


          {/* =================================================
              MESSAGE INPUT
          ================================================= */}

          <div
            className="
              border-t
              border-slate-200
              bg-white
              p-3
              sm:p-4
            "
          >

            <div
              className="
                flex
                items-end
                gap-2
                max-w-4xl
                mx-auto
              "
            >

              {/* MESSAGE TEXTAREA */}

              <div className="flex-1 relative">

                <textarea
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  placeholder={
                    "Ask IntelliGov AI about schemes, scholarships, jobs, internships..."
                  }
                  rows={1}
                  disabled={loading}
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    py-3
                    pr-4
                    text-sm
                    text-slate-700
                    placeholder:text-slate-400
                    outline-none
                    focus:border-cyan-400
                    focus:ring-2
                    focus:ring-cyan-100
                    disabled:opacity-60
                    transition
                  "
                />

              </div>


              {/* MIC + SEND */}

              <div className="flex gap-2">

                {/* VOICE INPUT */}

                <button
                  type="button"
                  onClick={handleVoiceInput}
                  disabled={loading}
                  title={
                    isListening
                      ? "Listening..."
                      : "Voice input"
                  }
                  className={`
                    flex
                    items-center
                    justify-center
                    w-11
                    h-11
                    rounded-xl
                    border
                    transition
                    ${
                      isListening
                        ? "bg-red-50 border-red-300 text-red-600"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-cyan-300 hover:text-cyan-600"
                    }
                    disabled:opacity-50
                  `}
                >

                  <FaMicrophone className="text-sm" />

                </button>


                {/* SEND */}

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={
                    !message.trim() ||
                    loading
                  }
                  title="Send message"
                  className="
                    flex
                    items-center
                    justify-center
                    w-11
                    h-11
                    rounded-xl
                    bg-cyan-600
                    text-white
                    shadow-sm
                    hover:bg-cyan-700
                    disabled:bg-slate-200
                    disabled:text-slate-400
                    disabled:cursor-not-allowed
                    transition
                  "
                >

                  <FaPaperPlane className="text-sm" />

                </button>

              </div>

            </div>


            {/* INPUT HINT */}

            <div
              className="
                max-w-4xl
                mx-auto
                mt-2
                px-1
                text-[10px]
                sm:text-[11px]
                text-slate-400
                text-center
              "
            >
              Press Enter to send • Shift + Enter for a new line
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}


// =====================================================
// EXPORT
// =====================================================

export default AIChat;
