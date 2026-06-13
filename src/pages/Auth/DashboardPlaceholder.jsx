import { useAuth } from "../../contexts/AuthContext";
import { ROLE_LABELS } from "../../utils/constants";
import Button from "../../components/common/Button";

/**
 * Placeholder dashboards for Admin, Tutor, Student
 * Full dashboards will be built in Phase 2+
 */
const DashboardPlaceholder = ({ role }) => {
  const { user, logout } = useAuth();

  return (
    <div className="section-container py-16">
      <div className="glass-card p-8 lg:p-12 max-w-2xl mx-auto text-center">
        <span className="inline-block px-4 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-sm font-medium mb-4">
          {ROLE_LABELS[role]} Dashboard
        </span>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          Hello, {user?.name}!
        </h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          Your {ROLE_LABELS[role].toLowerCase()} dashboard will be built in Phase 2.
          Authentication and role-based routing are working correctly.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Role: <strong>{user?.role}</strong> | Email: {user?.email}
        </p>
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            Back to Home
          </Button>
          <Button variant="ghost" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPlaceholder;
