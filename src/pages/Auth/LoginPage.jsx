import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiEye, FiEyeOff, FiUser, FiBookOpen } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/common/Button";
import Logo from "../../components/common/Logo";
import { ROLES } from "../../utils/constants";
import { studentService } from "../../services/studentService";

const LOGIN_TABS = [
  {
    id: ROLES.STUDENT,
    label: "Student",
    icon: FiBookOpen,
    subtitle: "Use your signup email & password",
    showRegister: true,
    placeholder: "student@gmail.com",
  },
  {
    id: ROLES.TUTOR,
    label: "Tutor",
    icon: FiUser,
    subtitle: "Credentials provided by your admin",
    showRegister: false,
    placeholder: "tutor@email.com",
  },
];

const getDashboardPath = async (role) => {
  if (role === ROLES.TUTOR) return "/tutor";
  if (role === ROLES.STUDENT) {
    const status = await studentService.getEnrollmentStatus();
    return status.success && status.data.enrolled ? "/student" : "/";
  }
  return "/";
};

/**
 * Public login — Students and Tutors only (no admin tab)
 */
const LoginPage = () => {
  const [activeTab, setActiveTab] = useState(ROLES.STUDENT);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.from;

  const currentTab = LOGIN_TABS.find((t) => t.id === activeTab);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setError("");
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(email, password, activeTab);
      if (res.success) {
        if (returnTo && typeof returnTo === "string") {
          navigate(returnTo, { replace: true });
        } else {
          const path = await getDashboardPath(res.data.role);
          navigate(path);
        }
      } else {
        setError(res.message || "Login failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to connect to server. Is the backend running?"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg glass-card p-6 sm:p-8"
      >
        <div className="flex justify-center mb-8">
          <Logo variant="auth" />
        </div>

        <h1 className="font-display text-2xl font-bold text-center text-slate-900 dark:text-white">
          Sign In to IndLearn
        </h1>
        <p className="text-center text-slate-500 mt-2 mb-6 text-sm">
          For students and tutors
        </p>

        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 mb-6">
          {LOGIN_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-slate-500 mb-4"
          >
            {currentTab?.subtitle}
          </motion.p>
        </AnimatePresence>

        {activeTab === ROLES.TUTOR && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 text-sm">
            Tutors are added by super admin. No forgot password — contact super admin to reset.
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder={currentTab?.placeholder}
            />
          </div>

          <div className="flex justify-end">
            {activeTab === ROLES.STUDENT && (
              <Link
                to="/forgot-password"
                className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : `Sign in as ${currentTab?.label}`}
          </Button>
        </form>

        {currentTab?.showRegister && (
          <p className="text-center text-sm text-slate-500 mt-6">
            New student?{" "}
            <Link
              to="/register"
              className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
            >
              Create free account
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default LoginPage;
