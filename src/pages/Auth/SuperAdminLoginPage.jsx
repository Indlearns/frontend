import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff, FiShield } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/common/Button";
import Logo from "../../components/common/Logo";
import { ROLES } from "../../utils/constants";

const SuperAdminLoginPage = () => {
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
      const res = await login(email, password, ROLES.SUPERADMIN);
      if (res.success && res.data.role === ROLES.SUPERADMIN) {
        navigate("/admin");
      } else {
        setError(res.message || "Super admin login failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-8"
      >
        <div className="flex justify-center mb-4">
          <FiShield className="text-amber-400" size={32} />
        </div>
        <div className="flex justify-center mb-6"><Logo variant="auth" /></div>
        <h1 className="font-display text-2xl font-bold text-center text-white">
          Super Admin Portal
        </h1>
        <p className="text-center text-slate-400 text-sm mt-2 mb-6">
          official@indlearns.com — manage admins, tutors & passwords
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 text-red-300 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="official@indlearns.com"
            className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-700 bg-slate-800 text-white outline-none focus:ring-2 focus:ring-brand-500"
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
            {loading ? "Signing in..." : "Super Admin Login"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default SuperAdminLoginPage;
