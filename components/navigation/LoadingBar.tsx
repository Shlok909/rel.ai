"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  // We detect "navigation completion" when pathname or searchParams change
  useEffect(() => {
    setLoading(false);
    loadingRef.current = false;
  }, [pathname, searchParams]);

  // We intercept clicks on <a> tags to show the bar immediately
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (
        anchor &&
        anchor.href &&
        anchor.href.startsWith(window.location.origin) &&
        anchor.target !== "_blank" &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        // If it's a link to the same origin and not a new tab, show the bar
        // But only if the path is actually changing
        const url = new URL(anchor.href);
        if (url.pathname !== window.location.pathname || url.search !== window.location.search) {
          setLoading(true);
          loadingRef.current = true;
        }
      }
    };

    window.addEventListener("click", handleAnchorClick);
    return () => window.removeEventListener("click", handleAnchorClick);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 0.4, opacity: 1 }}
          exit={{ scaleX: 1, opacity: 0 }}
          transition={{
            scaleX: { duration: 0.3, ease: "easeOut" },
            opacity: { duration: 0.2, delay: 0.1 },
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "var(--accent)",
            zIndex: 9999,
            transformOrigin: "0%",
            boxShadow: "0 0 10px var(--accent-glow)",
          }}
        />
      )}
    </AnimatePresence>
  );
}
