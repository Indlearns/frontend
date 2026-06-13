import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { superadminService } from "../../services/superadminService";
import CreateAdminForm from "../../components/admin/CreateAdminForm";
import AdminList from "../../components/admin/AdminList";
import PageHeader from "../../components/admin/PageHeader";
import { ROLES } from "../../utils/constants";

/** Superadmin only — regular admins cannot see this page */
const StaffAdminsPage = () => {
  const { isSuperAdmin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const r = await superadminService.getAdmins();
    if (r.success) setAdmins(r.data);
    setLoading(false);
  };

  useEffect(() => {
    if (isSuperAdmin) load();
  }, [isSuperAdmin]);

  if (!isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleReset = async (id) => {
    if (!confirm("Reset password for this admin?")) return;
    const r = await superadminService.resetPassword("admins", id);
    if (r.data?.temporaryPassword) {
      alert(`New password:\n\n${r.data.temporaryPassword}`);
    }
  };

  return (
    <div>
      <PageHeader
        title="Manage Admins"
        subtitle="Super admin only — create @indlearns.com admin accounts."
      />
      <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-sm">
        Regular admins cannot see this page. They use /admins/login and manage tutors,
        courses, batches, etc.
      </div>
      <div className="grid lg:grid-cols-2 gap-8">
        <CreateAdminForm onCreated={load} />
        <div className="glass-card p-6">
          <h2 className="font-bold text-lg mb-4">All Admins ({admins.length})</h2>
          <AdminList admins={admins} loading={loading} onReset={handleReset} />
        </div>
      </div>
    </div>
  );
};

export default StaffAdminsPage;
