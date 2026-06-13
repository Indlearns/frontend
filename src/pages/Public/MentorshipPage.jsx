import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ROLES } from "../../utils/constants";
import { FiMessageCircle, FiVideo, FiUsers } from "react-icons/fi";

const MentorshipPage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="section-container py-12">
      <h1 className="font-display text-3xl lg:text-4xl font-bold">Mentorship</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-2xl">
        Get guidance from expert tutors through doubt sessions, chat, and video calls — built into
        IndLearn.
      </p>

      <div className="grid sm:grid-cols-3 gap-6 mt-10 mb-10">
        {[
          {
            icon: FiMessageCircle,
            title: "Chat with tutors",
            text: "Message your assigned tutor for doubts and coursework help.",
          },
          {
            icon: FiVideo,
            title: "Video doubt sessions",
            text: "Request a session and join a Jitsi room when your tutor accepts.",
          },
          {
            icon: FiUsers,
            title: "Batch community",
            text: "Learn alongside peers in batch group chats.",
          },
        ].map((item) => (
          <div key={item.title} className="glass-card p-6">
            <item.icon className="text-brand-600 mb-3" size={28} />
            <h2 className="font-bold">{item.title}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{item.text}</p>
          </div>
        ))}
      </div>

      {isAuthenticated && user?.role === ROLES.STUDENT && (
        <Link
          to="/student/meetings"
          className="inline-block mt-6 text-brand-600 font-medium hover:underline"
        >
          Request tutor session →
        </Link>
      )}
    </div>
  );
};

export default MentorshipPage;
