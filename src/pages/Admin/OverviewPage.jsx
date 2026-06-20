import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../../services/adminService";
import { useAuth } from "../../contexts/AuthContext";
import PageHeader from "../../components/admin/PageHeader";

const OverviewPage = () => {
  const { user, isSuperAdmin } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminService.getDashboard().then((r) => r.success && setStats(r.data.stats));
  }, []);

  const cards = [
    { label: "Courses", value: stats?.courses, to: "/admin/courses" },
    { label: "Batches", value: stats?.batches, to: "/admin/batches" },
    { label: "Tutors", value: stats?.tutors, to: "/admin/tutors" },
    { label: "Students", value: stats?.students, to: "/admin/students" },
    { label: "Workshops", value: stats?.workshops, to: "/admin/workshops" },
    { label: "Hackathons", value: stats?.hackathons, to: "/admin/workshops?tab=hackathon" },
    { label: "Partners", value: stats?.companies, to: "/admin/companies" },
    { label: "Upcoming Classes", value: stats?.upcomingClasses, to: "/admin/schedule" },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name}`}
        subtitle={
          isSuperAdmin
            ? "Full access — manage admins, tutors, courses, batches & more."
            : "Manage tutors, courses, batches, schedules, partners & chats."
        }
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="glass-card p-6 hover:shadow-lg transition-shadow"
          >
            <p className="text-3xl font-bold text-brand-500">{c.value ?? "—"}</p>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default OverviewPage;
