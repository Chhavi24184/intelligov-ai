import { useEffect, useRef, useState } from "react";

import {
  FaRobot,
  FaUser,
  FaTrashAlt,
  FaCopy,
  FaCheck,
  FaPaperPlane,
  FaShieldAlt,
  FaSearch,
  FaGraduationCap,
  FaTractor,
  FaBriefcase,
} from "react-icons/fa";

import { PiStudentFill } from "react-icons/pi";
import { HiBriefcase } from "react-icons/hi";

import { chatAPI } from "../services/api";
import robot from "../assets/robot.png";

function AIChat() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showChatBottomButton, setShowChatBottomButton] = useState(false);

  const chatContainerRef = useRef(null);

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: userMessage,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      console.log("Sending message:", userMessage);

      const response = await chatAPI(userMessage);

      console.log("FULL CHAT API RESPONSE:", response);

      const chatData =
        response?.data ||
        response?.result ||
        response;

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

      const recommendedScheme =
        chatData?.recommended_scheme ||
        chatData?.recommendedScheme ||
        response?.recommended_scheme ||
        response?.recommendedScheme ||
        null;

      console.log("AI Reply:", reply);
      console.log("Recommended Scheme:", recommendedScheme);

      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          text: reply,
          scheme: recommendedScheme,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (error) {
      console.error("Chat API Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          text:
            "Sorry, I couldn't connect to the server. Please make sure the backend server is running and try again.",
          error: true,
          timestamp: new Date().toLocaleTimeString([], {
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // =====================================================
  // CHAT SCROLL DETECTION
  // =====================================================

  useEffect(() => {
    const container = chatContainerRef.current;

    if (!container) return;

    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight -
        container.scrollTop -
        container.clientHeight;

      setShowChatBottomButton(distanceFromBottom > 120);
    };

    container.addEventListener("scroll", handleScroll);

    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // =====================================================
  // AUTO SCROLL
  // =====================================================

  useEffect(() => {
    const container = chatContainerRef.current;

    if (!container) return;

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
    const container = chatContainerRef.current;

    if (!container) return;

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
  // CLEAR CHAT
  // =====================================================

  const clearHistory = () => {
    setMessages([]);
    setCopiedIndex(null);
  };

  // =====================================================
  // COPY RESPONSE
  // =====================================================

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopiedIndex(index);

      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
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
      color: "text-cyan-400",
    },
    {
      icon: <PiStudentFill />,
      title: "Scholarships",
      question:
        "Tell me about scholarships for college students.",
      color: "text-blue-400",
    },
    {
      icon: <FaShieldAlt />,
      title: "Health Benefits",
      question:
        "How to check eligibility for health schemes?",
      color: "text-emerald-400",
    },
    {
      icon: <HiBriefcase />,
      title: "Jobs & Internships",
      question:
        "Show government job vacancies and internships.",
      color: "text-amber-400",
    },
  ];

  return (
    <div className="min-h-screen bg-[#060c17] text-white">

      <section className="relative max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-8">

        {/* =================================================
            CHAT HEADER
        ================================================= */}

        <div className="glass-panel rounded-2xl sm:rounded-3xl border border-blue-900/40 p-4 sm:p-6 mb-4 sm:mb-5">

          <div className="flex items-center justify-between gap-3">

            {/* AI INFORMATION */}

            <div className="flex items-center gap-3 min-w-0">

              {/* FIXED ROBOT BOX */}

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
                    from-cyan-500/15
                    via-blue-600/10
                    to-transparent
                    border
                    border-cyan-400/40
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

                  {/* Subtle overlay to blend robot with box */}
                  <div className="absolute inset-0 bg-cyan-400/5 pointer-events-none" />

                </div>

                {/* ONLINE INDICATOR */}

                <span
                  className="
                    w-3
                    h-3
                    rounded-full
                    bg-emerald-400
                    border-2
                    border-[#060c17]
                    absolute
                    bottom-0
                    right-0
                  "
                />

              </div>


              <div className="min-w-0">

                <div className="text-base sm:text-2xl font-black text-white flex items-center gap-2 flex-wrap">

                  <span>
                    IntelliGov AI Assistant
                  </span>

                  <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-400/30">
                    Online
                  </span>

                </div>

                <p className="text-[11px] sm:text-xs text-slate-400 mt-1 truncate sm:whitespace-normal">
                  Your AI assistant for government schemes, scholarships,
                  healthcare & careers.
                </p>

              </div>

            </div>


            {/* CLEAR CHAT */}

            {messages.length > 0 && (
              <button
                onClick={clearHistory}
                className="
                  shrink-0
                  px-3
                  sm:px-4
                  py-2
                  rounded-xl
                  bg-red-500/10
                  border
                  border-red-500/30
                  text-red-300
                  text-xs
                  font-semibold
                  hover:bg-red-500/20
                  transition
                  flex
                  items-center
                  gap-2
                "
              >
                <FaTrashAlt />

                <span className="hidden sm:inline">
                  Clear Chat
                </span>
              </button>
            )}

          </div>

        </div>


        {/* =================================================
            CHAT BOX
        ================================================= */}

        <div className="relative glass-panel rounded-2xl sm:rounded-3xl border border-blue-900/40 overflow-hidden">

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

            {messages.length === 0 && !loading && (

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

                {/* =================================================
                    PREMIUM CENTER ROBOT BACKGROUND
                ================================================= */}

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
                    bg-cyan-500/5
                    blur-3xl
                    pointer-events-none
                  "
                />

                {/* LARGE BLENDED ROBOT */}

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

                  {/* Outer glow */}

                  <div
                    className="
                      absolute
                      inset-[-35px]
                      rounded-full
                      bg-cyan-400/5
                      blur-3xl
                      pointer-events-none
                    "
                  />

                  {/* Soft blue aura */}

                  <div
                    className="
                      absolute
                      inset-[-10px]
                      rounded-full
                      bg-blue-500/5
                      blur-2xl
                      pointer-events-none
                    "
                  />

                  {/* Robot */}

                  <img
                    src={robot}
                    alt="IntelliGov AI"
                    className="
                      relative
                      w-full
                      h-full
                      object-contain
                      opacity-75
                      drop-shadow-[0_0_35px_rgba(34,211,238,0.22)]
                    "
                  />

                  {/* Bottom fade for blending */}

                  <div
                    className="
                      absolute
                      bottom-0
                      left-1/2
                      -translate-x-1/2
                      w-32
                      h-16
                      bg-gradient-to-t
                      from-[#081224]
                      via-[#081224]/40
                      to-transparent
                      pointer-events-none
                    "
                  />

                </div>


                {/* =================================================
                    GREETING
                ================================================= */}

                <div className="relative text-2xl sm:text-3xl font-black text-white mb-2">
                  👋 Namaste!
                </div>

                <div className="relative text-lg sm:text-xl font-bold text-cyan-300 mb-2">
                  I'm IntelliGov AI.
                </div>

                <p className="relative text-sm text-slate-400 max-w-md mb-7">
                  How can I help you today?
                </p>


                {/* =================================================
                    QUICK QUESTIONS
                ================================================= */}

                <div className="relative w-full max-w-3xl">

                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3">

                    <FaSearch className="text-cyan-400" />

                    Try asking

                  </div>


                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

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
                        bg-[#0b1528]
                        border
                        border-blue-900/40
                        hover:border-cyan-400/60
                        hover:bg-cyan-500/5
                        transition-all
                        group
                      "
                    >

                      <div className="flex items-center gap-3">

                        <FaTractor className="text-cyan-400 text-lg group-hover:scale-110 transition-transform" />

                        <span className="text-xs sm:text-sm text-slate-200">
                          What schemes are available for farmers?
                        </span>

                      </div>

                    </button>


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
                        bg-[#0b1528]
                        border
                        border-blue-900/40
                        hover:border-blue-400/60
                        hover:bg-blue-500/5
                        transition-all
                        group
                      "
                    >

                      <div className="flex items-center gap-3">

                        <FaGraduationCap className="text-blue-400 text-lg group-hover:scale-110 transition-transform" />

                        <span className="text-xs sm:text-sm text-slate-200">
                          Am I eligible for any scholarship?
                        </span>

                      </div>

                    </button>


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
                        bg-[#0b1528]
                        border
                        border-blue-900/40
                        hover:border-emerald-400/60
                        hover:bg-emerald-500/5
                        transition-all
                        group
                      "
                    >

                      <div className="flex items-center gap-3">

                        <FaSearch className="text-emerald-400 text-lg group-hover:scale-110 transition-transform" />

                        <span className="text-xs sm:text-sm text-slate-200">
                          What documents do I need?
                        </span>

                      </div>

                    </button>


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
                        bg-[#0b1528]
                        border
                        border-blue-900/40
                        hover:border-amber-400/60
                        hover:bg-amber-500/5
                        transition-all
                        group
                      "
                    >

                      <div className="flex items-center gap-3">

                        <FaBriefcase className="text-amber-400 text-lg group-hover:scale-110 transition-transform" />

                        <span className="text-xs sm:text-sm text-slate-200">
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

                {/* USER MESSAGE */}

                {msg.type === "user" ? (

                  <div className="flex justify-end">

                    <div className="flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-2xl items-end">

                      <div className="bg-indigo-600/30 border border-indigo-400/30 rounded-2xl rounded-br-md px-4 py-3">

                        <div className="text-sm text-white whitespace-pre-wrap">
                          {msg.text}
                        </div>

                        <div className="text-[10px] text-slate-400 mt-1 text-right">
                          {msg.timestamp}
                        </div>

                      </div>

                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">

                        <FaUser />

                      </div>

                    </div>

                  </div>

                ) : (

                  /* AI MESSAGE */

                  <div className="flex gap-2 sm:gap-4 max-w-[95%] sm:max-w-2xl">

                    {/* AI ICON */}

                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">

                      <FaRobot />

                    </div>


                    <div className="w-full min-w-0">

                      {/* AI RESPONSE */}

                      <div
                        className={`p-4 rounded-2xl text-sm leading-relaxed relative group ${
                          msg.error
                            ? "bg-red-500/10 border border-red-500/30 text-red-300"
                            : "glass-card text-slate-200 border border-blue-900/40"
                        }`}
                      >

                        <div className="whitespace-pre-wrap pr-6">
                          {msg.text}
                        </div>


                        {/* COPY */}

                        {!msg.error && (

                          <button
                            onClick={() =>
                              copyToClipboard(msg.text, idx)
                            }
                            className="
                              absolute
                              top-3
                              right-3
                              text-slate-400
                              hover:text-white
                              transition
                              opacity-0
                              group-hover:opacity-100
                              p-1
                            "
                            title="Copy response"
                          >

                            {copiedIndex === idx ? (
                              <FaCheck className="text-emerald-400" />
                            ) : (
                              <FaCopy />
                            )}

                          </button>

                        )}

                      </div>


                      {/* RECOMMENDED SCHEME */}

                      {msg.scheme && (

                        <div className="mt-3 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/30">

                          <div className="text-xs text-cyan-400 font-semibold uppercase tracking-wider mb-1">
                            Recommended Scheme
                          </div>

                          <div className="text-white font-bold">
                            {msg.scheme.name ||
                              msg.scheme.scheme_name ||
                              msg.scheme.title ||
                              "Recommended Government Scheme"}
                          </div>

                          {msg.scheme.category && (
                            <div className="text-xs text-cyan-300 mt-1">
                              Category: {msg.scheme.category}
                            </div>
                          )}

                          {msg.scheme.description && (
                            <p className="text-xs text-slate-400 mt-2">
                              {msg.scheme.description}
                            </p>
                          )}

                          {msg.scheme.eligibility && (
                            <p className="text-xs text-slate-400 mt-2">
                              <span className="text-slate-300 font-semibold">
                                Eligibility:
                              </span>{" "}
                              {msg.scheme.eligibility}
                            </p>
                          )}

                        </div>

                      )}


                      {/* TIMESTAMP */}

                      <div className="text-[10px] text-slate-500 mt-1 px-1">
                        {msg.timestamp}
                      </div>

                    </div>

                  </div>

                )}

              </div>

            ))}


            {/* =================================================
                THINKING / LOADING
            ================================================= */}

            {loading && (

              <div className="flex gap-3 sm:gap-4">

                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">

                  <FaRobot className="animate-pulse" />

                </div>


                <div className="glass-card px-4 py-3 rounded-2xl text-xs sm:text-sm text-cyan-300 flex items-center gap-3 border border-cyan-400/20">

                  <span className="flex gap-1">

                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />

                    <span
                      className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />

                    <span
                      className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />

                  </span>

                  <span>
                    🤖 IntelliGov AI is thinking...
                  </span>

                </div>

              </div>

            )}

          </div>


          {/* =================================================
              GO TO LATEST MESSAGE
          ================================================= */}

          {showChatBottomButton && (

            <button
              onClick={scrollToChatBottom}
              className="
                absolute
                bottom-24
                left-1/2
                -translate-x-1/2
                z-30
                w-10
                h-10
                rounded-full
                bg-blue-600
                hover:bg-blue-500
                border
                border-cyan-400/50
                shadow-lg
                shadow-blue-600/30
                flex
                items-center
                justify-center
                text-white
                transition-all
                duration-300
                hover:scale-110
              "
              title="Go to latest message"
              aria-label="Go to latest message"
            >
              ↓
            </button>

          )}


          {/* =================================================
              MESSAGE INPUT
          ================================================= */}

          <div className="border-t border-blue-900/40 p-3 sm:p-4">

            <div className="flex gap-2 sm:gap-3">

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask IntelliGov AI about government schemes..."
                rows={1}
                disabled={loading}
                className="
                  flex-1
                  min-w-0
                  resize-none
                  bg-[#0b1528]
                  border
                  border-blue-900/50
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  text-white
                  placeholder:text-slate-500
                  focus:outline-none
                  focus:border-cyan-400/50
                  disabled:opacity-50
                "
              />

              <button
                onClick={handleSend}
                disabled={!message.trim() || loading}
                className="
                  px-4
                  sm:px-5
                  py-3
                  rounded-xl
                  bg-gradient-to-r
                  from-cyan-500
                  to-blue-600
                  text-white
                  text-sm
                  font-semibold
                  flex
                  items-center
                  justify-center
                  gap-2
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                  hover:shadow-lg
                  hover:shadow-cyan-500/20
                  transition
                  shrink-0
                "
              >

                <span className="hidden sm:inline">
                  Send
                </span>

                <FaPaperPlane className="text-xs" />

              </button>

            </div>

            <p className="text-[10px] text-slate-600 mt-2 text-center">
              IntelliGov AI provides guidance based on available scheme data.
            </p>

          </div>

        </div>


        {/* =================================================
            SUGGESTED QUESTIONS
        ================================================= */}

        {messages.length > 0 && (

          <div className="space-y-3 mt-6">

            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
              💡 Suggested Questions
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

              {suggestions.map((item, index) => (

                <button
                  key={index}
                  onClick={() => useSuggestion(item.question)}
                  className="
                    glass-card
                    p-3
                    rounded-2xl
                    text-left
                    border
                    border-blue-900/40
                    hover:border-cyan-400/60
                    transition
                    group
                  "
                >

                  <div
                    className={`${item.color} text-xl mb-1 group-hover:scale-110 transition-transform`}
                  >
                    {item.icon}
                  </div>

                  <div className="text-xs font-bold text-white">
                    {item.title}
                  </div>

                </button>

              ))}

            </div>

          </div>

        )}

      </section>

    </div>
  );
}

export default AIChat;
