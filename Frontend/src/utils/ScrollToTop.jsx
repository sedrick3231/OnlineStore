// ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top immediately
    window.scrollTo(0, 0);

    // Reset body classes and scroll state
    document.body.classList.remove("no-scroll");
    document.documentElement.style.overflow = "";

  }, [location.pathname, location.search, location.hash]);

  return null;
}
