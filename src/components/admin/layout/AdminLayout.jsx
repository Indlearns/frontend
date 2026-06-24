import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiUser,
  FiBook,
  FiCalendar,
  FiLayers,
  FiClock,
  FiBriefcase,
  FiMessageCircle,
  FiVideo,
  FiShield,
  FiTag,
  FiMenu,
  FiX,
  FiLogOut,
} from "react-icons/fi";
import Logo from "../../common/Logo";
import { useAuth } from "../../../contexts/AuthContext";
import { ROLES } from "../../../utils/constants";

const navItems = [
  { to: "/admin", label: "Overview", icon: FiHome, end: true },
  { to: "/admin/tutors", label: "Tutors", icon: FiUsers },
  { to: "/admin/students", label: "Students", icon: FiUser },
  { to: "/admin/courses", label: "Courses", icon: FiBook },
  { to: "/admin/referral-codes", label: "Referral codes", icon: FiTag },
  { to: "/admin/workshops", label: "Workshops", icon: FiCalendar },
  { to: "/admin/batches", label: "Batches", icon: FiLayers },
  { to: "/admin/schedule", label: "Class Schedule", icon: FiClock },
  { to: "/admin/live-classes", label: "Live Classes", icon: FiVideo },
  { to: "/admin/companies", label: "Partners", icon: FiBriefcase },
  { to: "/admin/chat", label: "Conversations", icon: FiMessageCircle },
];

const superAdminOnly = {
  to: "/admin/staff-admins",
  label: "Manage Admins",
  icon: FiShield,
};

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(isSuperAdmin ? "/superadmin/login" : "/admins/login");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? "bg-brand-500 text-white shadow-brand"
        : "text-slate-600 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-brand-950/50"
    }`;

  return (
    <div className="min-h-screen bg-brand-50/50 dark:bg-[#0A1628] flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-white dark:bg-[#0F2340] border-r border-brand-100 dark:border-brand-900/50 flex flex-col transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-brand-100 dark:border-brand-900/50">
          <Logo variant="nav" />
          <p className="mt-3 text-xs text-slate-500">
            {isSuperAdmin ? "Super Admin Portal" : "Admin Portal"}
          </p>
          <p className="text-sm font-medium text-brand-700 dark:text-brand-300 truncate">
            {user?.name}
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={linkClass}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}

          {isSuperAdmin && (
            <>
              <div className="pt-4 pb-2 px-4 text-xs font-semibold text-amber-600 uppercase tracking-wider">
                Super Admin Only
              </div>
              <NavLink
                to={superAdminOnly.to}
                className={linkClass}
                onClick={() => setSidebarOpen(false)}
              >
                <superAdminOnly.icon size={18} />
                {superAdminOnly.label}
              </NavLink>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-brand-100 dark:border-brand-900/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0F2340] border-b border-brand-100">
          <button onClick={() => setSidebarOpen(true)} className="p-2">
            <FiMenu size={24} />
          </button>
          <Logo variant="nav" />
          <button onClick={() => setSidebarOpen(false)} className="p-2 lg:hidden">
            <FiX size={24} className={sidebarOpen ? "" : "invisible"} />
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
