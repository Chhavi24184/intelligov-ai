import {
  FaUniversity,
  FaGraduationCap,
  FaBriefcase,
  FaBookmark,
} from "react-icons/fa";

function StatsCards() {
  const stats = [
    {
      title: "Total Schemes",
      value: "126",
      subtitle: "Available for you",
      icon: <FaUniversity size={24} />,
      color: "from-blue-500 to-cyan-400",
    },
    {
      title: "Eligible Schemes",
      value: "18",
      subtitle: "You qualify for",
      icon: <FaGraduationCap size={24} />,
      color: "from-emerald-500 to-green-400",
    },
    {
      title: "Applications",
      value: "07",
      subtitle: "Submitted by you",
      icon: <FaBriefcase size={24} />,
      color: "from-purple-500 to-pink-400",
    },
    {
      title: "Saved Schemes",
      value: "12",
      subtitle: "Saved for later",
      icon: <FaBookmark size={24} />,
      color: "from-amber-500 to-orange-400",
    },
  ];

  return (
    <section
      className="
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-4
        gap-5
        mb-4
        w-full
      "
    >
      {stats.map((item, index) => (
        <div
          key={index}
          className="
            group
            w-full
            min-w-0
            bg-[#101d34]
            border border-blue-900/40
            rounded-2xl
            p-5
            transition-all
            duration-300
            hover:-translate-y-1
            hover:border-cyan-400/30
            hover:shadow-[0_0_25px_rgba(59,130,246,0.20)]
          "
        >
          <div className="flex items-center justify-between gap-4">

            {/* TEXT */}
            <div className="min-w-0">

              <p className="text-gray-300 text-sm sm:text-base font-medium truncate">
                {item.title}
              </p>

              <h2
                className={`
                  text-3xl
                  font-bold
                  mt-2
                  bg-gradient-to-r
                  ${item.color}
                  bg-clip-text
                  text-transparent
                `}
              >
                {item.value}
              </h2>

              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                {item.subtitle}
              </p>

            </div>

            {/* ICON */}
            <div
              className={`
                shrink-0
                w-12
                h-12
                rounded-xl
                bg-gradient-to-br
                ${item.color}
                flex
                items-center
                justify-center
                text-white
                shadow-lg
                group-hover:scale-105
                transition-transform
                duration-300
              `}
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