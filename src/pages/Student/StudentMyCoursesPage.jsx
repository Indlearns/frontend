import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { studentService } from "../../services/studentService";
import { CourseCard, EmptyState } from "../../components/public/ContentCards";
import { publicService } from "../../services/publicService";
import { getImageUrl, formatPrice } from "../../utils/media";

const StudentMyCoursesPage = () => {
  const [batchEnrolled, setBatchEnrolled] = useState([]);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [browse, setBrowse] = useState([]);

  useEffect(() => {
    studentService.getMyCourses().then((r) => {
      if (r.success) {
        setBatchEnrolled(r.data || []);
        setPurchasedCourses(r.purchasedCourses || []);
      }
    });
    publicService.getCourses().then((r) => r.success && setBrowse(r.data));
  }, []);

  const enrolledIds = new Set([
    ...batchEnrolled.map((e) => String(e.batch?.course?._id || e.batch?.course)),
    ...purchasedCourses.map((p) => String(p.course?._id)),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">My courses</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        Courses you enrolled in via payment and live batch programs assigned by admin.
      </p>

      <h2 className="font-bold text-lg mb-4">Enrolled courses</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {purchasedCourses.map((p) => (
          <Link
            key={p.course._id}
            to={`/courses/${p.course._id}`}
            className="glass-card p-5 hover:border-brand-500 transition-colors block"
          >
            {p.course.thumbnail && (
              <img
                src={getImageUrl(p.course.thumbnail)}
                alt=""
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
            )}
            <h3 className="font-bold text-lg">{p.course.title}</h3>
            <p className="text-sm text-slate-500 mt-2 line-clamp-2">{p.course.description}</p>
            <p className="text-sm text-brand-600 font-medium mt-2">
              {formatPrice(p.course.price, p.course.currency)}
            </p>
            <p className="text-xs text-green-700 mt-2">Enrolled · Razorpay</p>
          </Link>
        ))}
        {batchEnrolled.map((e) => (
          <Link
            key={e.batch._id}
            to={`/student/courses/${e.batch._id}`}
            className="glass-card p-5 hover:border-brand-500 transition-colors block"
          >
            <p className="text-xs text-brand-600 font-medium mb-1">{e.batch.name}</p>
            <h3 className="font-bold text-lg">{e.batch.course?.title}</h3>
            <p className="text-sm text-slate-500 mt-2 line-clamp-2">
              {e.batch.course?.description}
            </p>
            <div className="mt-4">
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full"
                  style={{ width: `${e.progress?.overallPercent || 0}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {e.progress?.overallPercent || 0}% complete · Live batch
              </p>
            </div>
            {e.batch.tutor && (
              <p className="text-xs mt-2">Tutor: {e.batch.tutor.name}</p>
            )}
          </Link>
        ))}
        {!purchasedCourses.length && !batchEnrolled.length && (
          <EmptyState
            title="No courses yet"
            hint="Browse open courses and enroll with Razorpay to get started."
          />
        )}
      </div>

      <h2 className="font-bold text-lg mb-4">Browse more courses</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {browse
          .filter((c) => !enrolledIds.has(String(c._id)))
          .map((c) => (
            <CourseCard key={c._id} course={c} />
          ))}
      </div>
    </div>
  );
};

export default StudentMyCoursesPage;
