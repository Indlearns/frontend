import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { tutorService } from "../../services/tutorService";
import Button from "../../components/common/Button";

const TutorOverviewPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    tutorService.getDashboard().then((r) => {
      if (r.success) setStats(r.data);
    });
  }, []);

  const cards = [
    { label: "My batches", value: stats?.batches ?? "—", to: "/tutor/batches" },
    { label: "Upcoming classes", value: stats?.upcomingClasses ?? "—", to: "/tutor/classes" },
    { label: "Assignments", value: stats?.assignments ?? "—", to: "/tutor/assignments" },
    { label: "Pending requests", value: stats?.pendingMeetings ?? "—", to: "/tutor/meetings" },
    { label: "To grade", value: stats?.submissionsToGrade ?? "—", to: "/tutor/assignments" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Tutor dashboard</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        Join admin-scheduled classes, post assignments, grade work, and respond to student doubt or
        meeting requests.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="glass-card p-5 hover:border-brand-400 transition-colors"
          >
            <p className="text-3xl font-bold text-brand-600">{c.value}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{c.label}</p>
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Link to="/tutor/classes">
          <Button>Join live class</Button>
        </Link>
        <Link to="/tutor/assignments">
          <Button variant="outline">Manage assignments</Button>
        </Link>
        <Link to="/tutor/chat">
          <Button variant="outline">Messages & video</Button>
        </Link>
      </div>
    </div>
  );
};

export default TutorOverviewPage;
