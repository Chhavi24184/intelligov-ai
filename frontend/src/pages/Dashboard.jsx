import Sidebar from "../components/dashboard/Sidebar";
import WelcomeSection from "../components/dashboard/WelcomeSection";
import StatsCards from "../components/dashboard/StatsCards";
import AIAssistantCard from "../components/dashboard/AIAssistantCard";

// Existing AIChat component
import AIChat from "./AIChat";

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  FaListAlt,
  FaUserCheck,
  FaArrowRight,
  FaArrowLeft,
  FaRobot,
  FaBookmark,
  FaExternalLinkAlt,
  FaTimes,
  FaCalendarAlt,
} from "react-icons/fa";

import {
  getSavedSchemesAPI,
  removeSavedSchemeAPI,
} from "../services/api";


function Dashboard() {
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

  // =========================================================
  // SAVED SCHEMES
  // =========================================================

  const [savedSchemes, setSavedSchemes] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);

  // =========================================================
  // AI CHAT PANEL
  // =========================================================

  const [chatPanelMounted, setChatPanelMounted] = useState(false);
  const [chatPanelOpen, setChatPanelOpen] = useState(false);

  // Open slide-in chat panel
  const openChatPanel = () => {
    setChatPanelMounted(true);

    // Allow the panel to mount before starting the transition.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setChatPanelOpen(true);
      });
    });
  };

  // Close slide-in chat panel
  const closeChatPanel = () => {
    setChatPanelOpen(false);
  };

  // Unmount after the closing animation completes.
  const handlePanelTransitionEnd = (event) => {
    if (
      event.target === event.currentTarget &&
      event.propertyName === "transform" &&
      !chatPanelOpen
    ) {
      setChatPanelMounted(false);
    }
  };

  // Close the panel using Escape.
  useEffect(() => {
    if (!chatPanelMounted) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeChatPanel();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [chatPanelMounted]);

  // Lock scrolling only while the drawer is actually open. Restoring on close
  // prevents a stale mounted drawer from leaving the dashboard in a blocked state.
  useEffect(() => {
    if (!chatPanelOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [chatPanelOpen]);

  // =========================================================
  // LOAD SAVED SCHEMES FROM DATABASE
  // =========================================================

  useEffect(() => {
    if (!userId) return;

    setSavedLoading(true);

    getSavedSchemesAPI(userId)
      .then((data) => {
        setSavedSchemes(data?.schemes || []);
      })
      .catch((error) => {
        console.error("Failed to load saved schemes:", error);
      })
      .finally(() => {
        setSavedLoading(false);
      });
  }, [userId]);

  // =========================================================
  // REMOVE SAVED SCHEME
  // =========================================================

  const handleRemoveSaved = async (savedId) => {
    try {
      await removeSavedSchemeAPI(savedId);

      setSavedSchemes((previous) =>
        previous.filter((scheme) => scheme.saved_id !== savedId)
      );
    } catch (error) {
      console.error("Could not remove saved scheme:", error);

      alert("Could not remove scheme. Please try again.");
    }
  };

  // =========================================================
  // QUICK ACTIONS
  // =========================================================

  const quickActions = [
    {
      title: "Explore Schemes",
      desc: "View government welfare initiatives and scholarships.",
      link: "/schemes",
      icon: <FaListAlt className="text-cyan-500 text-xl" />,
    },
    {
      title: "Check Eligibility",
      desc: "Check your eligibility for available government schemes.",
      link: "/schemes",
      icon: <FaUserCheck className="text-emerald-500 text-xl" />,
    },
  ];

  // =========================================================
  // DASHBOARD UI
  // =========================================================

  return (
    <div className="min-h-screen bg-[#f5f9ff] text-slate-800">
      {/* SIDEBAR */}

      <Sidebar />

      {/* MAIN DASHBOARD */}

      <main className="ml-0 md:ml-50 min-h-screen pt-16 md:pt-0">
        <div className="min-h-screen overflow-y-auto">
          <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f8fbff] via-[#eef7ff] to-[#f5f9ff]">
            {/* BACKGROUND GLOWS */}

            <div className="absolute top-0 left-1/4 w-[450px] h-[450px] bg-blue-400/15 blur-[150px] rounded-full pointer-events-none" />

            <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-cyan-400/15 blur-[140px] rounded-full pointer-events-none" />

            <div className="absolute bottom-0 left-1/3 w-[350px] h-[350px] bg-indigo-400/10 blur-[130px] rounded-full pointer-events-none" />

            <div className="relative p-4 sm:p-6 lg:p-8">
              {/* TOP BAR */}

              <div className="flex items-center mb-6">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-blue-100 text-slate-600 text-sm font-medium shadow-sm hover:text-blue-600 hover:border-blue-300 hover:bg-white transition-all duration-300"
                >
                  <FaArrowLeft className="text-xs" />
                  <span>Back</span>
                </button>
              </div>

              <div className="space-y-8">
                {/* WELCOME */}

                <WelcomeSection />

                {/* STATISTICS */}

                <StatsCards />

                {/* AI ASSISTANT
                    Only this card opens the slide-in panel. */}

                <AIAssistantCard onStartChat={openChatPanel} />

                {/* QUICK ACTIONS */}

                <section className="space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800">
                      Quick Portal Actions
                    </h3>

                    <p className="text-xs text-slate-500 mt-1">
                      Quickly access important citizen services.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {quickActions.map((action, index) => (
                      <Link
                        key={index}
                        to={action.link}
                        className="relative overflow-hidden bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-blue-100 shadow-[0_10px_35px_rgba(37,99,235,0.07)] flex items-center justify-between group hover:border-cyan-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(6,182,212,0.12)] transition-all duration-300"
                      >
                        <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-cyan-400/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <div className="relative z-10 flex items-center gap-4 min-w-0">
                          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-blue-100 group-hover:border-cyan-300 group-hover:scale-105 transition-all duration-300 shrink-0">
                            {action.icon}
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                              {action.title}
                            </h4>

                            <p className="text-xs text-slate-500 mt-1">
                              {action.desc}
                            </p>
                          </div>
                        </div>

                        <FaArrowRight className="relative z-10 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all shrink-0 ml-3" />
                      </Link>
                    ))}
                  </div>
                </section>

                {/* =====================================================
                    SAVED OPPORTUNITIES
                ===================================================== */}

                <section
                  id="saved-opportunities"
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
                        <FaBookmark className="text-amber-500" />
                        Saved Opportunities
                      </h3>

                      <p className="text-xs text-slate-500 mt-1">
                        Your bookmarked government schemes — saved to
                        your account.
                      </p>
                    </div>

                    <Link
                      to="/schemes"
                      className="text-xs text-sky-600 font-semibold hover:underline"
                    >
                      Browse more →
                    </Link>
                  </div>

                  {/* LOADING */}

                  {savedLoading ? (
                    <p className="text-sm text-slate-400 py-4">
                      Loading saved schemes...
                    </p>
                  ) : savedSchemes.length === 0 ? (
                    /* EMPTY STATE */

                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-dashed border-blue-200 p-8 text-center">
                      <FaBookmark className="text-slate-300 text-3xl mx-auto mb-3" />

                      <p className="text-sm text-slate-500">
                        No saved schemes yet.
                      </p>

                      <Link
                        to="/schemes"
                        className="mt-3 inline-block text-xs text-sky-600 font-semibold hover:underline"
                      >
                        Explore Schemes
                      </Link>
                    </div>
                  ) : (
                    /* SAVED SCHEME CARDS */

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedSchemes.map((scheme) => (
                        <div
                          key={scheme.saved_id}
                          className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-blue-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 group"
                        >
                          {/* REMOVE BUTTON */}

                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveSaved(scheme.saved_id)
                            }
                            className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all"
                            title="Remove from saved"
                          >
                            <FaTimes className="text-xs" />
                          </button>

                          {/* CATEGORY */}

                          {scheme.category && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 border border-sky-200 text-sky-700 mb-2">
                              {scheme.category}
                            </span>
                          )}

                          {/* NAME */}

                          <h4 className="text-sm font-bold text-slate-800 pr-6 leading-snug mb-1">
                            {scheme.name}
                          </h4>

                          {/* BENEFITS */}

                          {scheme.benefits && (
                            <p className="text-xs text-emerald-700 mb-2 line-clamp-2">
                              {scheme.benefits}
                            </p>
                          )}

                          {/* DEADLINE */}

                          {scheme.deadline && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                              <FaCalendarAlt className="text-sky-400 shrink-0" />
                              <span>{scheme.deadline}</span>
                            </div>
                          )}

                          {/* ACTION BUTTONS */}

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const encoded = encodeURIComponent(
                                  JSON.stringify({
                                    name: scheme.name,
                                    category: scheme.category,
                                    description: scheme.description,
                                    benefits: scheme.benefits,
                                    eligibility: scheme.eligibility,
                                    documents: scheme.documents,
                                    deadline: scheme.deadline,
                                    official_url: scheme.official_url,
                                  })
                                );

                                navigate(`/apply?scheme=${encoded}`);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-xs font-semibold hover:scale-[1.02] transition-all shadow-sm"
                            >
                              Apply with AI Agent ✦
                            </button>

                            {scheme.official_url && (
                              <a
                                href={scheme.official_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:border-sky-300 hover:text-sky-600 transition-all"
                              >
                                <FaExternalLinkAlt className="text-[9px]" />
                                Official Portal
                              </a>
                            )}
                          </div>

                          {/* SAVED DATE */}

                          {scheme.saved_at && (
                            <p className="text-[10px] text-slate-400 mt-2">
                              Saved{" "}
                              {new Date(
                                scheme.saved_at
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* =====================================================
                    BOTTOM ASK AI SECTION
                    IMPORTANT: This still navigates to /chat.
                ===================================================== */}

                <section className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl border border-cyan-200 p-5 sm:p-8 shadow-[0_10px_40px_rgba(6,182,212,0.08)]">
                  <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 flex items-center justify-center shrink-0 shadow-sm">
                        <FaRobot className="text-cyan-500 text-xl" />
                      </div>

                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-800">
                          Need Help Finding a Scheme?
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                          Ask IntelliGov AI about schemes, eligibility,
                          scholarships and government benefits.
                        </p>
                      </div>
                    </div>

                    {/* This button is intentionally unchanged in behaviour. */}

                    <Link
                      to="/chat"
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 hover:scale-105 hover:shadow-cyan-500/30 transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto"
                    >
                      <FaRobot />
                      Ask AI
                      <FaArrowRight className="text-xs" />
                    </Link>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* =========================================================
          SLIDE-IN AI CHAT PANEL

          This panel opens ONLY when Start AI Chat is clicked.
          The existing AIChat component is reused.
      ========================================================= */}

      {chatPanelMounted && (
        <div
          className={`fixed inset-0 z-[100] isolate ${chatPanelOpen ? "pointer-events-auto" : "pointer-events-none"}`}
          aria-hidden={!chatPanelOpen}
        >
          {/* BACKDROP */}

          <button
            type="button"
            aria-label="Close AI chat"
            onClick={closeChatPanel}
            className={`
              absolute inset-0 w-full h-full
              bg-slate-950/25
              backdrop-blur-[2px]
              transition-opacity duration-300
              ${chatPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
            `}
          />

          {/* RIGHT SLIDE-IN PANEL */}

          <aside
            id="intelligov-chat-panel"
            onTransitionEnd={handlePanelTransitionEnd}
            className={`
              absolute right-0 top-0
              h-[100dvh]
              w-full sm:w-[520px] lg:w-[600px]
              max-w-full
              bg-slate-50
              shadow-[-20px_0_60px_rgba(15,23,42,0.18)]
              border-l border-slate-200
              flex flex-col
              overflow-hidden
              transform
              transition-transform duration-300 ease-in-out
              ${chatPanelOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none"}
            `}
          >
            {/* PANEL HEADER */}

            <div className="relative z-20 shrink-0 flex items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-white border-b border-slate-200">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 border border-cyan-200 flex items-center justify-center shrink-0">
                  <FaRobot className="text-cyan-600 text-lg" />
                </div>

                <div className="min-w-0">
                  <h2 className="font-bold text-slate-800 text-sm sm:text-base">
                    IntelliGov AI
                  </h2>

                  <p className="text-xs text-slate-500">
                    Your AI Government Guide
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeChatPanel}
                aria-label="Close chat panel"
                title="Close"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
              >
                <FaTimes />
              </button>
            </div>

            {/* EXISTING CHAT COMPONENT */}

            <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50">
              <AIChat />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default Dashboard;