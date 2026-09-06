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
  FiUser,
  FiShield,
} from "react-icons/fi";
import Button from "../../components/common/Button";
import ScrollReveal from "../../components/common/ScrollReveal";
import AnimatedCounter from "../../components/common/AnimatedCounter";
import HeroDecor from "../../components/home/HeroDecor";
import HeroShowcase from "../../components/home/HeroShowcase";
import SectionBackground from "../../components/common/SectionBackground";
import { FEATURES, APP_TAGLINE, ROLES } from "../../utils/constants";
import { fadeUp, staggerContainer, staggerItem, viewportOnce } from "../../utils/motion";
import { publicService } from "../../services/publicService";
import { CourseCard, WorkshopCard, EmptyState } from "../../components/public/ContentCards";
import LearnersWorkAtMarquee from "../../components/public/LearnersWorkAtMarquee";
import { useAuth } from "../../contexts/AuthContext";
import { buildHomeEventPayload } from "../../utils/eventPaths";
import { getImageUrl } from "../../utils/media";

const iconMap = {
  live: FiVideo,
  project: FiBookOpen,
  assessment: FiAward,
  community: FiUsers,
  mentor: FiMessageCircle,
  event: FiCalendar,
};

const heroIntro = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const heroLine = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
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
  const tutorShowcase = home?.tutorShowcase ?? [];

  const counts = home?.counts;
  const statsReady = Boolean(counts);
  const dynamicStats = statsReady
    ? [
        { value: `${counts.courses}+`, label: "Open courses" },
        ...(counts.workshops > 0
          ? [{ value: `${counts.workshops}+`, label: "Workshops" }]
          : []),
        ...(counts.hackathons > 0
          ? [{ value: `${counts.hackathons}+`, label: "Hackathons" }]
          : []),
        { value: "24/7", label: "Learning support" },
      ]
    : [];

  const dashPath =
    user?.role === ROLES.TUTOR
      ? "/tutor"
      : user?.role === ROLES.STUDENT
        ? "/student"
        : null;

  return (
    <div>
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-hero-gradient dark:bg-brand-gradient-soft">
        <HeroDecor />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/40 to-transparent dark:from-brand-950/20 pointer-events-none" />
        <div className="section-container relative">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <motion.div variants={heroIntro} initial="hidden" animate="visible">
              <motion.span
                variants={heroLine}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100/90 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 text-sm font-medium mb-6 shadow-sm border border-brand-200/50 dark:border-brand-800/50"
              >
                <motion.span
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex"
                >
                  <FiCheckCircle />
                </motion.span>
                Learn with live classes & expert tutors
              </motion.span>
              <motion.h1
                variants={heroLine}
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-950 dark:text-white leading-tight"
              >
                Build Your Future with{" "}
                <span className="text-brand-gradient-animated">World-Class Learning</span>
              </motion.h1>
              <motion.p
                variants={heroLine}
                className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed"
              >
                {APP_TAGLINE}. Explore open courses and upcoming workshops — no login required to
                browse. Sign in to enroll via Zoho Payments, join live classes, and chat with tutors.
              </motion.p>
              <motion.div variants={heroLine} className="mt-8 flex flex-wrap gap-4">
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
              </motion.div>
              <motion.div
                variants={heroLine}
                className="mt-8 flex flex-wrap items-center gap-4 text-sm text-slate-500"
              >
                <span className="inline-flex items-center gap-1.5">
                  <FiShield className="text-brand-500" /> Secure payments
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FiVideo className="text-brand-500" /> Live mentor sessions
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FiUsers className="text-brand-500" /> Trusted by learners
                </span>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative mt-8 lg:mt-0 lg:pl-4"
            >
              <HeroShowcase counts={counts} />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-12 bg-white dark:bg-[#0F2340]/50 border-y border-brand-100 dark:border-brand-900/50 overflow-hidden">
        <SectionBackground variant="stats" />
        <div className="section-container relative">
          <div className="flex flex-wrap justify-center items-start gap-x-10 sm:gap-x-14 lg:gap-x-20 gap-y-8 min-h-[88px]">
            {!statsReady ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center min-w-[120px] animate-pulse">
                  <div className="h-10 w-16 bg-brand-100 dark:bg-brand-900/40 rounded-lg mx-auto" />
                  <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded mt-3 mx-auto" />
                </div>
              ))
            ) : (
              dynamicStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="text-center min-w-[120px] sm:min-w-[140px]"
                >
                  <p className="font-display text-3xl lg:text-4xl font-bold text-brand-500 dark:text-brand-400">
                    {stat.value === "24/7" ? (
                      stat.value
                    ) : (
                      <AnimatedCounter value={stat.value} />
                    )}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">{stat.label}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured open courses */}
      <section className="py-16 lg:py-20">
        <div className="section-container">
          <ScrollReveal className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="section-title text-slate-900 dark:text-white">Featured courses</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Open courses — browse without login
              </p>
            </div>
            <Link to="/courses" className="text-brand-600 font-medium text-sm flex items-center gap-1">
              View all <FiArrowRight />
            </Link>
          </ScrollReveal>
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            {home?.courses?.map((c) => (
              <motion.div key={c._id} variants={staggerItem}>
                <CourseCard course={c} compact />
              </motion.div>
            ))}
            {!home?.courses?.length && (
              <EmptyState
                title="Courses coming soon"
                hint="New open courses will appear here soon. Check back later."
              />
            )}
          </motion.div>
        </div>
      </section>

      {homeWorkshops.length > 0 && (
        <section className="relative py-16 bg-slate-50/80 dark:bg-slate-900/30 overflow-hidden">
          <SectionBackground variant="default" />
          <div className="section-container relative">
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
            </div>
          </div>
        </section>
      )}

      {homeHackathons.length > 0 && (
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
            </div>
          </div>
        </section>
      )}

      <LearnersWorkAtMarquee />

      {tutorShowcase.length > 0 && (
        <section className="py-16 lg:py-20 bg-slate-50/80 dark:bg-slate-900/30">
          <div className="section-container">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="section-title text-slate-900 dark:text-white">Meet our tutors</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-3">
                Learn from experienced mentors who guide students through live classes and real projects.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {tutorShowcase.map((tutor, i) => (
                <motion.article
                  key={tutor._id}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="glass-card p-6 lg:p-8 flex flex-col h-full text-center"
                >
                  <div className="flex flex-col items-center mb-5">
                    {tutor.imageUrl ? (
                      <img
                        src={getImageUrl(tutor.imageUrl)}
                        alt={tutor.name}
                        className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-brand-200 dark:border-brand-800 shadow-md"
                      />
                    ) : (
                      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-600 border-4 border-brand-200 dark:border-brand-800">
                        <FiUser size={40} />
                      </div>
                    )}
                    <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mt-4">
                      {tutor.name}
                    </h3>
                    <p className="text-sm text-brand-600 dark:text-brand-400">{tutor.experience}</p>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed flex-1 text-left sm:text-center">
                    <span className="text-brand-400 text-2xl leading-none align-top">“</span>
                    {tutor.description}
                    <span className="text-brand-400 text-2xl leading-none">”</span>
                  </p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative py-20 lg:py-28 overflow-hidden">
        <SectionBackground variant="features" />
        <div className="section-container relative">
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

      <section className="py-20 lg:py-28">
        <div className="section-container">
          <ScrollReveal>
            <motion.div
              whileInView={{ scale: [0.98, 1] }}
              viewport={viewportOnce}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-3xl bg-brand-gradient p-10 lg:p-16 text-center text-white shadow-brand-lg"
            >
              <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/20 blur-2xl animate-blob" />
                <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-white/15 blur-2xl animate-blob animation-delay-2000" />
              </div>
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
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
