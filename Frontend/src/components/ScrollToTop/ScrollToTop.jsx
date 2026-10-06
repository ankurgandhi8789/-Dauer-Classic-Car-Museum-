import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

// Scrolls to the top every time the page (route) changes.
// If the link has a #hash (e.g. /#visit), it scrolls to that section instead.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}