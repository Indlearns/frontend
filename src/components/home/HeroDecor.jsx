import { FiBookOpen, FiAward, FiVideo, FiUsers } from "react-icons/fi";
import { useReducedMotion } from "framer-motion";

const icons = [
  { Icon: FiBookOpen, className: "top-[12%] right-[8%] text-brand-400/40", delay: "0s" },
  { Icon: FiVideo, className: "top-[45%] right-[18%] text-accent-400/35", delay: "1.2s" },
  { Icon: FiAward, className: "bottom-[20%] right-[6%] text-violet-400/35", delay: "0.6s" },
  { Icon: FiUsers, className: "top-[28%] right-[28%] text-brand-500/30", delay: "1.8s" },
];

const HeroDecor = () => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-brand-300/20 dark:bg-brand-500/10 blur-3xl animate-blob" />
      <div className="absolute top-1/3 -right-16 w-64 h-64 rounded-full bg-accent-300/15 dark:bg-accent-500/10 blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 left-1/4 w-56 h-56 rounded-full bg-violet-300/15 dark:bg-violet-500/10 blur-3xl animate-blob animation-delay-4000" />

      {!reduceMotion &&
        icons.map(({ Icon, className, delay }) => (
          <div
            key={className}
            className={`absolute hidden lg:flex items-center justify-center w-14 h-14 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/50 dark:border-white/10 shadow-sm animate-float-gentle ${className}`}
            style={{ animationDelay: delay }}
          >
            <Icon size={26} />
          </div>
        ))}
    </div>
  );
};

export default HeroDecor;
