import { FaUniversity, FaGraduationCap, FaBriefcase } from "react-icons/fa";

function Features() {

  return (

    <section 
      id="services"
      className="py-20 px-10"
    >

      <h2 className="text-4xl font-bold text-center mb-16">

        Our Services

      </h2>

      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
        {/* Government Schemes */}
        
        <div className="bg-white rounded-2xl shadow-xl p-10 hover:-translate-y-3 hover:shadow-2xl transition duration-300">

          <FaUniversity
          size={45}
          className="text-[#1A56DB]"
          />

          <h3 className="text-3xl font-bold mt-6">
            Government Schemes
          </h3>

          <p className="mt-4 text-gray-600 leading-7">
            Discover government welfare schemes tailored to your eligibility and needs.
          </p>

        </div>

        {/* Scholarships */}

        <div className="bg-white rounded-2xl shadow-xl p-10 hover:-translate-y-3 hover:shadow-2xl transition duration-300">

          <FaGraduationCap
            size={45}
            className="text-[#F59E0B]"
          />

          <h3 className="text-3xl font-bold mt-6">
            Scholarships
          </h3>

          <p className="mt-4 text-gray-600 leading-7">
            Find scholarships that match your academic profile and career goals.
          </p>

        </div>

        {/* Jobs & Internships */}

        <div className="bg-white rounded-2xl shadow-xl p-10 hover:-translate-y-3 hover:shadow-2xl transition duration-300">

          <FaBriefcase
            size={45}
            className="text-green-600"
          />

          <h3 className="text-3xl font-bold mt-6">
            Jobs & Internships
          </h3>

          <p className="mt-4 text-gray-600 leading-7">
            Explore job opportunities and internships recommended according to your profile.
          </p>

        </div>

      </div>

    </section>

  );
}

export default Features;