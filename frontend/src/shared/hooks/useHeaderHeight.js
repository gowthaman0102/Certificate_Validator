import { useEffect } from "react";

/**
 * useHeaderHeight
 * Measures the actual rendered pixel height of the page header at runtime
 * and sets the CSS variable `--header-height` on document.documentElement.
 *
 * Uses ResizeObserver + window resize listener so responsive multi-line header text / wrapping
 * automatically updates --header-height with zero hardcoded assumptions.
 */
export function useHeaderHeight(headerSelector = ".dashboard-header, .brand-header-block, .auth-header, header") {
  useEffect(() => {
    function updateHeaderHeight() {
      const headerEl = document.querySelector(headerSelector);
      if (headerEl) {
        const rect = headerEl.getBoundingClientRect();
        const height = Math.round(rect.height);
        if (height > 0) {
          document.documentElement.style.setProperty("--header-height", `${height}px`);
        }
      }
    }

    // Immediate measurement
    updateHeaderHeight();
    // Second check after microtask & animation frame to catch layout shifts / fonts loading
    const rafId = requestAnimationFrame(updateHeaderHeight);

    const headerEl = document.querySelector(headerSelector);
    let resizeObserver = null;
    if (headerEl && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(updateHeaderHeight);
      resizeObserver.observe(headerEl);
    }

    window.addEventListener("resize", updateHeaderHeight);

    return () => {
      cancelAnimationFrame(rafId);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, [headerSelector]);
}

export default useHeaderHeight;
