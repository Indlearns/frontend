import { FiBookOpen, FiAward, FiVideo, FiUsers } from "react-icons/fi";
import { useReducedMotion } from "framer-motion";

const icons = [
  { Icon: FiBookOpen, className: "top-[10%] right-[6%] text-brand-400/50", delay: "0s", size: 26 },
  { Icon: FiVideo, className: "top-[42%] right-[14%] text-accent-400/45", delay: "1.4s", size: 24 },
  { Icon: FiAward, className: "bottom-[18%] right-[4%] text-violet-400/45", delay: "0.7s", size: 24 },
  { Icon: FiUsers, className: "top-[24%] right-[24%] text-brand-500/40", delay: "2s", size: 22 },
];

const HeroDecor = () => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Soft gradient mesh */}
      <div className="absolute inset-0 bg-edu-mesh opacity-70 dark:opacity-40" />

      {/* Drifting color blobs */}
      <div className="absolute -top-28 -left-28 w-80 h-80 rounded-full bg-brand-300/25 dark:bg-brand-500/12 blur-3xl animate-blob" />
      <div className="absolute top-1/4 -right-20 w-72 h-72 rounded-full bg-accent-300/20 dark:bg-accent-500/10 blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-10%] left-[20%] w-64 h-64 rounded-full bg-violet-300/20 dark:bg-violet-500/10 blur-3xl animate-blob animation-delay-4000" />
      <div className="absolute top-[55%] left-[8%] w-48 h-48 rounded-full bg-sky-300/15 dark:bg-sky-500/8 blur-3xl animate-blob animation-delay-6000" />

      {/* Subtle dot grid */}
      <div className="absolute inset-0 bg-edu-dots opacity-[0.35] dark:opacity-[0.15]" />

      {/* Floating education icons */}
      {!reduceMotion &&
        icons.map(({ Icon, className, delay, size }) => (
          <div
            key={className}
            className={`absolute hidden lg:flex items-center justify-center w-14 h-14 rounded-2xl bg-white/70 dark:bg-white/5 border border-white/60 dark:border-white/10 shadow-sm backdrop-blur-sm animate-float-gentle ${className}`}
            style={{ animationDelay: delay }}
          >
            <Icon size={size} />
          </div>
        ))}

      {/* Gentle wave at bottom */}
      {!reduceMotion && (
        <div className="absolute bottom-0 left-0 right-0 h-24 opacity-40 dark:opacity-25">
          <div className="absolute inset-x-0 bottom-0 h-full bg-edu-wave animate-wave-drift" />
        </div>
      )}
    </div>
  );
};

export default HeroDecor;
