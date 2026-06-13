import { Link } from "react-router-dom";
import { FiBookOpen, FiUsers, FiVideo, FiAward } from "react-icons/fi";
import Button from "../../components/common/Button";

const highlights = [
  {
    icon: FiBookOpen,
    title: "Structured learning",
    text: "Courses designed with clear paths from fundamentals to job-ready skills.",
  },
  {
    icon: FiVideo,
    title: "Live classes",
    text: "Interactive sessions with tutors, doubt clearing, and Jitsi-powered video rooms.",
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
    <div className="max-w-3xl">
      <p className="text-sm font-medium text-brand-600 mb-2">About INDLearns</p>
      <h1 className="font-display text-3xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
        Education that prepares you for the real world
      </h1>
      <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
        INDLearns is an EdTech platform built to help learners grow through live teaching,
        hands-on assignments, and mentorship — not just recorded videos. We connect students,
        expert tutors, and institutions on one trusted learning system.
      </p>
    </div>

    <div className="mt-12 grid sm:grid-cols-2 gap-6">
      {highlights.map((item) => (
        <div key={item.title} className="glass-card p-6">
          <item.icon className="text-brand-600 mb-3" size={28} />
          <h2 className="font-bold text-lg">{item.title}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            {item.text}
          </p>
        </div>
      ))}
    </div>

    <div className="glass-card p-8 lg:p-10 mt-12 max-w-3xl">
      <h2 className="font-display text-2xl font-bold mb-4">Our mission</h2>
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
        We believe quality education should be accessible, measurable, and connected to
        careers. INDLearns gives every learner a clear place to study, collaborate, and
        demonstrate progress — while giving tutors and administrators the tools to run batches,
        schedules, and assessments professionally.
      </p>
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
        Whether you are exploring courses for the first time or enrolled in a live batch,
        we are here to support your journey with transparency, secure payments, and a
        platform you can trust.
      </p>
    </div>

    <div className="mt-12 flex flex-wrap gap-4">
      <Link to="/courses">
        <Button>Explore courses</Button>
      </Link>
      <Link to="/contact">
        <Button variant="outline">Contact support</Button>
      </Link>
    </div>
  </div>
);

export default AboutPage;
