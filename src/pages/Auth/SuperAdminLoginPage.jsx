import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiShield } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../services/authService";
import Button from "../../components/common/Button";
import Logo from "../../components/common/Logo";
import { ROLES, SUPER_ADMIN_EMAIL } from "../../utils/constants";

const SuperAdminLoginPage = () => {
  const location = useLocation();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState(SUPER_ADMIN_EMAIL);
  const [code, setCode] = useState("");
  const [error, setError] = useState(location.state?.error || "");
  const [info, setInfo] = useState("");
  const [devCode, setDevCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginWithAuthData } = useAuth();
  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setDevCode("");
    setLoading(true);
    try {
      const res = await authService.requestSuperAdminCode(email);
      if (res.success) {
        setStep("code");
        setInfo(res.message);
        if (res.devCode) setDevCode(res.devCode);
      } else {
        setError(res.message || "Could not send code.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authService.verifySuperAdminCode(email, code);
      if (res.success && res.data.role === ROLES.SUPERADMIN) {
        loginWithAuthData(res.data);
        navigate("/admin");
      } else {
        setError(res.message || "Verification failed.");
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
        <div className="flex justify-center mb-6">
          <Logo variant="auth" />
        </div>
        <h1 className="font-display text-2xl font-bold text-center text-white">
          Super Admin Portal
        </h1>
        <p className="text-center text-slate-400 text-sm mt-2 mb-6">
          {step === "email"
            ? "We email a one-time code to the super admin address."
            : "Enter the 6-digit code from your email."}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 text-red-300 text-sm">{error}</div>
        )}
        {info && (
          <div className="mb-4 p-3 rounded-lg bg-brand-950/50 text-brand-200 text-sm">{info}</div>
        )}
        {devCode && (
          <div className="mb-4 p-3 rounded-lg bg-amber-950/50 text-amber-200 text-sm text-center">
            Dev code: <strong className="text-lg tracking-widest">{devCode}</strong>
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={SUPER_ADMIN_EMAIL}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send login code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit code"
              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white text-center text-2xl tracking-[0.4em] outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
              {loading ? "Verifying..." : "Verify & sign in"}
            </Button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setError("");
                setInfo("");
                setDevCode("");
              }}
              className="w-full text-sm text-slate-400 hover:text-brand-300"
            >
              Send a new code
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default SuperAdminLoginPage;
