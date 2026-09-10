import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiBookOpen, FiUsers, FiVideo, FiAward } from "react-icons/fi";
import Button from "../../components/common/Button";
import ScrollReveal from "../../components/common/ScrollReveal";
import { CONTACT } from "../../utils/constants";
import { staggerContainer, staggerItem } from "../../utils/motion";

const highlights = [
  {
    icon: FiBookOpen,
    title: "Structured learning",
    text: "Courses designed with clear paths from fundamentals to job-ready skills.",
  },
  {
    icon: FiVideo,
    title: "Live classes",
    text: "Interactive sessions with tutors, doubt clearing, and built-in video rooms.",
  },
  {
    icon: FiUsers,
    title: "Mentorship & community",
    text: "Batch chats, peer learning, and direct access to tutors when you need help.",
  },
  {
    icon: FiAward,
    title: "Progress & career",
    text: "Track assignments, build your resume from progress, and explore matched opportunities.",
  },
];

const AboutPage = () => (
  <div className="section-container py-12 lg:py-20">
    <ScrollReveal className="max-w-3xl">
      <p className="text-sm font-medium text-brand-600 mb-2">About INDLearns</p>
      <h1 className="font-display text-3xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
        Education that prepares you for the real world
      </h1>
      <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
        INDLearns is an EdTech platform built to help learners grow through live teaching,
        hands-on assignments, and mentorship — not just recorded videos. We connect students,
        expert tutors, and institutions on one trusted learning system.
      </p>
    </ScrollReveal>

    <motion.div
      className="mt-12 grid sm:grid-cols-2 gap-6"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
    >
      {highlights.map((item) => (
        <motion.div key={item.title} variants={staggerItem} className="glass-card p-6 group">
          <item.icon className="text-brand-600 mb-3 group-hover:scale-110 transition-transform duration-300" size={28} />
          <h2 className="font-bold text-lg">{item.title}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            {item.text}
          </p>
        </motion.div>
      ))}
    </motion.div>

    <ScrollReveal className="glass-card p-8 lg:p-10 mt-12 max-w-3xl">
      <h2 className="font-display text-2xl font-bold mb-4">Our mission</h2>
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
        We believe quality education should be accessible, measurable, and connected to
        careers. INDLearns gives every learner a clear place to study, collaborate, and
        demonstrate progress — while giving tutors and administrators the tools to run batches,
        live classes, and assessments at scale.
      </p>
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
        Whether you are starting a new skill, preparing for placements, or upskilling for your
        next role, we are here to guide you with structured programs and human support.
      </p>
    </ScrollReveal>

    <ScrollReveal className="mt-12 max-w-3xl">
      <h2 className="font-display text-2xl font-bold mb-4">Get in touch</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Questions about courses, partnerships, or batches? Reach us anytime.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link to="/contact">
          <Button>Contact us</Button>
        </Link>
        <Link to="/courses">
          <Button variant="outline">Browse courses</Button>
        </Link>
      </div>
      <p className="text-sm text-slate-500 mt-6 space-y-1">
        <span className="block">
          Email:{" "}
          <a href={`mailto:${CONTACT.email}`} className="text-brand-600 hover:underline">
            {CONTACT.email}
          </a>
        </span>
        <span className="block">
          Phone:{" "}
          <a href={`tel:${CONTACT.phoneTel}`} className="text-brand-600 hover:underline">
            {CONTACT.phoneDisplay}
          </a>
        </span>
      </p>
    </ScrollReveal>
  </div>
);

export default AboutPage;
