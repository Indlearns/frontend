import { NavLink, Outlet } from "react-router-dom";
import Logo from "../../common/Logo";
import ThemeToggle from "../../layout/ThemeToggle";
import { useAuth } from "../../../contexts/AuthContext";

const nav = [
  { to: "/student", label: "Overview", end: true },
  { to: "/student/courses", label: "My courses" },
  { to: "/student/classes", label: "Live classes" },
  { to: "/student/assignments", label: "Assignments" },
  { to: "/student/progress", label: "My progress" },
  { to: "/student/career", label: "Career" },
  { to: "/student/profile", label: "Profile" },
  { to: "/student/resume", label: "Resume" },
  { to: "/student/chat", label: "Messages" },
  { to: "/student/meetings", label: "Request help" },
];

const StudentLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <aside className="w-64 shrink-0 border-r border-brand-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
        <div className="px-4 pt-5 pb-4 border-b border-brand-100 dark:border-slate-800">
          <Logo variant="sidebar" to="/student" />
          <p className="mt-2 text-xs text-slate-500">Student portal</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-500 text-white"
                    : "text-slate-700 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-brand-950/30"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-brand-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 mb-2 truncate">{user?.email}</p>
          <button
            type="button"
            onClick={logout}
            className="text-sm text-red-600 hover:underline w-full text-left"
          >
            Log out
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-brand-100 dark:border-slate-800 flex items-center justify-end px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur shrink-0">
          <ThemeToggle />
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
