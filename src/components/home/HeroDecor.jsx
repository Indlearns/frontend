import { useReducedMotion } from "framer-motion";

/**
 * Hero background only — soft blobs & dots. No floating icons (they overlapped the showcase).
 */
const HeroDecor = () => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div
        className={`absolute inset-0 bg-edu-mesh opacity-60 dark:opacity-35 ${reduceMotion ? "" : "animate-mesh-shift"}`}
      />

      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand-400/20 dark:bg-brand-500/12 blur-3xl animate-blob" />
      <div className="absolute top-[20%] -right-28 w-72 h-72 rounded-full bg-accent-400/15 dark:bg-accent-500/10 blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 left-[10%] w-64 h-64 rounded-full bg-violet-400/12 dark:bg-violet-500/8 blur-3xl animate-blob animation-delay-4000" />

      <div className="absolute inset-0 bg-edu-dots opacity-30 dark:opacity-15" />

      {!reduceMotion && (
        <div className="absolute bottom-0 left-0 right-0 h-20 opacity-30 dark:opacity-20">
          <div className="absolute inset-x-0 bottom-0 h-full bg-edu-wave animate-wave-drift" />
        </div>
      )}
    </div>
  );
};

export default HeroDecor;
