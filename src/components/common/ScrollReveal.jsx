import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, viewportOnce } from "../../utils/motion";

/**
 * Fade-up when scrolled into view. Respects prefers-reduced-motion.
 */
const ScrollReveal = ({
  children,
  className = "",
  delay = 0,
  as = "div",
  variant = fadeUp,
}) => {
  const reduceMotion = useReducedMotion();
  const Component = motion[as] || motion.div;

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Component
      className={className}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={variant}
    >
      {children}
    </Component>
  );
};

export default ScrollReveal;
