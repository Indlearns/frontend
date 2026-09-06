import { useReducedMotion } from "framer-motion";

/**
 * Soft animated background for page sections — education-themed, non-distracting.
 */
const SectionBackground = ({ variant = "default" }) => {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return null;

  if (variant === "stats") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-edu-mesh opacity-50 dark:opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-brand-200/20 dark:bg-brand-500/8 blur-3xl animate-blob" />
      </div>
    );
  }

  if (variant === "features") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-edu-dots opacity-20 dark:opacity-10" />
        <div className="absolute -top-20 right-[10%] w-56 h-56 rounded-full bg-accent-200/25 dark:bg-accent-500/10 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-[5%] w-64 h-64 rounded-full bg-brand-200/20 dark:bg-brand-500/8 blur-3xl animate-blob animation-delay-4000" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand-100/30 dark:bg-brand-900/20 blur-3xl animate-blob" />
    </div>
  );
};

export default SectionBackground;
