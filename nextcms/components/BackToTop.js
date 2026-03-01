"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 420);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!showTop) return null;

  return (
    <button className="backTop" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top">
      <ArrowUp size={18} />
    </button>
  );
}
