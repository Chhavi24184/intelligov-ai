import { useState } from "react";
import { eligibilityAPI } from "../services/api";

function EligibilityChecker() {
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSchemes([]);
    setChecked(false);

    try {
      const data = await eligibilityAPI({
        age: Number(formData.age),
        occupation: formData.occupation,
        gender: formData.gender,
        income: Number(formData.income),
        state: formData.state,
      });

      console.log("Eligibility Response:", data);

      const recommendedSchemes =
        data?.data?.recommended_schemes || [];

      setSchemes(recommendedSchemes);
      setChecked(true);

      if (!data?.success) {
        setError(
          data?.message || "Unable to check eligibility."
        );
      }
    } catch (err) {
      console.error("Eligibility API Error:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

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
  };

  return (
    <section className="relative min-h-screen bg-[#0a1628] overflow-hidden">
      <div className="absolute top-20 left-20 w-[400px] h-[400px] bg-blue-600/20 blur-[160px] rounded-full" />

      <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-purple-600/20 blur-[150px] rounded-full" />

      <div className="relative max-w-5xl mx-auto px-6 py-8">
        <div className="text-center mb-7">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-300 via-white to-yellow-400 bg-clip-text text-transparent">
            Eligibility Checker
          </h1>

          <p className="text-gray-300 mt-3">
            Enter your details to discover government schemes
            you may be eligible for.
          </p>
        </div>

        <div className="bg-[#101d34]/90 border border-blue-900/40 rounded-3xl p-6 backdrop-blur-lg">
          <form
            onSubmit={handleSubmit}
            className="grid md:grid-cols-2 gap-5"
          >
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Age
              </label>

              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter your age"
                min="1"
                max="120"
                required
                className="w-full bg-[#0b1730] border border-blue-900/50 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Occupation
              </label>

              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="e.g. Farmer, Student"
                required
                className="w-full bg-[#0b1730] border border-blue-900/50 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Gender
              </label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full bg-[#0b1730] border border-blue-900/50 rounded-xl px-4 py-3 text-gray-300 outline-none focus:border-cyan-400 transition"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Annual Income
              </label>

              <input
                type="number"
                name="income"
                value={formData.income}
                onChange={handleChange}
                placeholder="Enter annual income"
                min="0"
                required
                className="w-full bg-[#0b1730] border border-blue-900/50 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-300 text-sm mb-2">
                State
              </label>

              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full bg-[#0b1730] border border-blue-900/50 rounded-xl px-4 py-3 text-gray-300 outline-none focus:border-cyan-400 transition"
              >
                <option value="">Select State</option>
                <option value="Haryana">Haryana</option>
                <option value="Punjab">Punjab</option>
                <option value="Delhi">Delhi</option>
                <option value="Uttar Pradesh">
                  Uttar Pradesh
                </option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Maharashtra">
                  Maharashtra
                </option>
                <option value="Gujarat">Gujarat</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-[0_0_20px_rgba(59,130,246,0.35)] hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Checking..." : "Check Eligibility"}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-[#18294a] border border-blue-800/50 text-gray-300 font-semibold hover:border-cyan-400 hover:text-white transition disabled:opacity-50"
              >
                Reset
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-center text-red-400">
              {error}
            </div>
          )}
        </div>

        {checked && schemes.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              🎯 Schemes You May Be Eligible For
            </h2>

            <p className="text-gray-400 text-sm mb-5">
              Based on the information you provided, these
              government schemes were recommended for you.
            </p>

            <div className="grid md:grid-cols-2 gap-5">
              {schemes.map((scheme, index) => (
                <div
                  key={scheme.id || index}
                  className="bg-[#101d34] border border-blue-900/40 rounded-2xl p-5 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="text-cyan-300 text-lg font-bold">
                    {scheme.name ||
                      scheme.title ||
                      "Government Scheme"}
                  </div>

                  {scheme.category && (
                    <div className="inline-block mt-3 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs">
                      {scheme.category}
                    </div>
                  )}

                  {scheme.description && (
                    <div className="mt-4">
                      <div className="text-gray-300 text-sm font-semibold">
                        Description
                      </div>

                      <p className="text-gray-400 text-sm mt-1 leading-6">
                        {scheme.description}
                      </p>
                    </div>
                  )}

                  {scheme.eligibility && (
                    <div className="mt-4">
                      <div className="text-gray-300 text-sm font-semibold">
                        Eligibility
                      </div>

                      <p className="text-gray-400 text-sm mt-1 leading-6">
                        {scheme.eligibility}
                      </p>
                    </div>
                  )}

                  {scheme.documents && (
                    <div className="mt-4">
                      <div className="text-gray-300 text-sm font-semibold">
                        Documents Required
                      </div>

                      <p className="text-gray-400 text-sm mt-1 leading-6">
                        {Array.isArray(scheme.documents)
                          ? scheme.documents.join(", ")
                          : scheme.documents}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {checked && schemes.length === 0 && !error && (
          <div className="mt-8 text-center bg-[#101d34] border border-blue-900/40 rounded-2xl p-8">
            <div className="text-4xl mb-3">🔍</div>

            <div className="text-white text-xl font-semibold">
              No matching schemes found
            </div>

            <p className="text-gray-400 mt-2">
              Based on the information provided, no eligible
              schemes were returned by the system.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default EligibilityChecker;