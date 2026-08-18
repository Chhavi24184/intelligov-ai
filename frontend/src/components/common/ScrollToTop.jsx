import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

function ScrollToTop() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show the button after only a small amount of scrolling
      setShowButton(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll);

    // Check initial position
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`
        fixed bottom-6 left-6 z-[100]
        w-14 h-14
        rounded-full
        bg-white
        border-2 border-cyan-400
        text-cyan-500
        flex items-center justify-center
        shadow-lg shadow-cyan-500/20
        transition-all duration-300
        hover:bg-cyan-50
        hover:scale-110
        active:scale-95
        ${
          showButton
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }
      `}
    >
      <FaArrowUp className="text-xl" />
    </button>
  );
}

export default ScrollToTop;