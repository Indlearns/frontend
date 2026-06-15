import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { studentService } from "../../services/studentService";
import Button from "../../components/common/Button";
import { useStudentEnrollment } from "../../hooks/useStudentEnrollment";
import { getImageUrl, formatPrice } from "../../utils/media";

const StudentOverviewPage = () => {
  const { enrolled } = useStudentEnrollment();
  const [batchCourses, setBatchCourses] = useState([]);
  const [purchasedCourses, setPurchasedCourses] = useState([]);

  useEffect(() => {
    if (enrolled) {
      studentService.getMyCourses().then((r) => {
        if (r.success) {
          setBatchCourses(r.data || []);
          setPurchasedCourses(r.purchasedCourses || []);
        }
      });
    }
  }, [enrolled]);

  const totalCount = batchCourses.length + purchasedCourses.length;

  if (!enrolled) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-2">Welcome, student</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl">
          Browse open courses and enroll with Razorpay. After enrollment you will land here on your
          student dashboard.
        </p>
        <Link to="/courses">
          <Button>Browse courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl sm:text-2xl font-bold mb-2">Welcome back</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6 sm:mb-8 text-sm sm:text-base">
        You have access to {totalCount} course{totalCount !== 1 ? "s" : ""}.
        {batchCourses.length > 0
          ? " Open a batch dashboard for live classes, assignments, and chat."
          : " Live batch classes appear here once your admin assigns you to a batch."}
      </p>

      {purchasedCourses.length > 0 && (
        <div className="mb-8">
          <h2 className="font-bold text-lg mb-4">Your enrolled courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {purchasedCourses.map((p) => (
              <Link
                key={p.course._id}
                to={`/courses/${p.course._id}`}
                className="glass-card p-4 sm:p-5 hover:border-brand-500 block w-full"
              >
                {p.course.thumbnail && (
                  <img
                    src={getImageUrl(p.course.thumbnail)}
                    alt=""
                    className="w-full h-28 object-cover rounded-lg mb-3"
                  />
                )}
                <p className="font-bold">{p.course.title}</p>
                <p className="text-sm text-brand-600 mt-1">
                  {formatPrice(p.course.price, p.course.currency)}
                </p>
                <p className="text-xs text-green-700 mt-2">Enrolled via payment</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {batchCourses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {batchCourses.slice(0, 3).map((e) => (
            <Link
              key={e.batch._id}
              to={`/student/courses/${e.batch._id}`}
              className="glass-card p-5 hover:border-brand-500"
            >
              <p className="font-bold">{e.batch.course?.title}</p>
              <p className="text-sm text-slate-500">{e.progress?.overallPercent || 0}% complete</p>
            </Link>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <Link to="/student/courses" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">My courses</Button>
        </Link>
        {batchCourses.length > 0 && (
          <>
            <Link to="/student/progress" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                My progress
              </Button>
            </Link>
            <Link to="/student/career" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                Career
              </Button>
            </Link>
          </>
        )}
        <Link to="/courses" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            Browse more courses
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default StudentOverviewPage;
