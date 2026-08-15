import { useEffect, useRef } from "react";
import { animate }            from "framer-motion";

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function CountUp({
  to,
  from      = 0,
  duration  = 0.8,
  decimals  = 0,
  prefix    = "",
  suffix    = "",
  className = "",
  trigger   = true,
  style     = {},
}) {
  const nodeRef = useRef(null);

  useEffect(() => {
    if (!trigger) return;

    const node = nodeRef.current;
    if (!node) return;

    if (prefersReduced()) {
      node.textContent = prefix + to.toFixed(decimals) + suffix;
      return;
    }

    const controls = animate(from, to, {
      duration,
      ease: "easeOut",
      onUpdate(value) {
        if (node) {
          node.textContent = prefix + value.toFixed(decimals) + suffix;
        }
      },
    });

    return () => controls.stop();
  }, [trigger, to, from, duration, decimals, prefix, suffix]);

  return (
    <span ref={nodeRef} className={className} style={style}>
      {prefix}{from.toFixed(decimals)}{suffix}
    </span>
  );
}

export default CountUp;