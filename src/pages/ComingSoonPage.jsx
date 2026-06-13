import { Link } from "react-router-dom";
import Button from "../components/common/Button";

/**
 * Placeholder for routes not yet built (Courses, Workshops, etc.)
 */
const ComingSoonPage = ({ title = "This Page" }) => (
  <div className="section-container py-24 text-center">
    <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
      {title}
    </h1>
    <p className="mt-4 text-slate-600 dark:text-slate-400">
      Coming in Phase 2 — stay tuned!
    </p>
    <Link to="/" className="inline-block mt-8">
      <Button variant="outline">Back to Home</Button>
    </Link>
  </div>
);

export default ComingSoonPage;
