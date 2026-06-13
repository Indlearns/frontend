import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/common/Button";
import CreateAdminForm from "../../components/admin/CreateAdminForm";
import CreateTutorForm from "../../components/admin/CreateTutorForm";
import AdminList from "../../components/admin/AdminList";
import TutorList from "../../components/admin/TutorList";
import { superadminService } from "../../services/superadminService";
import { ROLES, SUPERADMIN_LOGIN_PATH } from "../../utils/constants";

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [tab, setTab] = useState("admins");
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [a, t] = await Promise.all([
        superadminService.getAdmins(),
        superadminService.getTutors(),
      ]);
      if (a.success) setAdmins(a.data);
      if (t.success) setTutors(t.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === ROLES.SUPERADMIN) fetchAll();
  }, [user]);

  const handleReset = async (role, id) => {
    if (!confirm("Generate new password for this user?")) return;
    try {
      const res = await superadminService.resetPassword(role, id);
      if (res.data?.temporaryPassword) {
        alert(`New password (copy now):\n\n${res.data.temporaryPassword}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="section-container py-10">
      <div className="flex flex-wrap justify-between gap-4 mb-8">
        <div>
          <span className="text-sm text-amber-600 font-medium">Super Admin</span>
          <h1 className="font-display text-3xl font-bold">Team Management</h1>
          <p className="text-slate-500 text-sm">{user?.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Home
          </Button>
          <Button variant="ghost" onClick={logout}>Logout</Button>
        </div>
      </div>

      <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-sm text-amber-900 dark:text-amber-200">
        Only <strong>students</strong> can use Forgot Password. Admins & tutors: you reset
        passwords here. Staff login: admins → <code>/admins/login</code>
      </div>

      <div className="flex gap-2 mb-6 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-fit">
        {["admins", "tutors"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
              tab === t ? "bg-white dark:bg-slate-700 shadow-sm text-brand-600" : "text-slate-500"
            }`}
          >
            {t} ({t === "admins" ? admins.length : tutors.length})
          </button>
        ))}
      </div>

      {tab === "admins" && (
        <div className="grid lg:grid-cols-2 gap-8">
          <CreateAdminForm onCreated={fetchAll} />
          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-bold mb-4">All Admins</h2>
            <AdminList
              admins={admins}
              loading={loading}
              onReset={(id) => handleReset("admins", id)}
            />
          </div>
        </div>
      )}

      {tab === "tutors" && (
        <div className="grid lg:grid-cols-2 gap-8">
          <CreateTutorForm onCreated={fetchAll} />
          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-bold mb-4">All Tutors</h2>
            <TutorList
              tutors={tutors}
              loading={loading}
              onReset={(id) => handleReset("tutors", id)}
            />
          </div>
        </div>
      )}

      <p className="mt-8 text-xs text-slate-400">
        Super admin login: {window.location.origin}{SUPERADMIN_LOGIN_PATH}
      </p>
    </div>
  );
};

export default SuperAdminDashboard;
