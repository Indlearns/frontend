import { Link } from "react-router-dom";
import { useStudentEnrollment } from "../../hooks/useStudentEnrollment";
import Button from "../common/Button";

/** Shown on public pages for logged-in students who are not in a batch yet */
const StudentEnrollBanner = () => {
  const { isStudent, enrolled, loading } = useStudentEnrollment();

  if (loading || !isStudent || enrolled) return null;

  return (
    <div className="section-container py-4">
      <div className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-brand-200">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Signed in as a student. Browse courses and workshops — pay with Razorpay to enroll or
          register for events.
        </p>
        <Link to="/courses" className="shrink-0">
          <Button type="button">Browse courses</Button>
        </Link>
      </div>
    </div>
  );
};

export default StudentEnrollBanner;
