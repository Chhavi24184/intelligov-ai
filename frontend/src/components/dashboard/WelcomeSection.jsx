function WelcomeSection() {

  const userName = localStorage.getItem("userName") || "Citizen";

  return (
    <section className="mb-3 text-left">

      {/* Welcome Heading */}
      <div
        className="
          text-xl
          sm:text-2xl
          font-bold
          bg-gradient-to-r
          from-slate-800
          via-blue-700
          to-cyan-600
          bg-clip-text
          text-transparent
        "
      >
        Welcome back, {userName}! 👋
      </div>


      {/* Subtitle */}
      <p className="mt-1 text-xs sm:text-sm text-slate-500">
        Here's what's happening with your account today.
      </p>

    </section>
  );
}

export default WelcomeSection;