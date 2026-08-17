function WelcomeSection() {

  const userName = localStorage.getItem("userName") || "Citizen";

  return (
    <section className="mb-3 text-left">

      <div className="text-xl font-bold text-white">
        Welcome back, {userName}! 👋
      </div>

      <p className="mt-1 text-xs text-gray-400">
        Here's what's happening with your account today.
      </p>

    </section>
  );
}

export default WelcomeSection;