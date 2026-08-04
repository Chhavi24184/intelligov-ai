function SchemeRecommendation() {
  return (
    <section className="relative min-h-screen bg-[#0a1628] overflow-hidden flex flex-col items-center justify-center">

      {/* Background Glow */}
      <div className="absolute w-[700px] h-[700px] bg-blue-600/20 blur-[180px] rounded-full"></div>

      {/* Stars */}
      <div className="absolute inset-0">

        <div className="absolute top-20 left-24 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>

        <div className="absolute top-36 right-40 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>

        <div className="absolute bottom-36 left-60 w-2 h-2 bg-sky-300 rounded-full animate-pulse"></div>

        <div className="absolute bottom-20 right-24 w-1 h-1 bg-pink-400 rounded-full animate-ping"></div>

        <div className="absolute top-1/2 left-12 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>

      </div>

      {/* Orbit Ring */}
      <div className="absolute w-[780px] h-[180px] border border-blue-500/40 rounded-full"></div>

      <div className="absolute w-[820px] h-[200px] border border-purple-500/30 rounded-full rotate-6"></div>

      {/* Heading */}

      <h1 className="inline-block text-2xl md:text-7xl font-black bg-gradient-to-r from-cyan-300 via-white to-yellow-400 bg-clip-text text-transparent hover:scale-105 transition-all duration-500 drop-shadow-[0_0_25px_rgba(59,130,246,0.8)]">
        Scheme Recommendation
      </h1>
      
      {/* Glow Line */}

      <div className="w-72 h-1 mt-5 rounded-full bg-gradient-to-r from-blue-500 via-sky-400 to-purple-500 shadow-[0_0_40px_#3b82f6]"></div>

      {/* Subtitle */}

      <p className="mt-10 text-2xl text-gray-300 text-center max-w-3xl leading-10">

        AI will recommend government schemes based on your profile,
        eligibility and personal details using intelligent recommendations.

      </p>

    </section>
  );
}

export default SchemeRecommendation;