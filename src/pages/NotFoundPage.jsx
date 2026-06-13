import { Link } from "react-router-dom";
import Button from "../components/common/Button";

const NotFoundPage = () => (
  <div className="section-container py-24 text-center">
    <h1 className="font-display text-6xl font-bold text-brand-600">404</h1>
    <p className="mt-4 text-xl text-slate-600 dark:text-slate-400">Page not found</p>
    <Link to="/" className="inline-block mt-8">
      <Button>Go Home</Button>
    </Link>
  </div>
);

export default NotFoundPage;
