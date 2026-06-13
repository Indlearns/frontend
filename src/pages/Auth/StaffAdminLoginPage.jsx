import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff, FiUserCheck } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/common/Button";
import Logo from "../../components/common/Logo";
import { ROLES } from "../../utils/constants";

const StaffAdminLoginPage = () => {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(location.state?.error || "");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password, ROLES.ADMIN);
      if (res.success && res.data.role === ROLES.ADMIN) {
        navigate("/admin");
      } else {
        setError(res.message || "Admin login failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-slate-100 dark:bg-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-8"
      >
        <div className="flex justify-center mb-4">
          <FiUserCheck className="text-brand-600" size={32} />
        </div>
        <div className="flex justify-center mb-6"><Logo variant="auth" /></div>
        <h1 className="font-display text-2xl font-bold text-center">Admin Login</h1>
        <p className="text-center text-slate-500 text-sm mt-2 mb-6">
          @indlearns.com accounts created by super admin
        </p>
        <p className="text-center text-xs text-amber-600 dark:text-amber-400 mb-4">
          No forgot password. Contact super admin to reset.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin1@indlearns.com"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Admin Login"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default StaffAdminLoginPage;
