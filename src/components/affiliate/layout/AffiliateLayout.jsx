import { NavLink, Outlet } from "react-router-dom";
import { FiMenu, FiLogOut } from "react-icons/fi";
import { useState } from "react";
import Logo from "../../common/Logo";
import { useAffiliateAuth } from "../../../contexts/AffiliateAuthContext";

const nav = [
  { to: "/affiliate", label: "Dashboard", end: true },
  { to: "/affiliate/profile", label: "Profile" },
  { to: "/affiliate/links", label: "Affiliate links" },
  { to: "/affiliate/earnings", label: "Earnings" },
];

const AffiliateLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { affiliate, logout } = useAffiliateAuth();

  const linkClass = ({ isActive }) =>
    `block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? "bg-brand-500 text-white"
        : "text-slate-700 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-brand-950/30"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 shrink-0 border-r border-brand-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-4 pt-5 pb-4 border-b border-brand-100 dark:border-slate-800">
          <Logo variant="sidebar" to="/affiliate" />
          <p className="mt-2 text-xs text-slate-500">Affiliate portal</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={linkClass}
              onClick={() => setSidebarOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-brand-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 truncate">{affiliate?.email}</p>
          <p className="text-xs text-brand-600 font-mono mt-1">{affiliate?.affiliateCode}</p>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 text-sm text-red-600 hover:underline mt-3"
          >
            <FiLogOut size={14} />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 h-14 border-b border-brand-100 dark:border-slate-800 flex items-center px-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
          <button type="button" onClick={() => setSidebarOpen(true)} className="p-2" aria-label="Menu">
            <FiMenu size={22} />
          </button>
          <span className="ml-3 font-semibold text-sm">Affiliate</span>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AffiliateLayout;
