import {
  FaUniversity,
  FaGraduationCap,
  FaBriefcase,
  FaRobot,
} from "react-icons/fa";

function StatsCards() {
  const stats = [
    {
      title: "Government Schemes",
      value: "250+",
      subtitle: "Available Schemes",
      icon: <FaUniversity size={28} />,
      color: "from-blue-500 to-cyan-400",
    },
    {
      title: "Scholarships",
      value: "120+",
      subtitle: "Active Scholarships",
      icon: <FaGraduationCap size={28} />,
      color: "from-green-500 to-emerald-400",
    },
    {
      title: "Jobs & Internships",
      value: "95+",
      subtitle: "Career Opportunities",
      icon: <FaBriefcase size={28} />,
      color: "from-purple-500 to-pink-400",
    },
    {
      title: "AI Chats",
      value: "1000+",
      subtitle: "Queries Solved",
      icon: <FaRobot size={22} />,
      color: "from-yellow-500 to-orange-400",
    },
  ];

  return (
    <section className="grid grid-cols-4 gap-5 mb-4">

      {stats.map((item, index) => (
        <div
          key={index}
          className="group bg-[#101d34] border border-blue-900/40 rounded-lg p-3 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_25px_rgba(59,130,246,0.35)]"
        >
          <div className="flex items-center justify-between">

            <div>
              <p className="text-gray-400 text-sm">
                {item.title}
              </p>

              <h2 className="text-2xl font-bold text-white mt-2">
                {item.value}
              </h2>

              <p className="text-gray-500 text-xs mt-1">
                {item.subtitle}
              </p>
            </div>

            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition`}
            >
              {item.icon}
            </div>

          </div>
        </div>
      ))}

    </section>
  );
}

export default StatsCards;