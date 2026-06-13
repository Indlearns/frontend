import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { studentService } from "../../services/studentService";
import Button from "../../components/common/Button";
import { FiBookOpen, FiCalendar, FiMessageCircle, FiVideo } from "react-icons/fi";

const StudentCourseDashboardPage = () => {
  const { batchId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    studentService.getCourseDashboard(batchId).then((r) => r.success && setData(r.data));
  }, [batchId]);

  if (!data) {
    return <p className="text-slate-500">Loading your course...</p>;
  }

  const { batch, progress, schedules, assignments, conversationId, tutor } = data;

  return (
    <div>
      <Link to="/student/courses" className="text-sm text-brand-600 hover:underline">
        ← My courses
      </Link>
      <h1 className="text-2xl font-bold mt-2">{batch.course?.title}</h1>
      <p className="text-brand-600 text-sm">{batch.name}</p>
      {batch.course?.description && (
        <p className="text-slate-600 dark:text-slate-400 mt-3 max-w-2xl">
          {batch.course.description}
        </p>
      )}

      <div className="glass-card p-5 mt-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Your progress</span>
          <span>{progress?.overallPercent || 0}%</span>
        </div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all"
            style={{ width: `${progress?.overallPercent || 0}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Assignments: {progress?.stats?.submittedAssignments || 0}/
          {progress?.stats?.totalAssignments || 0} · Classes completed:{" "}
          {progress?.stats?.completedClasses || 0}/{progress?.stats?.totalClasses || 0}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Link
          to="/student/classes"
          className="glass-card p-5 hover:border-brand-400 transition-colors"
        >
          <FiVideo className="text-brand-600 mb-2" size={22} />
          <p className="font-semibold">Live classes</p>
          <p className="text-xs text-slate-500 mt-1">{schedules?.length || 0} scheduled</p>
        </Link>
        <Link
          to="/student/assignments"
          className="glass-card p-5 hover:border-brand-400 transition-colors"
        >
          <FiBookOpen className="text-brand-600 mb-2" size={22} />
          <p className="font-semibold">Assignments</p>
          <p className="text-xs text-slate-500 mt-1">{assignments?.length || 0} active</p>
        </Link>
        <Link
          to="/student/chat"
          className="glass-card p-5 hover:border-brand-400 transition-colors"
        >
          <FiMessageCircle className="text-brand-600 mb-2" size={22} />
          <p className="font-semibold">Batch chat</p>
          <p className="text-xs text-slate-500 mt-1">Message classmates & tutor</p>
        </Link>
        <Link
          to="/student/meetings"
          className="glass-card p-5 hover:border-brand-400 transition-colors"
        >
          <FiCalendar className="text-brand-600 mb-2" size={22} />
          <p className="font-semibold">Request help</p>
          <p className="text-xs text-slate-500 mt-1">
            {tutor ? `Tutor: ${tutor.name}` : "1-on-1 doubt"}
          </p>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mt-10">
        <div className="glass-card p-5">
          <h2 className="font-bold mb-3">Upcoming classes</h2>
          {schedules?.length ? (
            <ul className="space-y-2 text-sm">
              {schedules.slice(0, 5).map((s) => (
                <li key={s._id} className="flex justify-between gap-2">
                  <span>{s.title}</span>
                  <span className="text-slate-500 shrink-0">
                    {new Date(s.date).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No classes scheduled yet.</p>
          )}
          <Link to="/student/classes" className="text-sm text-brand-600 mt-3 inline-block">
            View all classes →
          </Link>
        </div>
        <div className="glass-card p-5">
          <h2 className="font-bold mb-3">Assignments</h2>
          {assignments?.length ? (
            <ul className="space-y-2 text-sm">
              {assignments.slice(0, 5).map((a) => (
                <li key={a._id} className="flex justify-between gap-2">
                  <span>{a.title}</span>
                  <span className="capitalize text-slate-500">
                    {a.mySubmission?.status || "pending"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No assignments yet.</p>
          )}
          <Link to="/student/assignments" className="text-sm text-brand-600 mt-3 inline-block">
            View assignments →
          </Link>
        </div>
      </div>

      <div className="mt-8 flex gap-3 flex-wrap">
        <Link to="/student/progress">
          <Button variant="outline">My progress</Button>
        </Link>
        <Link to="/student/resume">
          <Button variant="outline">Update resume</Button>
        </Link>
      </div>
    </div>
  );
};

export default StudentCourseDashboardPage;
