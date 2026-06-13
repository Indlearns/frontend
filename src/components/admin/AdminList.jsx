import { FiMail, FiShield, FiRefreshCw } from "react-icons/fi";

const AdminList = ({ admins, loading, onReset }) => {
  if (loading) return <p className="text-slate-500 text-sm">Loading...</p>;
  if (!admins?.length) return <p className="text-slate-500 text-sm">No admins yet.</p>;

  return (
    <ul className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
      {admins.map((admin) => (
        <li key={admin._id} className="py-4 flex justify-between gap-2">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
              <FiShield className="text-brand-600" />
            </div>
            <div>
              <p className="font-medium">{admin.name}</p>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <FiMail size={14} /> {admin.email}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                admin.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {admin.isActive ? "Active" : "Off"}
            </span>
            <button
              type="button"
              onClick={() => onReset?.(admin._id)}
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

export default AdminList;
