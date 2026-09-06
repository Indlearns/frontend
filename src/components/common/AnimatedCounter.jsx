import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const parseNumericStat = (value) => {
  const str = String(value ?? "").trim();
  if (!str || str.includes("/")) return null;
  const match = str.match(/^([\d,]+(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  const numeric = Number(match[1].replace(/,/g, ""));
  if (Number.isNaN(numeric)) return null;
  return { numeric, suffix: match[2] || "" };
};

const AnimatedCounter = ({ value, className = "", duration = 1.4 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduceMotion = useReducedMotion();
  const parsed = parseNumericStat(value);
  const [display, setDisplay] = useState(parsed ? 0 : value);

  useEffect(() => {
    if (!parsed || !inView || reduceMotion) {
      setDisplay(value);
      return;
    }

    let frame;
    const start = performance.now();
    const target = parsed.numeric;

    const tick = (now) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, parsed, value, duration, reduceMotion]);

  if (!parsed || reduceMotion) {
    return (
      <span ref={ref} className={className}>
        {value}
      </span>
    );
  }

  return (
    <motion.span ref={ref} className={className} initial={{ opacity: 0.6 }} animate={{ opacity: 1 }}>
      {display}
      {parsed.suffix}
    </motion.span>
  );
};

export default AnimatedCounter;
