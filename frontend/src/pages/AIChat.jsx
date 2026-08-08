import { useState, useRef, useEffect } from "react";
import { chatAPI } from "../services/api";
import robot from "../assets/robot.png";

import {
  FaPaperPlane,
  FaPaperclip,
  FaShieldAlt,
} from "react-icons/fa";

import { PiStudentFill } from "react-icons/pi";
import { MdOutlineAccountBalance } from "react-icons/md";
import { HiBriefcase } from "react-icons/hi";

function AIChat() {

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const chatContainerRef = useRef(null);

  const [showTopButton, setShowTopButton] = useState(false);
  const [showChatBottomButton, setShowChatBottomButton] = useState(false);


  // =========================
  // SEND MESSAGE
  // =========================

  const handleSend = async () => {

    if (!message.trim() || loading) {
      return;
    }

    const userMessage = message;

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: userMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {

      const data = await chatAPI(userMessage);

      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          text: data.reply,
          scheme: data.recommended_scheme,
        },
      ]);

    } catch (error) {

      console.error("Chat API Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          text: "Sorry, I couldn't connect to the server. Please try again.",
        },
      ]);

    } finally {

      setLoading(false);

    }
  };


  // =========================
  // ENTER KEY
  // =========================

  const handleKeyDown = (e) => {

    if (e.key === "Enter") {
      handleSend();
    }

  };


  // =========================
  // PAGE SCROLL DETECTION
  // =========================

  useEffect(() => {

    const handlePageScroll = () => {
      setShowTopButton(window.scrollY > 250);
    };

    window.addEventListener("scroll", handlePageScroll);

    return () => {
      window.removeEventListener("scroll", handlePageScroll);
    };

  }, []);


  // =========================
  // CHAT SCROLL DETECTION
  // =========================

  useEffect(() => {

  const chatBox = chatContainerRef.current;

  if (!chatBox) return;

  const handleChatScroll = () => {

    const distanceFromBottom =
      chatBox.scrollHeight -
      chatBox.scrollTop -
      chatBox.clientHeight;

    setShowChatBottomButton(distanceFromBottom > 20);

  };

  chatBox.addEventListener("scroll", handleChatScroll);

  // Check initial position
  handleChatScroll();

  return () => {
    chatBox.removeEventListener("scroll", handleChatScroll);
  };

}, [messages]);


  // =========================
  // AUTO SCROLL TO NEW MESSAGE
  // =========================

  useEffect(() => {

  if (chatContainerRef.current) {

    const chatBox = chatContainerRef.current;

    chatBox.scrollTo({
      top: chatBox.scrollHeight,
      behavior: "smooth",
    });

    setShowChatBottomButton(false);

  }

}, [messages]);


  // =========================
  // GO TO TOP
  // =========================

  const scrollToTop = () => {

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };


  // =========================
  // GO TO LATEST CHAT
  // =========================

  const scrollToChatBottom = () => {

    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });

  };


  return (

    <section className="relative min-h-screen bg-[#0a1628] overflow-hidden">


      {/* =========================
          BACKGROUND GLOW
      ========================= */}

      <div className="absolute top-20 left-20 w-[350px] h-[350px] bg-blue-600/20 blur-[140px] rounded-full"></div>

      <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-purple-600/20 blur-[150px] rounded-full"></div>


      {/* =========================
          STARS
      ========================= */}

      <div className="absolute inset-0">

        <div className="absolute top-24 left-28 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>

        <div className="absolute top-52 right-40 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>

        <div className="absolute bottom-36 left-64 w-2 h-2 bg-sky-300 rounded-full animate-pulse"></div>

        <div className="absolute bottom-24 right-32 w-2 h-2 bg-pink-400 rounded-full animate-ping"></div>

      </div>


      {/* =========================
          MAIN CONTENT
      ========================= */}

      <div className="relative max-w-6xl mx-auto px-6 py-8">


        {/* =========================
            HEADING
        ========================= */}

        <div className="text-center">

          <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-300 via-white to-yellow-400 bg-clip-text text-transparent">

            AI Chat Assistant

          </div>

          <p className="text-gray-300 mt-3 text-base">

            Ask anything about Government Schemes,
            Scholarships, Jobs & Internships.

          </p>

        </div>


        {/* =========================
            ROBOT
        ========================= */}

        <img
          src={robot}
          alt="AI Robot"
          className="hidden lg:block absolute right-0 top-0 w-36 float drop-shadow-[0_0_35px_rgba(59,130,246,0.8)]"
        />


        {/* =========================
            CHAT BOX
        ========================= */}

        <div className="mt-8 bg-[#101d34]/90 border border-blue-900/40 rounded-3xl backdrop-blur-lg p-5">


          {/* CHAT AREA */}

          <div className="relative">


            {/* SCROLLABLE CHAT */}

            <div
              ref={chatContainerRef}
              className="h-[300px] overflow-y-auto space-y-5 pr-3 scroll-smooth"
            >


              {/* INITIAL AI MESSAGE */}

              <div className="flex gap-4">

                <img
                  src={robot}
                  alt="Robot"
                  className="w-10 h-10 object-contain"
                />

                <div className="bg-[#18294a] rounded-2xl px-5 py-3 max-w-xl text-gray-200">

                  👋 Hello!

                  <br />

                  I'm IntelliGov AI, your Government Services Assistant.

                  <br />

                  How can I help you today?

                </div>

              </div>


              {/* USER + AI MESSAGES */}

              {messages.map((msg, index) => (

                <div key={index}>


                  {/* USER MESSAGE */}

                  {msg.type === "user" && (

                    <div className="flex justify-end">

                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl px-5 py-3 max-w-md">

                        {msg.text}

                      </div>

                    </div>

                  )}


                  {/* AI MESSAGE */}

                  {msg.type === "ai" && (

                    <div className="flex gap-4 mt-4">

                      <img
                        src={robot}
                        alt="Robot"
                        className="w-10 h-10 object-contain"
                      />

                      <div>

                        <div className="bg-[#18294a] rounded-2xl px-5 py-3 max-w-xl text-gray-200 leading-7">

                          {msg.text}

                        </div>


                        {/* RECOMMENDED SCHEME */}

                        {msg.scheme &&
                          Object.keys(msg.scheme).length > 0 && (

                          <div className="mt-3 bg-[#101d34] border border-cyan-500/40 rounded-xl p-4 max-w-xl">

                            <div className="text-cyan-300 font-semibold">

                              Recommended Scheme

                            </div>

                            <div className="text-white text-lg font-bold mt-1">

                              {msg.scheme.name ||
                                msg.scheme.title ||
                                "Recommended Government Scheme"}

                            </div>

                            {msg.scheme.description && (

                              <p className="text-gray-400 text-sm mt-1">

                                {msg.scheme.description}

                              </p>

                            )}

                          </div>

                        )}

                      </div>

                    </div>

                  )}

                </div>

              ))}


              {/* LOADING */}

              {loading && (

                <div className="flex gap-4">

                  <img
                    src={robot}
                    alt="Robot"
                    className="w-10 h-10 object-contain"
                  />

                  <div className="bg-[#18294a] rounded-2xl px-5 py-3 text-gray-400">

                    AI is thinking...

                  </div>

                </div>

              )}

            </div>


            {/* =========================
                CENTERED CHAT SCROLL BUTTON
            ========================= */}

            {showChatBottomButton && (

              <button
                onClick={scrollToChatBottom}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#18294a] border border-cyan-400/60 text-cyan-300 flex items-center justify-center shadow-[0_0_18px_rgba(34,211,238,0.45)] hover:bg-blue-600 hover:text-white hover:scale-110 transition-all duration-300 z-20"
                title="Go to latest message"
              >

                ↓

              </button>

            )}

          </div>


          {/* =========================
              INPUT
          ========================= */}

          <div className="mt-5 flex items-center bg-[#0b1730] border border-blue-800 rounded-2xl px-4 py-2">

            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question here..."
              className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
            />

            <FaPaperclip
              className="text-gray-400 hover:text-cyan-300 cursor-pointer mr-4"
            />

            <button
              onClick={handleSend}
              disabled={loading}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center hover:scale-110 transition disabled:opacity-50"
            >

              <FaPaperPlane className="text-white text-sm" />

            </button>

          </div>

        </div>


        {/* =========================
            SUGGESTED QUESTIONS
        ========================= */}

        <div className="mt-5">

          <div className="text-gray-300 font-semibold text-sm mb-3">

            ✨ Suggested Questions

          </div>


          <div className="grid md:grid-cols-4 gap-3">


            {/* GOVERNMENT SCHEMES */}

            <div
              onClick={() =>
                setMessage("Tell me about government schemes")
              }
              className="bg-[#101d34] border border-blue-900/40 rounded-xl p-2.5 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition cursor-pointer"
            >

              <MdOutlineAccountBalance className="text-2xl text-sky-400 mb-1" />

              <div className="text-white text-sm">

                Government Schemes

              </div>

            </div>


            {/* SCHOLARSHIPS */}

            <div
              onClick={() =>
                setMessage("What scholarships are available?")
              }
              className="bg-[#101d34] border border-blue-900/40 rounded-xl p-2.5 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition cursor-pointer"
            >

              <PiStudentFill className="text-2xl text-blue-400 mb-1" />

              <div className="text-white text-sm">

                Scholarships

              </div>

            </div>


            {/* ELIGIBILITY */}

            <div
              onClick={() =>
                setMessage("Check my eligibility for government schemes")
              }
              className="bg-[#101d34] border border-blue-900/40 rounded-xl p-2.5 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition cursor-pointer"
            >

              <FaShieldAlt className="text-2xl text-green-400 mb-1" />

              <div className="text-white text-sm">

                Check Eligibility

              </div>

            </div>


            {/* JOBS */}

            <div
              onClick={() =>
                setMessage("Show me jobs and internships")
              }
              className="bg-[#101d34] border border-blue-900/40 rounded-xl p-2.5 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition cursor-pointer"
            >

              <HiBriefcase className="text-2xl text-yellow-400 mb-1" />

              <div className="text-white text-sm">

                Jobs & Internships

              </div>

            </div>


          </div>

        </div>

      </div>


      {/* =========================
          GO TO TOP BUTTON
      ========================= */}

      {showTopButton && (

        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-7 w-10 h-10 rounded-full bg-[#101d34] border border-cyan-400/50 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:bg-blue-600 hover:text-white hover:scale-110 transition-all duration-300 z-50"
          title="Go to top"
        >

          ↑

        </button>

      )}

    </section>

  );
}

export default AIChat;