import { useEffect, useState } from "react";
import { FiDownload, FiUsers, FiX } from "react-icons/fi";
import { adminService } from "../../services/adminService";
import { formatPrice } from "../../utils/media";
import Button from "../common/Button";

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const CourseEnrollmentsPanel = ({ courseId, courseTitle, onClose, compact = false }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportingMonth, setExportingMonth] = useState(null);
  const [error, setError] = useState("");
  const [expandedMonth, setExpandedMonth] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const r = await adminService.getCourseEnrollments(courseId);
        if (active) {
          if (r.success) setData(r.data);
          else setError("Could not load enrollments.");
        }
      } catch {
        if (active) setError("Could not load enrollments.");
      } finally {
        if (active) setLoading(false);
      }
    };
    if (courseId) load();
    return () => {
      active = false;
    };
  }, [courseId]);

  const handleExport = async (month) => {
    if (month) setExportingMonth(month);
    else setExporting(true);
    try {
      const response = await adminService.exportCourseEnrollments(courseId, month);
      const disposition = response.headers?.["content-disposition"] || "";
      const match = disposition.match(/filename="?([^"]+)"?/i);
      const fallback = month
        ? `${courseTitle || "course"}_${month}.csv`
        : `${courseTitle || "course"}_enrollments.csv`;
      downloadBlob(response.data, match?.[1] || fallback);
    } catch {
      setError("CSV download failed.");
    } finally {
      setExporting(false);
      setExportingMonth(null);
    }
  };

  const title = data?.course?.title || courseTitle || "Course";

  return (
    <div
      className={`rounded-xl border border-brand-200 dark:border-brand-800 bg-white/80 dark:bg-slate-900/80 ${
        compact ? "p-4 mt-3" : "glass-card p-6"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <FiUsers className="text-brand-600" />
            Enrollments — {title}
          </h3>
          {data && (
            <p className="text-sm text-slate-500 mt-1">
              {data.totalEnrollments} student{data.totalEnrollments === 1 ? "" : "s"} · Revenue{" "}
              {formatPrice(data.totalRevenue, data.course?.currency)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            disabled={exporting || loading || !data?.totalEnrollments}
            onClick={() => handleExport()}
            className="text-sm px-3 py-1.5"
          >
            <FiDownload className="inline mr-1" />
            {exporting ? "Exporting..." : "All CSV"}
          </Button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              aria-label="Close"
            >
              <FiX />
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {loading && <p className="text-slate-500 text-sm">Loading enrollments...</p>}

      {!loading && data && data.totalEnrollments === 0 && (
        <p className="text-slate-500 text-sm">No paid enrollments for this course yet.</p>
      )}

      {!loading && data?.byMonth?.length > 0 && (
        <div className="space-y-3 max-h-[420px] overflow-y-auto">
          {data.byMonth.map((group) => (
            <div
              key={group.month}
              className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedMonth((m) => (m === group.month ? null : group.month))
                  }
                  className="flex-1 flex items-center justify-between text-left hover:opacity-80"
                >
                  <span className="font-medium">{group.label}</span>
                  <span className="text-sm text-brand-600">
                    {group.enrollments.length} enrollment
                    {group.enrollments.length === 1 ? "" : "s"}
                  </span>
                </button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={exportingMonth === group.month}
                  onClick={() => handleExport(group.month)}
                  className="ml-2 text-xs px-2 py-1 shrink-0"
                >
                  <FiDownload className="inline mr-1" />
                  {exportingMonth === group.month ? "..." : "CSV"}
                </Button>
              </div>
              {expandedMonth === group.month && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-t border-slate-200 dark:border-slate-700 text-left text-slate-500">
                        <th className="px-4 py-2 font-medium">Student</th>
                        <th className="px-4 py-2 font-medium">Email</th>
                        <th className="px-4 py-2 font-medium">Amount</th>
                        <th className="px-4 py-2 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.enrollments.map((row) => (
                        <tr
                          key={`${row.studentId}-${row.enrolledAt}`}
                          className="border-t border-slate-100 dark:border-slate-800"
                        >
                          <td className="px-4 py-2">{row.name || "—"}</td>
                          <td className="px-4 py-2 text-slate-600">{row.email || "—"}</td>
                          <td className="px-4 py-2">{formatPrice(row.amount, row.currency)}</td>
                          <td className="px-4 py-2 text-slate-600">
                            {formatDate(row.enrolledAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseEnrollmentsPanel;
