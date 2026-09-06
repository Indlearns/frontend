import { useEffect, useMemo, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const parseNumericStat = (value) => {
  const str = String(value ?? "").trim();
  if (!str || str.includes("/") || /[KMB]/i.test(str)) return null;

  const match = str.match(/^([\d,]+(?:\.\d+)?)(.*)$/);
  if (!match) return null;

  const numeric = Number(match[1].replace(/,/g, ""));
  if (Number.isNaN(numeric)) return null;

  return { numeric, suffix: match[2] || "" };
};

/**
 * Counts up once when scrolled into view. Stable — no re-run on parent re-renders.
 */
const AnimatedCounter = ({ value, className = "", duration = 1.2 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduceMotion = useReducedMotion();
  const parsed = useMemo(() => parseNumericStat(value), [value]);
  const animKey = useMemo(() => String(value ?? ""), [value]);
  const finishedKey = useRef(null);
  const [display, setDisplay] = useState(() => (parsed ? 0 : value));

  useEffect(() => {
    if (!parsed || reduceMotion) {
      setDisplay(value);
      finishedKey.current = animKey;
      return;
    }

    if (!inView) return;
    if (finishedKey.current === animKey) return;

    finishedKey.current = animKey;
    setDisplay(0);

    let frame;
    const start = performance.now();
    const target = parsed.numeric;

    const tick = (now) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(target * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animKey, inView, parsed, value, duration, reduceMotion]);

  if (!parsed || reduceMotion) {
    return (
      <span ref={ref} className={className}>
        {value}
      </span>
    );
  }

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {display}
      {parsed.suffix}
    </span>
  );
};

export default AnimatedCounter;
