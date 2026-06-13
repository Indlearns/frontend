import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiChevronDown, FiChevronUp, FiDownload, FiUsers } from "react-icons/fi";
import { adminService } from "../../services/adminService";
import PageHeader from "../../components/admin/PageHeader";
import StudentList from "../../components/admin/StudentList";
import StudentDetail from "../../components/admin/StudentDetail";
import Button from "../../components/common/Button";
import { downloadCsvFromApi } from "../../utils/downloadCsv";
import { formatPrice } from "../../utils/media";

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const StudentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [detail, setDetail] = useState(null);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  const [exporting, setExporting] = useState("");
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [expandedMonthKey, setExpandedMonthKey] = useState(null);
  const [view, setView] = useState("enrollments");

  const selectedId = searchParams.get("id") || "";

  const loadStudents = async () => {
    setLoadingList(true);
    const r = await adminService.getStudents();
    if (r.success) setStudents(r.data);
    setLoadingList(false);
  };

  const loadEnrollments = async () => {
    setLoadingEnrollments(true);
    try {
      const r = await adminService.getEnrollmentsByCourse();
      if (r.success) setEnrollmentData(r.data);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const loadStudentDetail = async (id) => {
    if (!id) {
      setDetail(null);
      return;
    }
    setLoadingDetail(true);
    try {
      const r = await adminService.getStudent(id);
      if (r.success) setDetail(r.data);
      else setDetail(null);
    } catch {
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    loadStudents();
    loadEnrollments();
  }, []);

  useEffect(() => {
    loadStudentDetail(selectedId);
  }, [selectedId]);

  const handleSelect = (id) => {
    setSearchParams({ id });
    setView("students");
  };

  const handleExport = async (courseId = null) => {
    const key = courseId || "all";
    setExporting(key);
    try {
      const path = courseId
        ? `/admin/students/enrollments/export?courseId=${courseId}`
        : "/admin/students/enrollments/export";
      await downloadCsvFromApi(path, "enrollments.csv");
    } finally {
      setExporting("");
    }
  };

  const coursesWithEnrollments =
    enrollmentData?.courses?.filter((c) => c.totalEnrollments > 0) || [];

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle="Course-wise enrollments by month, student profiles, and downloadable reports."
      />

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setView("enrollments")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            view === "enrollments"
              ? "bg-brand-600 text-white"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          }`}
        >
          Enrollments by course
        </button>
        <button
          type="button"
          onClick={() => setView("students")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            view === "students"
              ? "bg-brand-600 text-white"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          }`}
        >
          Student directory
        </button>
      </div>

      {view === "enrollments" && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="glass-card p-4">
              <p className="text-sm text-slate-500">Total enrollments</p>
              <p className="text-2xl font-bold text-brand-600">
                {enrollmentData?.totalEnrollments ?? "—"}
              </p>
            </div>
            <div className="glass-card p-4">
              <p className="text-sm text-slate-500">Courses with enrollments</p>
              <p className="text-2xl font-bold">
                {enrollmentData?.coursesWithEnrollments ?? "—"}
              </p>
            </div>
            <div className="glass-card p-4 flex flex-col justify-between">
              <p className="text-sm text-slate-500">Export all enrollments</p>
              <Button
                type="button"
                variant="outline"
                disabled={exporting === "all" || !enrollmentData?.totalEnrollments}
                onClick={() => handleExport()}
                className="mt-2 w-fit"
              >
                <FiDownload className="inline mr-1" />
                {exporting === "all" ? "Downloading..." : "Download CSV"}
              </Button>
            </div>
          </div>

          {enrollmentData?.allByMonth?.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="font-bold text-lg mb-4">All enrollments by month</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {enrollmentData.allByMonth.map((group) => (
                  <div
                    key={group.month}
                    className="rounded-xl border border-brand-100 dark:border-brand-800 p-4"
                  >
                    <p className="font-medium">{group.label}</p>
                    <p className="text-2xl font-bold text-brand-600 mt-1">
                      {group.enrollments.length}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass-card p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <FiUsers className="text-brand-600" />
                Course-wise enrollments
              </h2>
            </div>

            {loadingEnrollments && (
              <p className="text-slate-500 text-sm">Loading enrollment data...</p>
            )}

            {!loadingEnrollments && coursesWithEnrollments.length === 0 && (
              <p className="text-slate-500 text-sm">No course enrollments yet.</p>
            )}

            <ul className="space-y-3">
              {coursesWithEnrollments.map((item) => {
                const isOpen = expandedCourseId === item.course._id;
                return (
                  <li
                    key={item.course._id}
                    className="rounded-xl border border-brand-100 dark:border-brand-800 overflow-hidden"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50/80 dark:bg-slate-800/30">
                      <button
                        type="button"
                        onClick={() => {
                          setExpandedCourseId((id) =>
                            id === item.course._id ? null : item.course._id
                          );
                          setExpandedMonthKey(null);
                        }}
                        className="flex items-center gap-2 text-left min-w-0 flex-1"
                      >
                        {isOpen ? (
                          <FiChevronUp className="shrink-0 text-brand-600" />
                        ) : (
                          <FiChevronDown className="shrink-0 text-brand-600" />
                        )}
                        <span className="font-semibold truncate">{item.course.title}</span>
                      </button>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="text-brand-600 font-medium">
                          {item.totalEnrollments} enrolled
                        </span>
                        <span className="text-slate-500">
                          {formatPrice(item.totalRevenue, item.course.currency)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleExport(item.course._id)}
                          disabled={exporting === item.course._id}
                          className="text-brand-600 hover:underline flex items-center gap-1"
                        >
                          <FiDownload size={14} />
                          {exporting === item.course._id ? "..." : "CSV"}
                        </button>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="p-4 space-y-3 border-t border-brand-100 dark:border-brand-800">
                        {item.byMonth.map((group) => {
                          const monthOpen = expandedMonthKey === `${item.course._id}-${group.month}`;
                          return (
                            <div
                              key={group.month}
                              className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedMonthKey((k) =>
                                    k === `${item.course._id}-${group.month}`
                                      ? null
                                      : `${item.course._id}-${group.month}`
                                  )
                                }
                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left"
                              >
                                <span className="font-medium">{group.label}</span>
                                <span className="text-sm text-slate-500">
                                  {group.enrollments.length} student
                                  {group.enrollments.length === 1 ? "" : "s"}
                                </span>
                              </button>
                              {monthOpen && (
                                <div className="overflow-x-auto border-t border-slate-100 dark:border-slate-800">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="text-left text-slate-500">
                                        <th className="px-4 py-2 font-medium">Name</th>
                                        <th className="px-4 py-2 font-medium">Email</th>
                                        <th className="px-4 py-2 font-medium">Phone</th>
                                        <th className="px-4 py-2 font-medium">Amount</th>
                                        <th className="px-4 py-2 font-medium">Enrolled</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {group.enrollments.map((row) => (
                                        <tr
                                          key={`${row.studentId}-${row.enrolledAt}`}
                                          className="border-t border-slate-100 dark:border-slate-800"
                                        >
                                          <td className="px-4 py-2">{row.name || "—"}</td>
                                          <td className="px-4 py-2">{row.email || "—"}</td>
                                          <td className="px-4 py-2">{row.phone || "—"}</td>
                                          <td className="px-4 py-2">
                                            {formatPrice(row.amount, row.currency)}
                                          </td>
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
                          );
                        })}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {!loadingEnrollments &&
              enrollmentData?.courses?.some((c) => c.totalEnrollments === 0) && (
                <p className="text-xs text-slate-500 mt-4">
                  Courses with zero enrollments are hidden. Manage them from the Courses page.
                </p>
              )}
          </div>
        </div>
      )}

      {view === "students" && (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="glass-card p-6">
            <h2 className="font-bold text-lg mb-4">All students ({students.length})</h2>
            <StudentList
              students={students}
              loading={loadingList}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          </div>
          <StudentDetail detail={detail} loading={loadingDetail && Boolean(selectedId)} />
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
