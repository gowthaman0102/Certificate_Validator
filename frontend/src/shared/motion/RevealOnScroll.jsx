import { motion } from "framer-motion";
import useReveal   from "../hooks/useReveal";

const EASE = [0.16, 1, 0.3, 1];

export function RevealOnScroll({
  children,
  delay     = 0,
  duration  = 0.5,
  className = "",
  as        = "div",
  threshold = 0.12,
  style     = {},
}) {
  const { ref, inView } = useReveal({ threshold });
  const Tag = motion[as] ?? motion.div;

  return (
    <Tag
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

export function RevealItem({
  children,
  delay     = 0,
  duration  = 0.5,
  className = "",
  style     = {},
}) {
  const { ref, inView } = useReveal({ threshold: 0.05 });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export default RevealOnScroll;
