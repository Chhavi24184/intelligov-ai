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


  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  };


  // =========================
  // SUBMIT FORM
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);
    setError("");
    setSchemes([]);

    try {

      const data = await eligibilityAPI(formData);

      console.log("Eligibility Response:", data);

      /*
        Expected backend response could be:

        {
          "success": true,
          "eligible_schemes": [...]
        }
      */

      setSchemes(
        data.eligible_schemes ||
        data.schemes ||
        []
      );

    } catch (error) {

      console.error("Eligibility API Error:", error);

      setError(
        "Unable to connect to the server. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };


  return (

    <section className="relative min-h-screen bg-[#0a1628] overflow-hidden">

      {/* Background Glow */}

      <div className="absolute top-20 left-20 w-[400px] h-[400px] bg-blue-600/20 blur-[160px] rounded-full"></div>

      <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-purple-600/20 blur-[150px] rounded-full"></div>


      {/* Content */}

      <div className="relative max-w-5xl mx-auto px-6 py-8">


        {/* Heading */}

        <div className="text-center mb-7">

          <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-300 via-white to-yellow-400 bg-clip-text text-transparent">

            Eligibility Checker

          </div>

          <p className="text-gray-300 mt-3">

            Enter your details to discover government schemes
            you may be eligible for.

          </p>

        </div>


        {/* =========================
            FORM
        ========================= */}

        <div className="bg-[#101d34]/90 border border-blue-900/40 rounded-3xl p-6 backdrop-blur-lg">

          <form
            onSubmit={handleSubmit}
            className="grid md:grid-cols-2 gap-5"
          >


            {/* AGE */}

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
                required
                className="w-full bg-[#0b1730] border border-blue-900/50 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400 transition"
              />

            </div>


            {/* OCCUPATION */}

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


            {/* GENDER */}

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

                <option value="">
                  Select Gender
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>


            {/* INCOME */}

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
                required
                className="w-full bg-[#0b1730] border border-blue-900/50 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400 transition"
              />

            </div>


            {/* STATE */}

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

                <option value="">
                  Select State
                </option>

                <option value="Haryana">
                  Haryana
                </option>

                <option value="Punjab">
                  Punjab
                </option>

                <option value="Delhi">
                  Delhi
                </option>

                <option value="Uttar Pradesh">
                  Uttar Pradesh
                </option>

                <option value="Rajasthan">
                  Rajasthan
                </option>

                <option value="Maharashtra">
                  Maharashtra
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>


            {/* SUBMIT */}

            <div className="md:col-span-2 flex justify-center pt-2">

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-[0_0_20px_rgba(59,130,246,0.35)] hover:scale-105 transition disabled:opacity-50"
              >

                {loading
                  ? "Checking..."
                  : "Check Eligibility"}

              </button>

            </div>

          </form>


          {/* ERROR */}

          {error && (

            <div className="mt-5 text-center text-red-400">

              {error}

            </div>

          )}

        </div>


        {/* =========================
            ELIGIBLE SCHEMES
        ========================= */}

        {schemes.length > 0 && (

          <div className="mt-7">

            <div className="text-2xl font-bold text-white mb-4">

              🎯 Schemes You May Be Eligible For

            </div>


            <div className="grid md:grid-cols-2 gap-4">

              {schemes.map((scheme, index) => (

                <div
                  key={index}
                  className="bg-[#101d34] border border-blue-900/40 rounded-2xl p-5 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] transition"
                >

                  <div className="text-cyan-300 text-lg font-bold">

                    {scheme.name ||
                      scheme.title ||
                      "Government Scheme"}

                  </div>


                  {scheme.description && (

                    <p className="text-gray-400 text-sm mt-2">

                      {scheme.description}

                    </p>

                  )}


                  {scheme.eligibility && (

                    <p className="text-gray-300 text-sm mt-3">

                      <span className="text-white font-semibold">
                        Eligibility:
                      </span>{" "}

                      {scheme.eligibility}

                    </p>

                  )}

                </div>

              ))}

            </div>

          </div>

        )}

      </div>

    </section>

  );
}

export default EligibilityChecker;