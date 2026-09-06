import { motion, useReducedMotion } from "framer-motion";
import {
  FiBookOpen,
  FiVideo,
  FiAward,
  FiCalendar,
  FiMessageCircle,
  FiUsers,
} from "react-icons/fi";
import { staggerContainer, staggerItem } from "../../utils/motion";

const featurePills = [
  { Icon: FiVideo, label: "Live classes" },
  { Icon: FiAward, label: "Hackathons" },
  { Icon: FiUsers, label: "Expert mentors" },
  { Icon: FiMessageCircle, label: "Tutor chat" },
];

const HeroShowcase = ({ counts }) => {
  const reduceMotion = useReducedMotion();
  const workshops = counts?.workshops ?? 0;
  const hackathons = counts?.hackathons ?? 0;

  return (
    <div className="relative w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
      <div
        className="absolute -inset-3 rounded-3xl bg-brand-400/12 dark:bg-brand-500/8 blur-2xl pointer-events-none"
        aria-hidden
      />

      <motion.div
        className="relative glass-card p-6 sm:p-8 shadow-brand-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        {...(reduceMotion ? {} : { whileHover: { y: -3, transition: { duration: 0.25 } } })}
      >
        <p className="text-sm font-semibold text-brand-600 mb-4">On IndLearn now</p>

        <motion.div
          className="flex flex-wrap justify-center gap-3 sm:gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={staggerItem}
            className="p-4 rounded-xl bg-brand-500/10 border border-brand-200/30 w-[calc(50%-0.375rem)] min-w-[130px] max-w-[170px]"
          >
            <FiBookOpen className="text-brand-600 mb-2" size={20} />
            <p className="font-bold text-2xl tabular-nums">{counts?.courses ?? "—"}</p>
            <p className="text-xs text-slate-500">Courses</p>
          </motion.div>

          {workshops > 0 && (
            <motion.div
              variants={staggerItem}
              className="p-4 rounded-xl bg-accent-500/10 border border-brand-200/30 w-[calc(50%-0.375rem)] min-w-[130px] max-w-[170px]"
            >
              <FiCalendar className="text-accent-600 mb-2" size={20} />
              <p className="font-bold text-2xl tabular-nums">{workshops}</p>
              <p className="text-xs text-slate-500">Workshops</p>
            </motion.div>
          )}

          {hackathons > 0 && (
            <motion.div
              variants={staggerItem}
              className="p-4 rounded-xl bg-violet-500/10 border border-brand-200/30 w-[calc(50%-0.375rem)] min-w-[130px] max-w-[170px]"
            >
              <FiAward className="text-violet-600 mb-2" size={20} />
              <p className="font-bold text-2xl tabular-nums">{hackathons}</p>
              <p className="text-xs text-slate-500">Hackathons</p>
            </motion.div>
          )}

          <motion.div
            variants={staggerItem}
            className="p-4 rounded-xl bg-brand-500/10 border border-brand-200/30 w-[calc(50%-0.375rem)] min-w-[130px] max-w-[170px]"
          >
            <FiVideo className="text-brand-600 mb-2" size={20} />
            <p className="font-bold text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
              Live & chat
            </p>
            <p className="text-xs text-slate-500 mt-1">Video + messaging</p>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        className="flex flex-wrap justify-center gap-2 mt-4 px-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.4 }}
      >
        {featurePills.map(({ Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/90 dark:bg-slate-900/70 border border-brand-100 dark:border-brand-800 text-slate-600 dark:text-slate-300"
          >
            <Icon size={13} className="text-brand-500 shrink-0" />
            {label}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default HeroShowcase;
