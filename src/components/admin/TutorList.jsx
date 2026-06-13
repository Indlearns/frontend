import { FiMail, FiUser, FiRefreshCw } from "react-icons/fi";

const TutorList = ({ tutors, loading, onReset }) => {
  if (loading) return <p className="text-slate-500 text-sm">Loading...</p>;
  if (!tutors?.length) return <p className="text-slate-500 text-sm">No tutors yet.</p>;

  return (
    <ul className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
      {tutors.map((tutor) => (
        <li key={tutor._id} className="py-4 flex justify-between gap-2">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
              <FiUser className="text-brand-600" />
            </div>
            <div>
              <p className="font-medium">{tutor.name}</p>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <FiMail size={14} /> {tutor.email}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                tutor.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {tutor.isActive ? "Active" : "Off"}
            </span>
            <button
              type="button"
              onClick={() => onReset?.(tutor._id)}
              className="text-xs flex items-center gap-1 text-brand-600 hover:underline"
            >
              <FiRefreshCw size={12} /> Reset password
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TutorList;
