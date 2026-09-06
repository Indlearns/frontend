import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { publicService } from "../../services/publicService";
import { CourseCard, EmptyState } from "../../components/public/ContentCards";
import { Link } from "react-router-dom";
import ScrollReveal from "../../components/common/ScrollReveal";
import { staggerContainer, staggerItem } from "../../utils/motion";

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
      <ScrollReveal className="max-w-3xl mb-8">
        <h1 className="font-display text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
          Courses
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">
          Open courses from IndLearn. Tap a course or Enroll now to see full details, then pay with Zoho Payments.
        </p>
        <p className="mt-4">
          <Link to="/login" className="text-brand-600 font-medium hover:underline">
            Sign in as a student to purchase →
          </Link>
        </p>
      </ScrollReveal>

      {categories.length > 1 && (
        <ScrollReveal delay={1} className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={() => setCategory("")}
            className={`px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
              !category ? "bg-brand-500 text-white shadow-brand" : "bg-slate-100 dark:bg-slate-800 hover:bg-brand-50"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
                category === cat ? "bg-brand-500 text-white shadow-brand" : "bg-slate-100 dark:bg-slate-800 hover:bg-brand-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </ScrollReveal>
      )}

      {loading ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-slate-500"
        >
          Loading courses...
        </motion.p>
      ) : (
        <motion.div
          key={category || "all"}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {courses.map((c) => (
            <motion.div key={c._id} variants={staggerItem}>
              <CourseCard course={c} />
            </motion.div>
          ))}
          {!courses.length && (
            <EmptyState
              title="No open courses yet"
              hint="We are preparing new courses. Please check back soon."
            />
          )}
        </motion.div>
      )}
    </div>
  );
};

export default CoursesPage;
