import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/common/Button";
import { ROLE_LABELS, ROLES } from "../../utils/constants";

/** Regular admin — no team management, no forgot password */
const AdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="section-container py-16">
      <div className="glass-card p-8 lg:p-12 max-w-2xl mx-auto text-center">
        <span className="inline-block px-4 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 text-sm font-medium mb-4">
          {ROLE_LABELS[ROLES.ADMIN]} Dashboard
        </span>
        <h1 className="font-display text-3xl font-bold">Hello, {user?.name}</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          {user?.email}
        </p>
        <div className="mt-6 p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-left">
          <p>
            <strong>Password reset:</strong> Not available for staff. Contact super
            admin (official@indlearns.com) to reset your password.
          </p>
          <p className="mt-2">
            <strong>Forgot password:</strong> Only for students on the public login page.
          </p>
        </div>
        <div className="mt-8 flex gap-4 justify-center">
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Home
          </Button>
          <Button variant="ghost" onClick={logout}>Logout</Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
