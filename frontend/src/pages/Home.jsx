function Home() {
  return (
    <>

      {/* Hero Section */}

      <section className="bg-gray-50 text-center py-24">

        <h1 className="text-6xl font-bold text-[#0a1628]">
          Welcome to IntelliGov AI
        </h1>

        <p className="text-xl text-gray-600 mt-6">
          Your AI-powered Government Services Assistant
        </p>

        <button className="mt-10 bg-[#1a56db] text-white px-8 py-3 rounded-lg hover:bg-blue-700">
          Get Started
        </button>

      </section>



      {/* Features */}

      <section className="py-20 px-10">

        <h2 className="text-4xl font-bold text-center text-[#0a1628] mb-12">
          Our Services
        </h2>

        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

          <div className="bg-white shadow-lg rounded-xl p-8 text-center hover:shadow-xl transition duration-300">
            <h3 className="text-2xl font-bold text-[#1a56db]">
              Government Schemes
            </h3>

            <p className="mt-4 text-gray-600">
              Find government welfare schemes based on your eligibility.
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-xl p-8 text-center hover:shadow-xl transition duration-300">
            <h3 className="text-2xl font-bold text-[#1a56db]">
              Scholarships
            </h3>

            <p className="mt-4 text-gray-600">
              Discover scholarships that match your profile.
            </p>
          </div>

        </div>

      </section>



      {/* About */}

      <section className="bg-[#0a1628] text-white py-20 px-12">

        <h2 className="text-4xl font-bold text-white mb-6 text-center">
          About IntelliGov AI
        </h2>

        <p className="text-lg leading-8 text-gray-200 text-center max-w-5xl mx-auto">
          IntelliGov AI is an intelligent government assistant that helps
          citizens discover schemes, scholarships, jobs, and internships
          through AI-powered recommendations. It simplifies access to
          government services in one platform.
        </p>

      </section>



      {/* Footer */}

      <footer className="bg-black text-white text-center py-6">

        © 2026 IntelliGov AI. All Rights Reserved.

      </footer>

    </>
  );
}

export default Home;