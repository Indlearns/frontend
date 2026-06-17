import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiBookOpen,
  FiUsers,
  FiVideo,
  FiAward,
  FiMessageCircle,
  FiCalendar,
  FiArrowRight,
  FiCheckCircle,
} from "react-icons/fi";
import Button from "../../components/common/Button";
import { FEATURES, STATS, APP_TAGLINE, ROLES } from "../../utils/constants";
import { publicService } from "../../services/publicService";
import { CourseCard, WorkshopCard, EmptyState } from "../../components/public/ContentCards";
import { useAuth } from "../../contexts/AuthContext";
import { buildHomeEventPayload } from "../../utils/eventPaths";

const iconMap = {
  live: FiVideo,
  project: FiBookOpen,
  assessment: FiAward,
  community: FiUsers,
  mentor: FiMessageCircle,
  event: FiCalendar,
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const HomePage = () => {
  const [home, setHome] = useState(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [homeRes, workshopRes, hackathonRes] = await Promise.all([
        publicService.getHome(),
        publicService.getWorkshops("workshop"),
        publicService.getWorkshops("hackathon"),
      ]);

      if (cancelled || !homeRes.success) return;

      const events = buildHomeEventPayload(homeRes.data, workshopRes, hackathonRes);
      setHome({ ...homeRes.data, ...events });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const homeWorkshops = home?.workshops ?? [];
  const homeHackathons = home?.hackathons ?? [];

  const counts = home?.counts;
  const dynamicStats = counts
    ? [
        { value: `${counts.courses}+`, label: "Open courses" },
        { value: `${counts.workshops ?? 0}+`, label: "Workshops" },
        { value: `${counts.hackathons ?? 0}+`, label: "Hackathons" },
        { value: "24/7", label: "Learning support" },
      ]
    : STATS;

  const dashPath =
    user?.role === ROLES.TUTOR
      ? "/tutor"
      : user?.role === ROLES.STUDENT
        ? "/student"
        : null;

  return (
    <div>
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-hero-gradient dark:bg-none">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/50 to-transparent dark:from-brand-950/30 pointer-events-none" />
        <div className="section-container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-sm font-medium mb-6">
                <FiCheckCircle /> Learn with live classes & expert tutors
              </span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-950 dark:text-white leading-tight">
                Build Your Future with{" "}
                <span className="text-brand-gradient">World-Class Learning</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                {APP_TAGLINE}. Explore open courses and upcoming workshops — no login required to
                browse. Sign in to enroll via PayPal, join live classes, and chat with tutors.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/courses">
                  <Button>
                    Explore Courses <FiArrowRight />
                  </Button>
                </Link>
                {isAuthenticated && dashPath && (user?.role === ROLES.TUTOR || user?.role === ROLES.STUDENT) ? (
                  <Link to={user?.role === ROLES.STUDENT ? "/courses" : dashPath}>
                    <Button variant="outline">
                      {user?.role === ROLES.STUDENT ? "Browse & pay for courses" : "Dashboard"}
                    </Button>
                  </Link>
                ) : !isAuthenticated ? (
                  <>
                    <Link to="/login">
                      <Button variant="outline">Sign in</Button>
                    </Link>
                    <Link to="/register">
                      <Button variant="ghost">Join free</Button>
                    </Link>
                  </>
                ) : null}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="glass-card p-8">
                <p className="text-sm font-semibold text-brand-600 mb-4">On IndLearn now</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-200/30">
                    <FiBookOpen className="text-brand-600 mb-2" />
                    <p className="font-bold text-2xl">{counts?.courses ?? "—"}</p>
                    <p className="text-xs text-slate-500">Courses</p>
                  </div>
                  <div className="p-4 rounded-xl bg-accent-500/10 border border-brand-200/30">
                    <FiCalendar className="text-accent-600 mb-2" />
                    <p className="font-bold text-2xl">{counts?.workshops ?? 0}</p>
                    <p className="text-xs text-slate-500">Workshops</p>
                  </div>
                  <div className="p-4 rounded-xl bg-violet-500/10 border border-brand-200/30">
                    <FiAward className="text-violet-600 mb-2" />
                    <p className="font-bold text-2xl">{counts?.hackathons ?? 0}</p>
                    <p className="text-xs text-slate-500">Hackathons</p>
                  </div>
                  <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-200/30">
                    <FiVideo className="text-brand-600 mb-2" />
                    <p className="font-bold text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Live & chat
                    </p>
                    <p className="text-xs text-slate-500">Built-in video + messaging</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white dark:bg-[#0F2340]/50 border-y border-brand-100 dark:border-brand-900/50">
        <div className="section-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {dynamicStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center"
              >
                <p className="font-display text-3xl lg:text-4xl font-bold text-brand-500 dark:text-brand-400">
                  {stat.value}
                </p>
                <p className="text-slate-600 dark:text-slate-400 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured open courses */}
      <section className="py-16 lg:py-20">
        <div className="section-container">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="section-title text-slate-900 dark:text-white">Featured courses</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Open courses — browse without login
              </p>
            </div>
            <Link to="/courses" className="text-brand-600 font-medium text-sm flex items-center gap-1">
              View all <FiArrowRight />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {home?.courses?.map((c) => (
              <CourseCard key={c._id} course={c} compact />
            ))}
            {!home?.courses?.length && (
              <EmptyState
                title="Courses coming soon"
                hint="New open courses will appear here soon. Check back later."
              />
            )}
          </div>
        </div>
      </section>

      {/* Workshops — workshops only */}
      <section className="py-16 bg-slate-50/80 dark:bg-slate-900/30">
        <div className="section-container">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="section-title text-slate-900 dark:text-white">Upcoming workshops</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Hands-on learning sessions — separate from hackathons
              </p>
            </div>
            <Link to="/workshops" className="text-brand-600 font-medium text-sm flex items-center gap-1">
              View all workshops <FiArrowRight />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {homeWorkshops.map((w) => (
              <WorkshopCard key={w._id} workshop={w} compact />
            ))}
            {!homeWorkshops.length && (
              <EmptyState
                title="No workshops scheduled"
                hint="New workshops will be listed here soon."
              />
            )}
          </div>
        </div>
      </section>

      {/* Hackathons */}
      <section className="py-16">
        <div className="section-container">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="section-title text-slate-900 dark:text-white">Upcoming hackathons</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Competitive coding events and challenges
              </p>
            </div>
            <Link to="/events" className="text-brand-600 font-medium text-sm flex items-center gap-1">
              View all hackathons <FiArrowRight />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {homeHackathons.map((w) => (
              <WorkshopCard key={w._id} workshop={w} compact />
            ))}
            {!homeHackathons.length && (
              <EmptyState
                title="No hackathons scheduled"
                hint="New hackathons will be listed here soon."
              />
            )}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="section-title text-slate-900 dark:text-white">
              Everything You Need to Succeed
            </h2>
            <p className="section-subtitle mt-4 mx-auto">
              A complete learning ecosystem — from live classes to career mentorship.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {FEATURES.map((feature, i) => {
              const Icon = iconMap[feature.icon] || FiBookOpen;
              return (
                <motion.div
                  key={feature.title}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="glass-card p-6 lg:p-8 hover:shadow-xl transition-shadow group"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="text-brand-600 dark:text-brand-400" size={24} />
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-brand-gradient p-10 lg:p-16 text-center text-white shadow-brand-lg"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold relative">
              Ready to Transform Your Career?
            </h2>
            <p className="mt-4 text-brand-100 max-w-xl mx-auto relative">
              Browse courses and workshops anytime. Students get live classes, assignments, and
              career tools after batch enrollment.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8 relative">
              <Link to="/courses">
                <span className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold bg-white text-brand-700 hover:bg-brand-50">
                  View courses <FiArrowRight />
                </span>
              </Link>
              {isAuthenticated && dashPath && (
                <Link to={dashPath}>
                  <span className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold border-2 border-white/80 text-white hover:bg-white/10">
                    Dashboard
                  </span>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
