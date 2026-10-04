import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaGraduationCap, FaArrowLeft, FaBookmark, FaCalendarAlt, FaFileAlt, FaExternalLinkAlt } from "react-icons/fa";
import { eligibilityByProfileAPI, saveSchemeAPI } from "../services/api";

function MatchedSchemes() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);
  
  useEffect(() => {
    if (!userId) {
      setError("Please log in to view matched schemes.");
      setLoading(false);
      return;
    }
    
    eligibilityByProfileAPI(userId)
      .then((res) => {
        const matched = res?.data?.recommended_schemes || res?.recommended_schemes || [];
        setSchemes(matched);
      })
      .catch((err) => {
        setError("Failed to load matched schemes. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  const handleApplyWithAgent = (scheme) => {
    const encoded = encodeURIComponent(JSON.stringify(scheme));
    navigate(`/apply?scheme=${encoded}`);
  };

  const handleSave = async (scheme) => {
    if (!userId || savingId === scheme.id) return;
    setSavingId(scheme.id || scheme.name);
    try {
      await saveSchemeAPI(userId, scheme);
      alert("Scheme saved successfully!");
    } catch {
      alert("Could not save scheme.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f9ff] text-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6 mt-16 md:mt-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-blue-100 text-slate-600 text-sm font-medium shadow-sm hover:text-blue-600 hover:border-blue-300 hover:bg-white transition-all duration-300"
          >
            <FaArrowLeft className="text-xs" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="text-left mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent flex items-center gap-3">
            <FaGraduationCap className="text-emerald-500" />
            Your Matched Schemes
          </h1>
          <p className="text-slate-500 mt-2">
            Based on your profile, here are the government schemes you are eligible for.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-4 text-slate-500">Finding your matches...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-center">
            {error}
          </div>
        ) : schemes.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl border border-emerald-100 p-8 rounded-3xl text-center shadow-sm">
            <FaGraduationCap className="text-emerald-200 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Matched Schemes Found</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              We couldn't find any schemes matching your current profile. Update your profile or check again later.
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="mt-6 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
            >
              Update Profile
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schemes.map((scheme, index) => (
              <div key={index} className="bg-white rounded-2xl border border-emerald-100 shadow-[0_4px_20px_rgba(16,185,129,0.05)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                <div className="p-5 flex-1">
                  {scheme.category && (
                    <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-full mb-3 border border-emerald-100">
                      {scheme.category}
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">
                    {scheme.name || scheme.scheme_name}
                  </h3>
                  {scheme.description && (
                    <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                      {scheme.description}
                    </p>
                  )}
                  {scheme.benefits && (
                    <div className="mb-4">
                      <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">Benefits</span>
                      <p className="text-sm text-emerald-600 line-clamp-2">{scheme.benefits}</p>
                    </div>
                  )}
                  {scheme.deadline && (
                    <div className="flex items-center gap-2 text-xs font-medium text-amber-600 bg-amber-50 px-3 py-2 rounded-lg inline-flex">
                      <FaCalendarAlt />
                      Deadline: {scheme.deadline}
                    </div>
                  )}
                </div>
                
                <div className="p-5 bg-slate-50 border-t border-emerald-50 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleApplyWithAgent(scheme)}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    Apply with AI ✦
                  </button>
                  <button
                    onClick={() => handleSave(scheme)}
                    disabled={savingId === (scheme.id || scheme.name)}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-200 transition-all flex items-center gap-2"
                  >
                    <FaBookmark />
                    {savingId === (scheme.id || scheme.name) ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MatchedSchemes;
