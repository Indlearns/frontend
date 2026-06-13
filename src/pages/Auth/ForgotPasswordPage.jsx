import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { authService } from "../../services/authService";
import Button from "../../components/common/Button";
import Logo from "../../components/common/Logo";

/** Students only — staff cannot reset password here */
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setResetUrl("");
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setMessage(res.message);
      if (res.resetUrl) setResetUrl(res.resetUrl);
    } catch (err) {
      setError(err.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-8"
      >
        <div className="flex justify-center mb-8"><Logo variant="auth" /></div>
        <h1 className="font-display text-2xl font-bold text-center">Forgot Password</h1>
        <p className="text-center text-slate-500 text-sm mt-2 mb-6">
          Students only. Tutors and admins must contact super admin.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
        )}
        {message && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-200 text-sm">
            {message}
            {resetUrl && (
              <p className="mt-2 break-all">
                <strong>Dev link:</strong>{" "}
                <a href={resetUrl} className="text-brand-600 underline">
                  {resetUrl}
                </a>
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.student@gmail.com"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-brand-500"
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          <Link to="/login" className="text-brand-600 hover:underline">
            Back to login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
