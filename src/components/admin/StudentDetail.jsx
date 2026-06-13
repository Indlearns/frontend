import { FiMail, FiPhone, FiCalendar, FiBook, FiLayers, FiCreditCard } from "react-icons/fi";
import { formatPrice } from "../../utils/media";

const StudentDetail = ({ detail, loading }) => {
  if (loading) {
    return (
      <div className="glass-card p-6">
        <p className="text-slate-500 text-sm">Loading student details...</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-slate-500">Select a student to view their profile and enrollments.</p>
      </div>
    );
  }

  const { student, batches, coursePurchases, workshopPurchases } = detail;

  return (
    <div className="glass-card p-6 space-y-6">
      <div>
        <h2 className="font-bold text-xl">{student.name}</h2>
        <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <p className="flex items-center gap-2">
            <FiMail size={16} className="text-brand-600" />
            {student.email}
          </p>
          {student.phone && (
            <p className="flex items-center gap-2">
              <FiPhone size={16} className="text-brand-600" />
              {student.phone}
            </p>
          )}
          <p className="flex items-center gap-2">
            <FiCalendar size={16} className="text-brand-600" />
            Joined {new Date(student.createdAt).toLocaleDateString()}
          </p>
          <span
            className={`inline-block text-xs px-2 py-1 rounded-full ${
              student.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {student.isActive ? "Active account" : "Inactive account"}
          </span>
        </div>
      </div>

      <section>
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <FiBook className="text-brand-600" /> Enrolled courses
        </h3>
        {student.enrolledCourses?.length ? (
          <ul className="space-y-2">
            {student.enrolledCourses.map((c) => (
              <li
                key={c._id}
                className="p-3 rounded-lg border border-brand-100 dark:border-brand-800 text-sm"
              >
                <p className="font-medium">{c.title}</p>
                <p className="text-slate-500">
                  {c.category} · {formatPrice(c.price, c.currency)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No enrolled courses yet.</p>
        )}
      </section>

      {coursePurchases?.length > 0 && (
        <section>
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <FiCreditCard className="text-brand-600" /> Course payments
          </h3>
          <ul className="space-y-2">
            {coursePurchases.map((p) => (
              <li
                key={p._id}
                className="p-3 rounded-lg border border-brand-100 text-sm flex justify-between gap-2"
              >
                <span>{p.course?.title || "Course"}</span>
                <span className="text-brand-600 font-medium">
                  {formatPrice(p.amount, p.currency)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <FiLayers className="text-brand-600" /> Batch assignments
        </h3>
        {batches?.length ? (
          <ul className="space-y-2">
            {batches.map((b) => (
              <li
                key={b._id}
                className="p-3 rounded-lg border border-brand-100 dark:border-brand-800 text-sm"
              >
                <p className="font-medium">{b.name}</p>
                <p className="text-slate-500">Course: {b.course?.title || "—"}</p>
                <p className="text-slate-500">Tutor: {b.tutor?.name || "Not assigned"}</p>
                <p className="text-xs capitalize text-brand-600 mt-1">{b.status}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Not assigned to any batch yet.</p>
        )}
      </section>

      {student.registeredWorkshops?.length > 0 && (
        <section>
          <h3 className="font-semibold mb-3">Registered events</h3>
          <ul className="space-y-2">
            {student.registeredWorkshops.map((w) => (
              <li
                key={w._id}
                className="p-3 rounded-lg border border-brand-100 text-sm"
              >
                <p className="font-medium">{w.title}</p>
                <p className="text-slate-500 capitalize">
                  {w.eventType} · {new Date(w.date).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {workshopPurchases?.length > 0 && (
        <section>
          <h3 className="font-semibold mb-3">Event payments</h3>
          <ul className="space-y-2">
            {workshopPurchases.map((p) => (
              <li
                key={p._id}
                className="p-3 rounded-lg border border-brand-100 text-sm flex justify-between"
              >
                <span>{p.workshop?.title || "Event"}</span>
                <span className="text-brand-600">{formatPrice(p.amount, p.currency)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default StudentDetail;
