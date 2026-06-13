import { FiMail, FiUser, FiPhone, FiBook, FiLayers } from "react-icons/fi";

const StudentList = ({ students, loading, selectedId, onSelect }) => {
  if (loading) return <p className="text-slate-500 text-sm">Loading students...</p>;
  if (!students?.length) {
    return <p className="text-slate-500 text-sm">No students registered yet.</p>;
  }

  return (
    <ul className="divide-y divide-slate-200/50 dark:divide-slate-700/50 max-h-[600px] overflow-y-auto">
      {students.map((student) => (
        <li key={student._id}>
          <button
            type="button"
            onClick={() => onSelect(student._id)}
            className={`w-full text-left py-4 px-2 flex gap-3 transition-colors rounded-lg ${
              selectedId === student._id
                ? "bg-brand-50 dark:bg-brand-950/40 border border-brand-200"
                : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
              <FiUser className="text-brand-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{student.name}</p>
              <p className="text-sm text-slate-500 flex items-center gap-1 truncate">
                <FiMail size={14} className="shrink-0" />
                {student.email}
              </p>
              <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <FiBook size={12} /> {student.enrolledCourseCount || 0} courses
                </span>
                <span className="flex items-center gap-1">
                  <FiLayers size={12} /> {student.batchCount || 0} batches
                </span>
              </div>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full h-fit shrink-0 ${
                student.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {student.isActive ? "Active" : "Inactive"}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default StudentList;
