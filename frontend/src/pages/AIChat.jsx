import { useEffect, useRef, useState } from "react";

import {
  FaRobot,
  FaUser,
  FaTrashAlt,
  FaCopy,
  FaCheck,
  FaPaperPlane,
  FaShieldAlt,
} from "react-icons/fa";

import { MdOutlineAccountBalance } from "react-icons/md";
import { PiStudentFill } from "react-icons/pi";
import { HiBriefcase } from "react-icons/hi";

import { chatAPI } from "../services/api";
import robot from "../assets/robot.png";

function AIChat() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Shows ↓ button when user is away from latest message
  const [showChatBottomButton, setShowChatBottomButton] = useState(false);

  const chatContainerRef = useRef(null);

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();

    // Add user's message immediately
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

      // Call backend
      const response = await chatAPI(userMessage);

      console.log("FULL CHAT API RESPONSE:", response);

      // =================================================
      // HANDLE DIFFERENT POSSIBLE BACKEND RESPONSE TYPES
      // =================================================

      /*
        Possible backend responses:

        {
          "success": true,
          "reply": "I recommend PM Kisan."
        }

        OR

        {
          "success": true,
          "response": "I recommend PM Kisan."
        }

        OR

        {
          "data": {
            "reply": "I recommend PM Kisan."
          }
        }

        OR

        {
          "result": {
            "answer": "I recommend PM Kisan."
          }
      */

      const chatData =
        response?.data ||
        response?.result ||
        response;

      // Extract actual AI response
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

      // Extract recommended scheme
      const recommendedScheme =
        chatData?.recommended_scheme ||
        chatData?.recommendedScheme ||
        response?.recommended_scheme ||
        response?.recommendedScheme ||
        null;

      console.log("AI Reply:", reply);
      console.log("Recommended Scheme:", recommendedScheme);

      // Add AI response
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

      // Display error inside chat
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

      // Show button only when user has moved away
      // from the latest message
      setShowChatBottomButton(distanceFromBottom > 120);
    };

    container.addEventListener("scroll", handleScroll);

    // Check initial state
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // =====================================================
  // AUTO SCROLL TO LATEST MESSAGE
  // =====================================================

  useEffect(() => {
    const container = chatContainerRef.current;

    if (!container) return;

    // Small timeout makes sure newly-rendered
    // message content is already present
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

  return (
    <div className="min-h-screen bg-[#060c17] text-white">

      {/* =================================================
          MAIN SECTION
      ================================================= */}

      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* =================================================
            CHAT HEADER
        ================================================= */}

        <div className="glass-panel rounded-3xl border border-blue-900/40 p-5 sm:p-6 mb-5">

          <div className="flex items-center justify-between gap-4">

            {/* AI INFORMATION */}

            <div className="flex items-center gap-3">

              <div className="relative shrink-0">

                <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-cyan-400/40 flex items-center justify-center">

                  <img
                    src={robot}
                    alt="AI Assistant"
                    className="w-14 h-14 object-contain animate-float drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]"
                  />

                </div>

                <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#060c17] absolute bottom-0 right-0 animate-pulse" />

              </div>

              <div>

                <div className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 flex-wrap">

                  <span>
                    IntelliGov AI Assistant
                  </span>

                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    Online
                  </span>

                </div>

                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time welfare scheme, scholarship & job recommendation
                  agent
                </p>

              </div>

            </div>

            {/* CLEAR CHAT */}

            {messages.length > 0 && (
              <button
                onClick={clearHistory}
                className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold hover:bg-red-500/20 transition flex items-center gap-2"
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

        <div className="relative glass-panel rounded-3xl border border-blue-900/40 overflow-hidden">

          {/* =================================================
              INTERNAL CHAT AREA
          ================================================= */}

          <div
            ref={chatContainerRef}
            className="h-[430px] overflow-y-auto p-4 sm:p-6 space-y-5 scroll-smooth"
          >

            {/* EMPTY STATE */}

            {messages.length === 0 && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center px-6">

                <img
                  src={robot}
                  alt="IntelliGov AI"
                  className="w-24 h-24 object-contain opacity-80 mb-4"
                />

                <div className="text-xl font-bold text-white mb-2">
                  How can I help you today?
                </div>

                <p className="text-sm text-slate-400 max-w-md">
                  Ask me about government schemes, scholarships, healthcare
                  benefits, jobs, or eligibility.
                </p>

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

                    <div className="flex gap-3 max-w-2xl items-end">

                      <div className="bg-indigo-600/30 border border-indigo-400/30 rounded-2xl rounded-br-md px-4 py-3">

                        <div className="text-sm text-white whitespace-pre-wrap">
                          {msg.text}
                        </div>

                        <div className="text-[10px] text-slate-400 mt-1">
                          {msg.timestamp}
                        </div>

                      </div>

                      <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
                        <FaUser />
                      </div>

                    </div>

                  </div>

                ) : (

                  /* =================================================
                     AI MESSAGE
                  ================================================= */

                  <div className="flex gap-3 sm:gap-4 max-w-2xl">

                    {/* AI ICON */}

                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
                      <FaRobot />
                    </div>


                    <div className="w-full">

                      {/* AI RESPONSE CARD */}

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


                        {/* COPY BUTTON */}

                        {!msg.error && (
                          <button
                            onClick={() =>
                              copyToClipboard(msg.text, idx)
                            }
                            className="absolute top-3 right-3 text-slate-400 hover:text-white transition opacity-0 group-hover:opacity-100 p-1"
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


                      {/* =================================================
                          RECOMMENDED SCHEME CARD
                      ================================================= */}

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

              <div className="flex gap-4">

                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">

                  <FaRobot className="animate-spin" />

                </div>

                <div className="glass-card p-4 rounded-2xl text-xs text-cyan-300 flex items-center gap-3">

                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />

                  <span>
                    IntelliGov AI is searching government schemes...
                  </span>

                </div>

              </div>

            )}

          </div>


          {/* =================================================
              GO TO LATEST MESSAGE BUTTON
              CENTERED INSIDE CHAT
          ================================================= */}

          {showChatBottomButton && (

            <button
              onClick={scrollToChatBottom}
              className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 border border-cyan-400/50 shadow-lg shadow-blue-600/30 flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
              title="Go to latest message"
              aria-label="Go to latest message"
            >
              ↓
            </button>

          )}


          {/* =================================================
              MESSAGE INPUT
          ================================================= */}

          <div className="border-t border-blue-900/40 p-4">

            <div className="flex gap-3">

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask IntelliGov AI about government schemes..."
                rows={1}
                disabled={loading}
                className="flex-1 resize-none bg-[#0b1528] border border-blue-900/50 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50 disabled:opacity-50"
              />

              <button
                onClick={handleSend}
                disabled={!message.trim() || loading}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/20 transition"
              >

                <span className="hidden sm:inline">
                  Send
                </span>

                <FaPaperPlane className="text-xs" />

              </button>

            </div>

          </div>

        </div>


        {/* =================================================
            SUGGESTED QUESTIONS
        ================================================= */}

        <div className="space-y-3 mt-6">

          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
            💡 Suggested Questions:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

            {/* FARMER */}

            <button
              onClick={() =>
                useSuggestion(
                  "What agricultural schemes are available for farmers?"
                )
              }
              className="glass-card p-3 rounded-2xl text-left border border-blue-900/40 hover:border-cyan-400/60 transition group"
            >

              <MdOutlineAccountBalance className="text-cyan-400 text-xl mb-1 group-hover:scale-110 transition-transform" />

              <div className="text-xs font-bold text-white">
                Farmer Schemes
              </div>

            </button>


            {/* SCHOLARSHIPS */}

            <button
              onClick={() =>
                useSuggestion(
                  "Tell me about scholarships for college students."
                )
              }
              className="glass-card p-3 rounded-2xl text-left border border-blue-900/40 hover:border-cyan-400/60 transition group"
            >

              <PiStudentFill className="text-blue-400 text-xl mb-1 group-hover:scale-110 transition-transform" />

              <div className="text-xs font-bold text-white">
                Scholarships
              </div>

            </button>


            {/* HEALTH */}

            <button
              onClick={() =>
                useSuggestion(
                  "How to check eligibility for health schemes?"
                )
              }
              className="glass-card p-3 rounded-2xl text-left border border-blue-900/40 hover:border-cyan-400/60 transition group"
            >

              <FaShieldAlt className="text-emerald-400 text-xl mb-1 group-hover:scale-110 transition-transform" />

              <div className="text-xs font-bold text-white">
                Health Coverage
              </div>

            </button>


            {/* JOBS */}

            <button
              onClick={() =>
                useSuggestion(
                  "Show government job vacancies and internships."
                )
              }
              className="glass-card p-3 rounded-2xl text-left border border-blue-900/40 hover:border-cyan-400/60 transition group"
            >

              <HiBriefcase className="text-amber-400 text-xl mb-1 group-hover:scale-110 transition-transform" />

              <div className="text-xs font-bold text-white">
                Jobs & Internships
              </div>

            </button>

          </div>

        </div>

      </section>

    </div>
  );
}

export default AIChat;