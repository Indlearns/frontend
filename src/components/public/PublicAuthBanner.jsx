import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../common/Button";
import { ROLES } from "../../utils/constants";

/**
 * Contextual CTA — works logged in or out
 */
const PublicAuthBanner = ({ message }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-brand-200">
        <p className="text-slate-700 dark:text-slate-300">
          {message || "Sign in or create a free student account to enroll and access live classes."}
        </p>
        <div className="flex gap-2 shrink-0">
          <Link to="/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link to="/register">
            <Button>Get started</Button>
          </Link>
        </div>
      </div>
    );
  }

  const dash =
    user?.role === ROLES.TUTOR
      ? "/tutor"
      : user?.role === ROLES.STUDENT
        ? "/student"
        : null;

  return (
    <div className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-brand-200">
      <p className="text-slate-700 dark:text-slate-300">
        You are logged in as <strong>{user?.name}</strong> ({user?.role}).{" "}
        {dash
          ? "Open your dashboard for classes, assignments, and chat."
          : "Staff accounts use the admin portal."}
      </p>
      {dash && (
        <Link to={dash}>
          <Button>Go to dashboard</Button>
        </Link>
      )}
    </div>
  );
};

export default PublicAuthBanner;
