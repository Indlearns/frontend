import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { studentService } from "../../services/studentService";

const StudentProgressPage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    studentService.getProgress().then((r) => r.success && setData(r.data));
  }, []);

  if (!data) return <p className="text-slate-500">Loading progress...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">My progress</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        Track completion across your enrolled courses. Progress updates when you submit
        assignments and attend classes.
      </p>

      <div className="glass-card p-8 mb-8 text-center max-w-md">
        <p className="text-5xl font-bold text-brand-600">{data.overallPercent}%</p>
        <p className="text-slate-500 mt-2">Overall learning progress</p>
      </div>

      <div className="space-y-6">
        {data.courses?.map((p) => (
          <div key={p.batchId} className="glass-card p-6">
            <div className="flex flex-wrap justify-between gap-2 mb-3">
              <div>
                <h2 className="font-bold text-lg">{p.course?.title}</h2>
                <p className="text-sm text-brand-600">{p.batchName}</p>
              </div>
              <Link
                to={`/student/courses/${p.batchId}`}
                className="text-sm text-brand-600 font-medium"
              >
                Open course →
              </Link>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-brand-500 rounded-full"
                style={{ width: `${p.overallPercent}%` }}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <p>
                Assignments: {p.stats?.submittedAssignments}/{p.stats?.totalAssignments}{" "}
                submitted
                {p.stats?.averageScore != null && ` · Avg ${p.stats.averageScore}`}
              </p>
              <p>
                Classes: {p.stats?.completedClasses}/{p.stats?.totalClasses} completed
              </p>
            </div>
            {p.milestones?.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {p.milestones.map((m) => (
                  <li
                    key={m}
                    className="text-xs px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-800 dark:text-brand-200"
                  >
                    {m}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {!data.courses?.length && (
          <p className="text-slate-500">Enroll in a batch to start tracking progress.</p>
        )}
      </div>
    </div>
  );
};

export default StudentProgressPage;
