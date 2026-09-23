/**
 * ApplyFlow.jsx
 * -------------
 * Application Agent flow page for IntelliGov AI.
 *
 * URL:  /apply?scheme=<encoded-json>
 *
 * 5-step demo pipeline:
 *   1. Loading    — "Application Agent is preparing your form…"
 *   2. Form Fill  — all fields rendered; auto-filled highlighted; sensitive blank
 *   3. Doc Check  — document gap analysis; if all clear auto-advance to review
 *   4. Review     — read-only summary; DEMO banner; Confirm & Submit Demo
 *   5. Done       — DEMO- reference ID with clear ⚠ label; Open Portal; Dashboard
 *
 * Design rules:
 *   - NEVER fake submission, NEVER create fake government status
 *   - NEVER invent personal data — only data from the user's own profile
 *   - Sensitive fields (Aadhaar, mobile, bank) NEVER pre-filled
 *   - DEMO- reference IDs are clearly labelled as non-government references
 *   - Apply Now opens real official portals — no form POSTing to any portal
 */

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExternalLinkAlt,
  FaUserEdit,
  FaFileAlt,
  FaInfoCircle,
  FaArrowLeft,
  FaShieldAlt,
  FaCalendarAlt,
  FaLock,
  FaEdit,
  FaClipboardCheck,
  FaPortrait,
} from "react-icons/fa";

import { prepareApplicationAPI, submitDemoApplicationAPI } from "../services/api";


// ==========================================================
// HELPERS
// ==========================================================

function Dot({ delay }) {
  return (
    <span
      className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-bounce inline-block"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}

function StepPill({ n, label, active, done }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border transition
          ${done  ? "bg-emerald-500 border-emerald-500 text-white"
          : active ? "bg-cyan-500 border-cyan-500 text-white"
          : "bg-white border-slate-200 text-slate-400"}`}
      >
        {done ? "✓" : n}
      </span>
      <span className={`text-xs font-medium hidden sm:inline ${active ? "text-slate-800" : "text-slate-400"}`}>
        {label}
      </span>
    </div>
  );
}

function StepBar({ step }) {
  const steps = ["Form", "Documents", "Review", "Done"];
  const idx   = ["form", "docs", "review", "done"].indexOf(step);
  return (
    <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-4 py-3">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <StepPill n={i + 1} label={label} active={idx === i} done={idx > i} />
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 w-5 rounded ${idx > i ? "bg-emerald-400" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function SectionCard({ icon, title, children, accent = "slate" }) {
  const borders = {
    slate:   "border-slate-200",
    cyan:    "border-cyan-200",
    amber:   "border-amber-200",
    emerald: "border-emerald-200",
    red:     "border-red-200",
    violet:  "border-violet-200",
  };
  return (
    <div className={`bg-white rounded-xl border ${borders[accent] || borders.slate} p-4 space-y-3`}>
      <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
        <span className="text-base">{icon}</span>
        {title}
      </div>
      {children}
    </div>
  );
}


// ==========================================================
// URL HELPER
// ==========================================================

function normalizeUrl(raw) {
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return "https://" + raw;
}

// ==========================================================
// MAIN COMPONENT
// ==========================================================

export default function ApplyFlow() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();

  const userId = localStorage.getItem("userId");

  // Steps: "loading" | "form" | "docs" | "review" | "done" | "error"
  const [step,        setStep]        = useState("loading");
  const [plan,        setPlan]        = useState(null);
  const [scheme,      setScheme]      = useState(null);
  const [errorMsg,    setErrorMsg]    = useState("");

  // Form state — keyed by field.key
  const [formValues,  setFormValues]  = useState({});
  const [formErrors,  setFormErrors]  = useState({});

  // Submit demo state
  const [submitting,  setSubmitting]  = useState(false);
  const [demoResult,  setDemoResult]  = useState(null);


  // --------------------------------------------------------
  // Parse scheme from URL on mount
  // --------------------------------------------------------
  useEffect(() => {
    if (!userId) { navigate("/login"); return; }

    const raw = searchParams.get("scheme");
    if (!raw) { setErrorMsg("No scheme data was passed to this page."); setStep("error"); return; }

    let parsed;
    try { parsed = JSON.parse(decodeURIComponent(raw)); }
    catch { setErrorMsg("Could not parse scheme data."); setStep("error"); return; }

    setScheme(parsed);
    loadPlan(parsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // --------------------------------------------------------
  // Call the Application Agent /prepare API
  // --------------------------------------------------------
  async function loadPlan(schemeData) {
    try {
      const res = await prepareApplicationAPI(userId, schemeData);
      if (res?.success && res?.plan) {
        const plan = res.plan;
        setPlan(plan);

        // Seed form values from demo_form fields
        const initial = {};
        (plan.demo_form?.fields || []).forEach((f) => {
          initial[f.key] = f.value || "";
        });
        setFormValues(initial);

        setStep("form");
      } else {
        setErrorMsg("Could not prepare application plan.");
        setStep("error");
      }
    } catch (err) {
      console.error("ApplyFlow: prepareApplicationAPI failed:", err);
      setErrorMsg(
        err?.response?.data?.detail ||
        "Failed to connect to the server. Please try again."
      );
      setStep("error");
    }
  }


  // --------------------------------------------------------
  // Form field change
  // --------------------------------------------------------
  function handleFieldChange(key, value) {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
    }
  }


  // --------------------------------------------------------
  // Validate form → move to docs step
  // --------------------------------------------------------
  function handleFormNext() {
    const errors = {};
    (plan.demo_form?.fields || []).forEach((f) => {
      if (f.required && !(formValues[f.key] || "").trim()) {
        errors[f.key] = `${f.label} is required.`;
      }
    });

    // Aadhaar format
    const aadhaar = (formValues["aadhaar_number"] || "").replace(/\D/g, "");
    if (aadhaar && aadhaar.length !== 12) {
      errors["aadhaar_number"] = "Aadhaar Number must be exactly 12 digits.";
    }

    // Mobile format
    const mobile = (formValues["mobile_number"] || "").replace(/\D/g, "");
    if (mobile && mobile.length !== 10) {
      errors["mobile_number"] = "Mobile Number must be exactly 10 digits.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // Scroll to first error
      const firstKey = Object.keys(errors)[0];
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setStep("docs");
  }


  // --------------------------------------------------------
  // Docs step → review (auto-advance if no missing docs)
  // --------------------------------------------------------
  function handleDocsNext() {
    setStep("review");
  }


  // --------------------------------------------------------
  // Submit demo form
  // --------------------------------------------------------
  async function handleSubmitDemo() {
    setSubmitting(true);
    try {
      const result = await submitDemoApplicationAPI(
        userId,
        plan.scheme_name,
        formValues,
      );
      setDemoResult(result);
      setStep("done");
    } catch (err) {
      console.error("ApplyFlow: submitDemoApplicationAPI failed:", err);
      const serverErrors = err?.response?.data?.errors;
      if (Array.isArray(serverErrors) && serverErrors.length > 0) {
        // Map back to field errors if possible — else show alert
        alert("Validation failed:\n" + serverErrors.join("\n"));
      } else {
        alert(
          err?.response?.data?.detail ||
          "Submission failed. Please check your fields and try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }


  // --------------------------------------------------------
  // Computed from plan
  // --------------------------------------------------------
  const demoForm   = plan?.demo_form || { fields: [], auto_filled: 0, total_fields: 0, fill_pct: 0 };
  const autoCount  = demoForm.auto_filled || 0;
  const totalCount = demoForm.total_fields || 0;
  const fillPct    = demoForm.fill_pct || 0;

  const profileFields   = demoForm.fields?.filter((f) => !f.sensitive) || [];
  const sensitiveFields = demoForm.fields?.filter((f) =>  f.sensitive) || [];


  // --------------------------------------------------------
  // RENDER
  // --------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* ── Back ── */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-cyan-600 transition"
        >
          <FaArrowLeft className="text-xs" /> Back
        </button>


        {/* ── LOADING ── */}
        {step === "loading" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
            <div className="flex justify-center gap-1.5">
              <Dot delay={0} /><Dot delay={150} /><Dot delay={300} />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Application Agent is preparing your form…
            </p>
            <p className="text-xs text-slate-400">Reading your profile and matching scheme fields</p>
          </div>
        )}


        {/* ── ERROR ── */}
        {step === "error" && (
          <div className="bg-red-50 rounded-2xl border border-red-200 p-8 text-center space-y-3">
            <FaTimesCircle className="text-red-400 text-3xl mx-auto" />
            <p className="text-sm font-semibold text-red-700">{errorMsg}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-xl bg-red-100 border border-red-200 text-red-700 text-sm font-semibold hover:bg-red-200 transition"
            >
              Go Back
            </button>
          </div>
        )}


        {/* ── FORM FILL (Step 2) ── */}
        {step === "form" && plan && (
          <>
            {/* Step bar */}
            <StepBar step="form" />

            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <p className="text-xs text-cyan-600 font-semibold uppercase tracking-wider mb-1">
                Demo Application Form
              </p>
              <h1 className="text-lg font-black text-slate-800">{plan.scheme_name}</h1>

              {/* Auto-fill progress bar */}
              <div className="mt-3 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">
                    {autoCount}/{totalCount} fields auto-filled from your profile
                  </span>
                  <span className="font-bold text-cyan-600">{fillPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all"
                    style={{ width: `${fillPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Demo notice */}
            <div className="flex items-start gap-3 bg-violet-50 border border-violet-200 rounded-xl p-3.5 text-xs text-violet-800">
              <FaShieldAlt className="text-violet-400 shrink-0 mt-0.5" />
              <p>
                <strong>DEMO FORM — Not a real government application.</strong>{" "}
                Fields marked ✓ were auto-filled from your profile.
                Sensitive fields (Aadhaar, mobile, bank) are intentionally blank — enter them yourself.
                Submitting this form does <strong>not</strong> send anything to a government portal.
              </p>
            </div>

            {/* Profile-backed fields */}
            {profileFields.length > 0 && (
              <SectionCard icon={<FaUserEdit className="text-cyan-500" />} title="Your Details" accent="cyan">
                <div className="space-y-3">
                  {profileFields.map((field) => (
                    <div key={field.key} id={`field-${field.key}`}>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1">
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                        {field.auto_filled && (
                          <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                            <FaCheckCircle className="text-[9px]" /> Auto-filled
                          </span>
                        )}
                      </label>
                      <input
                        type={field.type === "number" ? "number" : "text"}
                        value={formValues[field.key] || ""}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        placeholder={field.auto_filled ? "" : field.hint}
                        className={`w-full text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition
                          ${field.auto_filled
                            ? "border-emerald-200 bg-emerald-50 focus:ring-emerald-300"
                            : "border-slate-200 bg-white focus:ring-cyan-300"
                          }
                          ${formErrors[field.key] ? "border-red-400 ring-1 ring-red-300" : ""}
                        `}
                      />
                      {formErrors[field.key] && (
                        <p className="text-[11px] text-red-600 mt-1">{formErrors[field.key]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Sensitive fields */}
            {sensitiveFields.length > 0 && (
              <SectionCard icon={<FaLock className="text-amber-500" />} title="Sensitive Details" accent="amber">
                <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  These fields are never auto-filled for your security. Please enter them yourself.
                  They are used <strong>only within this demo form</strong> and are never sent to any server or portal.
                </p>
                <div className="space-y-3 mt-1">
                  {sensitiveFields.map((field) => (
                    <div key={field.key} id={`field-${field.key}`}>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1">
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        value={formValues[field.key] || ""}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        placeholder={field.hint}
                        className={`w-full text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 border-slate-200 bg-white focus:ring-amber-300 transition
                          ${formErrors[field.key] ? "border-red-400 ring-1 ring-red-300" : ""}
                        `}
                      />
                      {formErrors[field.key] && (
                        <p className="text-[11px] text-red-600 mt-1">{formErrors[field.key]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Blockers */}
            {plan.blockers.length > 0 && (
              <div className="bg-red-50 rounded-xl border border-red-200 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-sm font-bold text-red-700">
                  <FaTimesCircle /> Cannot proceed to official portal
                </div>
                {plan.blockers.map((b, i) => (
                  <p key={i} className="text-xs text-red-700">{b}</p>
                ))}
              </div>
            )}

            {/* CTAs */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleFormNext}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold hover:shadow-lg transition"
              >
                Review Documents →
              </button>
            </div>
          </>
        )}


        {/* ── DOCUMENTS CHECK (Step 3) ── */}
        {step === "docs" && plan && (
          <>
            <StepBar step="docs" />

            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <p className="text-xs text-cyan-600 font-semibold uppercase tracking-wider mb-1">
                Document Checklist
              </p>
              <h1 className="text-lg font-black text-slate-800">{plan.scheme_name}</h1>
            </div>

            {plan.required_docs.length > 0 ? (
              <SectionCard icon={<FaFileAlt className="text-amber-500" />} title="Required Documents" accent="amber">
                <div className="space-y-2 mt-1">
                  {plan.required_docs.map((doc, i) => {
                    const available = (plan.docs_available || []).includes(doc);
                    return (
                      <div key={i} className="flex items-start gap-2.5 text-xs">
                        {available ? (
                          <FaCheckCircle className="text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <FaTimesCircle className="text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span className={available ? "text-slate-700" : "text-amber-800 font-semibold"}>
                            {doc}
                          </span>
                          {available && (
                            <span className="ml-1.5 text-[10px] text-emerald-600">(confirmed from profile)</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {plan.docs_missing?.length > 0 ? (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                    <p className="font-semibold mb-1">
                      ⚠ {plan.docs_missing.length} document{plan.docs_missing.length > 1 ? "s" : ""} to gather before applying:
                    </p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {plan.docs_missing.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>
                ) : (
                  <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-center gap-2">
                    <FaCheckCircle className="text-emerald-500 shrink-0" />
                    All required documents are confirmed from your profile.
                  </div>
                )}
              </SectionCard>
            ) : (
              <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 text-xs text-emerald-800 flex items-center gap-2">
                <FaCheckCircle className="text-emerald-500 shrink-0" />
                No specific documents listed — check the official portal for requirements.
              </div>
            )}

            {/* Deadline */}
            {plan.scheme?.deadline && (
              <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                <FaCalendarAlt />
                Application Deadline: <strong>{plan.scheme.deadline}</strong>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setStep("form")}
                className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
              >
                ← Edit Form
              </button>
              <button
                onClick={handleDocsNext}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold hover:shadow-lg transition"
              >
                Review &amp; Confirm →
              </button>
            </div>
          </>
        )}


        {/* ── REVIEW (Step 4) ── */}
        {step === "review" && plan && (
          <>
            <StepBar step="review" />

            {/* DEMO banner */}
            <div className="flex items-center gap-3 bg-violet-50 border-2 border-violet-300 rounded-2xl px-5 py-3">
              <FaShieldAlt className="text-violet-500 text-2xl shrink-0" />
              <div>
                <p className="text-sm font-black text-violet-800">DEMO FORM — Not a real government submission</p>
                <p className="text-xs text-violet-700 mt-0.5">
                  Clicking "Submit Demo" issues a local reference ID only. No data is sent to any portal.
                </p>
              </div>
            </div>

            {/* Scheme header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <p className="text-xs text-cyan-600 font-semibold uppercase tracking-wider mb-1">Application Review</p>
              <h1 className="text-lg font-black text-slate-800">{plan.scheme_name}</h1>
              {plan.scheme_category && (
                <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 text-[11px] font-semibold">
                  {plan.scheme_category}
                </span>
              )}
            </div>

            {/* Read-only field summary */}
            <SectionCard icon={<FaClipboardCheck className="text-cyan-500" />} title="Your Filled Details" accent="cyan">
              <div className="divide-y divide-slate-100">
                {(plan.demo_form?.fields || []).map((field) => {
                  const val = (formValues[field.key] || "").trim();
                  return (
                    <div key={field.key} className="flex items-start gap-3 py-2 text-xs">
                      <span className="w-36 shrink-0 text-slate-500">{field.label}</span>
                      <div className="flex-1 flex items-center gap-2">
                        {val ? (
                          <>
                            <span className={`font-semibold ${field.sensitive ? "font-mono tracking-widest text-slate-600" : "text-slate-800"}`}>
                              {field.sensitive
                                ? val.replace(/./g, "•")  // mask sensitive values in review
                                : val}
                            </span>
                            {field.auto_filled && (
                              <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                                ✓ Profile
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-slate-300 italic">
                            {field.required ? "⚠ Required — not filled" : "Not provided"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setStep("form")}
                className="mt-1 flex items-center gap-1.5 text-xs text-cyan-600 hover:text-cyan-500 transition"
              >
                <FaEdit className="text-[11px]" /> Edit fields
              </button>
            </SectionCard>

            {/* Portal info */}
            <SectionCard icon={<FaInfoCircle className="text-slate-500" />} title="Official Application Portal" accent="slate">
              <div className="text-xs space-y-1.5 mt-1">
                <div><span className="text-slate-500">Portal:</span>{" "}<span className="font-semibold">{plan.portal_name}</span></div>
                {plan.portal_note && <p className="text-slate-600">{plan.portal_note}</p>}
                {plan.official_url ? (
                  <a href={normalizeUrl(plan.official_url)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-cyan-600 underline hover:text-cyan-500 mt-1">
                    <FaExternalLinkAlt className="text-[10px]" />
                    {plan.official_url}
                  </a>
                ) : (
                  <p className="text-amber-700 font-semibold">No official URL on record — search the scheme name at myscheme.gov.in</p>
                )}
              </div>
            </SectionCard>

            {/* Missing docs reminder */}
            {(plan.docs_missing || []).length > 0 && (
              <div className="text-xs bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800">
                <p className="font-semibold mb-1">Gather before applying on the official portal:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {plan.docs_missing.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            )}

            {/* Safety notice */}
            <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500">
              <FaShieldAlt className="text-slate-400 shrink-0 mt-0.5" />
              <p>
                Clicking "Submit Demo" creates a <strong>local demo reference ID only</strong> — it does
                not submit anything to any government portal, does not create a real application, and cannot
                be used for tracking. After this step, open the official portal to file your real application.
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setStep("docs")}
                className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmitDemo}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-600 text-white text-sm font-bold hover:shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><Dot delay={0} /><Dot delay={150} /><Dot delay={300} /></>
                ) : (
                  "Submit Demo →"
                )}
              </button>
            </div>
          </>
        )}


        {/* ── DONE (Step 5) ── */}
        {step === "done" && plan && (
          <>
            <StepBar step="done" />

            {/* Success card */}
            <div className="bg-white rounded-2xl border border-emerald-200 p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto">
                <FaCheckCircle className="text-emerald-500 text-3xl" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800">Demo Form Submitted</h2>
                <p className="text-sm text-slate-500 mt-1.5 max-w-sm mx-auto">
                  Your demo application for <strong>{plan.scheme_name}</strong> has been recorded locally.
                </p>
              </div>

              {/* DEMO reference ID */}
              {demoResult?.reference_id && (
                <div className="bg-violet-50 border-2 border-violet-200 rounded-xl p-4 space-y-1.5">
                  <p className="text-xs font-semibold text-violet-700 uppercase tracking-wider">Demo Reference ID</p>
                  <p className="font-mono text-lg font-black text-violet-800 tracking-wider">
                    {demoResult.reference_id}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 mt-2">
                    <FaShieldAlt className="text-amber-500 shrink-0" />
                    ⚠ This is a DEMO reference — NOT a real government acknowledgement number
                  </div>
                </div>
              )}
            </div>

            {/* Important reminders */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 space-y-1.5">
              <p className="font-semibold">What to do next:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Open the official government portal using the button below</li>
                <li>Re-enter your details on that portal and complete the real application</li>
                <li>Note the real acknowledgement/reference number issued by the portal</li>
                <li>Do not share OTPs or passwords with anyone</li>
                <li>Check your application status on the official portal directly</li>
              </ul>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              {plan.official_url && (
                <a
                  href={normalizeUrl(plan.official_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold hover:shadow-lg transition flex items-center justify-center gap-2 text-center"
                >
                  Open Official Portal <FaExternalLinkAlt className="text-xs" />
                </a>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => navigate("/schemes")}
                  className="flex-1 py-3 rounded-xl border border-cyan-200 bg-cyan-50 text-cyan-700 text-sm font-semibold hover:bg-cyan-100 transition"
                >
                  Browse More Schemes
                </button>
              </div>
            </div>

            {/* Not tracked notice */}
            <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-500">
              <FaPortrait className="text-slate-400 shrink-0 mt-0.5" />
              <p>
                IntelliGov AI does not track real government application statuses.
                Check your application on the official portal using the reference/acknowledgement number
                issued there.
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
