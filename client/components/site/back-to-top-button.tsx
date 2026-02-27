"use client";

import { useEffect, useState } from "react";

const SHOW_BUTTON_SCROLL_Y = 220;

function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > SHOW_BUTTON_SCROLL_Y);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      aria-label="Back to top"
      className={[
        "fixed bottom-24 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full",
        "bg-primary text-black shadow-xl transition-all duration-200",
        "hover:-translate-y-0.5 hover:bg-yellow-400",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900",
        "sm:bottom-24 sm:right-6",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0",
      ].join(" ")}
      onClick={handleClick}
      type="button"
    >
      <span className="material-symbols-outlined text-[22px] leading-none">arrow_upward</span>
    </button>
  );
}

export { BackToTopButton };
