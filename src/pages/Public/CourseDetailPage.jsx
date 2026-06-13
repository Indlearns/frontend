import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { publicService } from "../../services/publicService";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PurchaseButton from "../../components/payment/PurchaseButton";
import PurchaseStatus from "../../components/payment/PurchaseStatus";
import { useRazorpayPurchase } from "../../hooks/useRazorpayPurchase";
import {
  getImageUrl,
  formatPrice,
  formatEnrollmentCloseDate,
  isEnrollmentClosed,
} from "../../utils/media";

const CourseDetailContent = ({ course, onReload }) => {
  const purchase = useRazorpayPurchase({
    purchaseType: "course",
    item: course,
    onSuccess: onReload,
  });

  const showAction = !purchase.isClosed && !purchase.hasAccess;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4 mt-6">
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-3xl font-bold">{course.title}</h1>
          <p className="text-sm text-slate-500 mt-2">
            {course.category}
            {course.duration && ` · ${course.duration}`}
            {course.enrollmentCloseDate && (
              <>
                {" · "}
                {isEnrollmentClosed(course) ? (
                  <span className="text-red-600 font-medium">Enrollment closed</span>
                ) : (
                  <>Enrollment closes {formatEnrollmentCloseDate(course.enrollmentCloseDate)}</>
                )}
              </>
            )}
          </p>
          <p className="text-xl font-semibold text-brand-600 mt-2">
            {formatPrice(course.price, course.currency)}
          </p>
        </div>
        {showAction && (
          <PurchaseButton
            purchaseType="course"
            itemId={course._id}
            enrollment={purchase}
            className="shrink-0"
          />
        )}
      </div>

      {course.thumbnail && (
        <img
          src={getImageUrl(course.thumbnail)}
          alt={course.title}
          className="w-full max-h-80 object-cover rounded-2xl mt-6 border border-brand-100"
        />
      )}

      {course.description && (
        <p className="mt-6 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
          {course.description}
        </p>
      )}

      <PurchaseStatus enrollment={purchase} />

      {showAction && (
        <div className="mt-12 flex flex-col items-center text-center border-t border-brand-100 pt-10">
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">
            Ready to start learning?
          </p>
          <p className="text-2xl font-bold text-brand-600 mb-1">
            {formatPrice(course.price, course.currency)}
          </p>
          {!purchase.isFree && (
            <p className="text-sm text-slate-500 mb-4">
              Paid courses are completed via Razorpay at checkout.
            </p>
          )}
          <PurchaseButton
            purchaseType="course"
            itemId={course._id}
            enrollment={purchase}
            className="w-full max-w-xs sm:max-w-sm px-10 py-3 text-base"
          />
          {!purchase.isAuthenticated && (
            <p className="text-xs text-slate-500 mt-3">{purchase.loginHint}</p>
          )}
        </div>
      )}
    </>
  );
};

const CourseDetailPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    publicService
      .getCourse(id)
      .then((r) => {
        if (r.success) setCourse(r.data);
        else setError(r.message || "Course not found.");
      })
      .catch(() => setError("Could not load course. Please check that the backend is running."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="section-container py-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="section-container py-16 text-center">
        <p className="text-slate-600">{error || "Course not found."}</p>
        <Link to="/courses" className="inline-block mt-4">
          <Button variant="outline">Back to courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="section-container py-12 max-w-4xl">
      <Link to="/courses" className="text-sm text-brand-600 hover:underline">
        ← All courses
      </Link>
      <CourseDetailContent course={course} onReload={load} />
    </div>
  );
};

export default CourseDetailPage;
