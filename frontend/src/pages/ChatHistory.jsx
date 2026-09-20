import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  FaRobot,
  FaUser,
  FaArrowLeft,
} from "react-icons/fa";

import { getChatHistoryAPI } from "../services/api";

function ChatHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        setError("User information not found.");
        setLoading(false);
        return;
      }

      try {
        console.log("Loading chat history for user:", userId);

        const data = await getChatHistoryAPI(userId);

        console.log("CHAT HISTORY RESPONSE:", data);

        setHistory(data?.history || []);
      } catch (err) {
        console.error("Chat history loading error:", err);

        setError(
          "Unable to load chat history. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-center justify-between gap-4 mb-6">

          <div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
              Chat History
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              View your previous conversations with IntelliGov AI.
            </p>

          </div>


          <Link
            to="/chat"
            className="
              flex
              items-center
              gap-2
              px-4
              py-2.5
              rounded-xl
              bg-gradient-to-r
              from-cyan-500
              to-blue-600
              text-white
              text-sm
              font-semibold
              shadow-sm
              hover:shadow-md
              transition
            "
          >

            <FaArrowLeft />

            <span className="hidden sm:inline">
              Back to Chat
            </span>

          </Link>

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (

          <div
            className="
              bg-white
              rounded-2xl
              border
              border-slate-200
              p-10
              text-center
              shadow-sm
            "
          >

            <FaRobot
              className="
                mx-auto
                text-3xl
                text-cyan-500
                animate-pulse
                mb-3
              "
            />

            <p className="text-sm text-slate-500">
              Loading your chat history...
            </p>

          </div>

        )}


        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (

          <div
            className="
              bg-red-50
              border
              border-red-200
              text-red-600
              rounded-2xl
              p-5
              text-center
              text-sm
            "
          >
            {error}
          </div>

        )}


        {/* =================================================
            EMPTY HISTORY
        ================================================= */}

        {!loading &&
          !error &&
          history.length === 0 && (

            <div
              className="
                bg-white
                rounded-2xl
                border
                border-slate-200
                p-10
                text-center
                shadow-sm
              "
            >

              <div
                className="
                  w-16
                  h-16
                  mx-auto
                  rounded-2xl
                  bg-cyan-50
                  border
                  border-cyan-200
                  flex
                  items-center
                  justify-center
                  mb-4
                "
              >

                <FaRobot className="text-2xl text-cyan-500" />

              </div>


              <h2 className="text-lg font-bold text-slate-800">
                No conversations yet
              </h2>


              <p className="text-sm text-slate-500 mt-1 mb-5">
                Start chatting with IntelliGov AI to build your history.
              </p>


              <Link
                to="/chat"
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-5
                  py-2.5
                  rounded-xl
                  bg-gradient-to-r
                  from-cyan-500
                  to-blue-600
                  text-white
                  text-sm
                  font-semibold
                "
              >

                <FaRobot />

                Ask AI

              </Link>

            </div>

          )}


        {/* =================================================
            CHAT HISTORY LIST
        ================================================= */}

        {!loading &&
          !error &&
          history.length > 0 && (

            <div className="space-y-5">

              {history.map((item) => (

                <div
                  key={item.id}
                  className="
                    bg-white
                    rounded-2xl
                    border
                    border-slate-200
                    shadow-sm
                    overflow-hidden
                  "
                >

                  {/* USER QUESTION */}

                  <div className="p-4 sm:p-5 border-b border-slate-100">

                    <div className="flex gap-3">

                      <div
                        className="
                          w-9
                          h-9
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


                      <div className="min-w-0">

                        <div className="text-xs font-semibold text-blue-600 mb-1">
                          You
                        </div>

                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                          {item.message}
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* AI RESPONSE */}

                  <div className="p-4 sm:p-5 bg-slate-50/70">

                    <div className="flex gap-3">

                      <div
                        className="
                          w-9
                          h-9
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


                      <div className="min-w-0">

                        <div className="text-xs font-semibold text-cyan-600 mb-1">
                          IntelliGov AI
                        </div>

                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {item.response}
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* TIMESTAMP */}

                  {item.created_at && (

                    <div
                      className="
                        px-5
                        py-2
                        text-[10px]
                        text-slate-400
                        border-t
                        border-slate-100
                      "
                    >

                      {new Date(item.created_at).toLocaleString()}

                    </div>

                  )}

                </div>

              ))}

            </div>

          )}

      </section>

    </div>
  );
}

export default ChatHistory;