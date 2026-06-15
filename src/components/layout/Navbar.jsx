import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";
import Logo from "../common/Logo";
import Button from "../common/Button";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../../contexts/AuthContext";
import { NAV_LINKS, ENROLLED_STUDENT_NAV } from "../../utils/constants";
import { useStudentEnrollment } from "../../hooks/useStudentEnrollment";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { enrolled, isStudent } = useStudentEnrollment();

  const navLinks = isStudent && enrolled ? ENROLLED_STUDENT_NAV : NAV_LINKS;

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive
        ? "text-brand-600 dark:text-brand-400"
        : "text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400"
    }`;

  const dashboardPath =
    user?.role === "tutor"
      ? "/tutor"
      : user?.role === "student"
        ? enrolled
          ? "/student"
          : "/"
        : "/";

  return (
    <header className="sticky top-0 z-50 glass-card !rounded-none border-x-0 border-t-0 border-b border-brand-100/60 dark:border-brand-800/30">
      <nav className="section-container">
        <div className="flex items-center justify-between min-h-[5rem] h-auto py-2 sm:min-h-[5.25rem] lg:min-h-[5.5rem] gap-4">
          <Logo variant="nav" className="relative z-10" />

          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path} className={navLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                {!["admin", "superadmin"].includes(user?.role) && (
                  <Link
                    to={dashboardPath}
                    className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600"
                  >
                    {user?.role === "student" && !enrolled ? "Home" : "Dashboard"}
                  </Link>
                )}
                {isStudent && enrolled && (
                  <>
                    <Link
                      to="/student/profile"
                      className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/student/resume"
                      className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600"
                    >
                      Resume
                    </Link>
                  </>
                )}
                <Button variant="ghost" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline">Sign in</Button>
                </Link>
                <Link to="/register">
                  <Button variant="ghost">Join free</Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden border-t border-slate-200/50 dark:border-slate-700/50"
            >
              <div className="py-4 flex flex-col gap-3">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={navLinkClass}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                ))}
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-200/50">
                  {isAuthenticated ? (
                    <>
                      {!["admin", "superadmin"].includes(user?.role) && (
                        <Link to={dashboardPath} onClick={() => setMobileOpen(false)}>
                          Dashboard
                        </Link>
                      )}
                      {isStudent && enrolled && (
                        <>
                          <Link to="/student/profile" onClick={() => setMobileOpen(false)}>
                            Profile
                          </Link>
                          <Link to="/student/resume" onClick={() => setMobileOpen(false)}>
                            Resume
                          </Link>
                        </>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => {
                          logout();
                          setMobileOpen(false);
                        }}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setMobileOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Sign in
                        </Button>
                      </Link>
                      <Link to="/register" onClick={() => setMobileOpen(false)}>
                        <Button className="w-full">Join free</Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Navbar;
