import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { pageTransition } from "../../utils/motion";

const PageTransition = ({ children }) => {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return children;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} {...pageTransition}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
