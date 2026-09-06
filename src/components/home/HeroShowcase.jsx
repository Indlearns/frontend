import { motion, useReducedMotion } from "framer-motion";
import {
  FiBookOpen,
  FiVideo,
  FiAward,
  FiUsers,
  FiCalendar,
  FiMessageCircle,
} from "react-icons/fi";

const orbitBadges = [
  { Icon: FiVideo, label: "Live class", tone: "text-accent-600 bg-accent-500/15 border-accent-200/50" },
  { Icon: FiAward, label: "Hackathons", tone: "text-violet-600 bg-violet-500/15 border-violet-200/50" },
  { Icon: FiUsers, label: "Mentors", tone: "text-brand-700 bg-brand-500/15 border-brand-200/50" },
  { Icon: FiMessageCircle, label: "Chat", tone: "text-sky-600 bg-sky-500/15 border-sky-200/50" },
];

const HeroShowcase = ({ counts }) => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative w-full max-w-[480px] mx-auto lg:mx-0 lg:ml-auto min-h-[340px] sm:min-h-[380px] lg:min-h-[420px]">
      {/* Glow behind hub */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-brand-400/25 dark:bg-brand-500/15 blur-3xl animate-hero-glow" />

      {/* Rotating dashed ring */}
      {!reduceMotion && (
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-full border-2 border-dashed border-brand-400/35 dark:border-brand-500/25"
          animate={{ rotate: 360 }}
          transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Orbiting badges — rotate as a ring, labels stay upright */}
      {!reduceMotion && (
        <motion.div
          className="absolute top-1/2 left-1/2 w-0 h-0 z-[5]"
          animate={{ rotate: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        >
          {orbitBadges.map(({ Icon, label, tone }, i) => (
            <div
              key={label}
              className="absolute left-0 top-0"
              style={{
                transform: `rotate(${i * 90}deg) translateX(125px) rotate(${-i * 90}deg)`,
              }}
            >
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border shadow-md backdrop-blur-sm whitespace-nowrap ${tone}`}
              >
                <Icon size={16} />
                <span className="text-xs font-semibold">{label}</span>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Center hub */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
        animate={reduceMotion ? {} : { y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-brand-gradient shadow-brand-lg flex flex-col items-center justify-center text-white">
          <FiBookOpen size={36} className="mb-1" />
          <span className="text-xs font-bold tracking-wide">IndLearn</span>
          {!reduceMotion && (
            <span className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping-slow opacity-60" />
          )}
        </div>
      </motion.div>

      {/* Stats card — floats below hub */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 glass-card p-5 sm:p-6 shadow-brand-lg border-brand-200/50 dark:border-brand-700/40"
        initial={{ opacity: 0, y: 24 }}
        animate={
          reduceMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 1, y: [0, -6, 0] }
        }
        transition={
          reduceMotion
            ? { delay: 0.35, duration: 0.6 }
            : {
                opacity: { delay: 0.35, duration: 0.6 },
                y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 },
              }
        }
      >
        <p className="text-sm font-semibold text-brand-600 mb-3">On IndLearn now</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-200/30">
            <FiBookOpen className="text-brand-600 mb-1" size={18} />
            <p className="font-bold text-xl tabular-nums">{counts?.courses ?? "—"}</p>
            <p className="text-xs text-slate-500">Courses</p>
          </div>
          <div className="p-3 rounded-xl bg-accent-500/10 border border-brand-200/30">
            <FiCalendar className="text-accent-600 mb-1" size={18} />
            <p className="font-bold text-xl tabular-nums">{counts?.workshops ?? counts?.hackathons ?? "—"}</p>
            <p className="text-xs text-slate-500">Events</p>
          </div>
          <div className="col-span-2 p-3 rounded-xl bg-violet-500/10 border border-brand-200/30 flex items-center gap-3">
            <FiVideo className="text-violet-600 shrink-0" size={20} />
            <div>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Live classes & chat</p>
              <p className="text-xs text-slate-500">Learn with mentors in real time</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroShowcase;
