import { useEffect, useState } from "react";
import { publicService } from "../../services/publicService";
import { CourseCard, EmptyState } from "../../components/public/ContentCards";
import { Link } from "react-router-dom";

const CoursesPage = () => {
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");

  useEffect(() => {
    setLoading(true);
    publicService
      .getCourses()
      .then((r) => {
        if (r.success) setAllCourses(r.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(allCourses.map((c) => c.category).filter(Boolean))];
  const courses = category
    ? allCourses.filter((c) => c.category === category)
    : allCourses;

  return (
    <div className="section-container py-12">
      <div className="max-w-3xl mb-8">
        <h1 className="font-display text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
          Courses
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">
          Open courses from IndLearn. Tap a course or Enroll now to see full details, then pay with PayPal.
        </p>
        <p className="mt-4">
          <Link to="/login" className="text-brand-600 font-medium hover:underline">
            Sign in as a student to purchase →
          </Link>
        </p>
      </div>

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={() => setCategory("")}
            className={`px-4 py-2 rounded-xl text-sm ${
              !category ? "bg-brand-500 text-white" : "bg-slate-100 dark:bg-slate-800"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm ${
                category === cat ? "bg-brand-500 text-white" : "bg-slate-100 dark:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">Loading courses...</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <CourseCard key={c._id} course={c} />
          ))}
          {!courses.length && (
            <EmptyState
              title="No open courses yet"
              hint="We are preparing new courses. Please check back soon."
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
