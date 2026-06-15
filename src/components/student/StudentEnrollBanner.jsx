import { Link } from "react-router-dom";
import { useStudentEnrollment } from "../../hooks/useStudentEnrollment";
import Button from "../common/Button";

/** Compact notice for logged-in students on public pages */
const StudentEnrollBanner = () => {
  const { isStudent, enrolled, loading } = useStudentEnrollment();

  if (loading || !isStudent || enrolled) return null;

  return (
    <div className="section-container py-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-brand-200 bg-white/80 dark:bg-slate-900/80 px-4 py-3">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Welcome back! Explore courses and workshops to start learning.
        </p>
        <Link to="/courses" className="shrink-0">
          <Button type="button" className="w-full sm:w-auto">
            Explore courses
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default StudentEnrollBanner;
