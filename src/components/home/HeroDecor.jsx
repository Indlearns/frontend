import { motion } from "framer-motion";
import { FiBookOpen, FiAward, FiVideo, FiUsers, FiStar } from "react-icons/fi";
import { useReducedMotion } from "framer-motion";

const floatingIcons = [
  { Icon: FiBookOpen, className: "top-[8%] left-[6%] text-brand-500", delay: 0, size: 22 },
  { Icon: FiVideo, className: "top-[20%] right-[8%] text-accent-500", delay: 1.2, size: 20 },
  { Icon: FiAward, className: "bottom-[28%] left-[10%] text-violet-500", delay: 0.6, size: 20 },
  { Icon: FiUsers, className: "bottom-[12%] right-[12%] text-brand-600", delay: 1.8, size: 20 },
  { Icon: FiStar, className: "top-[45%] left-[4%] text-amber-500", delay: 2.4, size: 16 },
];

const particles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${8 + (i * 7) % 85}%`,
  top: `${10 + (i * 11) % 75}%`,
  delay: `${i * 0.7}s`,
  size: i % 3 === 0 ? 6 : 4,
}));

const HeroDecor = () => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Animated gradient wash */}
      <div className="absolute inset-0 bg-edu-mesh opacity-90 dark:opacity-50 animate-mesh-shift" />

      {/* Large drifting blobs — more visible */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand-400/30 dark:bg-brand-500/18 blur-3xl animate-blob" />
      <div className="absolute top-[15%] -right-24 w-80 h-80 rounded-full bg-accent-400/25 dark:bg-accent-500/14 blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-5%] left-[15%] w-72 h-72 rounded-full bg-violet-400/22 dark:bg-violet-500/12 blur-3xl animate-blob animation-delay-4000" />
      <div className="absolute top-[50%] left-[5%] w-56 h-56 rounded-full bg-sky-400/20 dark:bg-sky-500/10 blur-3xl animate-blob animation-delay-6000" />

      {/* Dot grid */}
      <div className="absolute inset-0 bg-edu-dots opacity-50 dark:opacity-25" />

      {/* Floating particles */}
      {!reduceMotion &&
        particles.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full bg-brand-400/50 dark:bg-brand-300/30 animate-particle-float"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
            }}
          />
        ))}

      {/* Floating icon badges — visible on all screens */}
      {!reduceMotion &&
        floatingIcons.map(({ Icon, className, delay, size }) => (
          <motion.div
            key={className}
            className={`absolute flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/80 dark:bg-white/10 border border-white/70 dark:border-white/15 shadow-md backdrop-blur-sm ${className}`}
            animate={{ y: [0, -12, 0], rotate: [0, 4, -4, 0] }}
            transition={{ duration: 5 + delay, repeat: Infinity, ease: "easeInOut", delay }}
          >
            <Icon size={size} />
          </motion.div>
        ))}

      {/* Bottom wave */}
      {!reduceMotion && (
        <div className="absolute bottom-0 left-0 right-0 h-28 opacity-50 dark:opacity-30">
          <div className="absolute inset-x-0 bottom-0 h-full bg-edu-wave animate-wave-drift" />
        </div>
      )}
    </div>
  );
};

export default HeroDecor;
