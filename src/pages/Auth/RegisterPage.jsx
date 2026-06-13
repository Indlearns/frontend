import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/common/Button";
import Logo from "../../components/common/Logo";

/**
 * Registration page - creates student account by default
 */
const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError("Please accept the Privacy Policy and Terms and Conditions to continue.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await register(name, email, password);
      if (res.success) {
        navigate("/");
      } else {
        setError(res.message || "Registration failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to connect to server. Is the backend running?");
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
        <div className="flex justify-center mb-8">
          <Logo variant="auth" />
        </div>
        <h1 className="font-display text-2xl font-bold text-center text-slate-900 dark:text-white">
          Create Account
        </h1>
        <p className="text-center text-slate-500 mt-2 mb-4">
          Students only — create your free account
        </p>
        <div className="mb-6 p-3 rounded-lg bg-brand-50 dark:bg-brand-950/30 text-brand-800 dark:text-brand-200 text-sm text-center">
          Students only. @indlearns.com emails are for staff. Tutors are added by
          the admin team.
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password (min 6 characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="••••••••"
            />
          </div>
          <label className="flex items-start gap-3 cursor-pointer text-sm text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
            />
            <span>
              I agree to the{" "}
              <Link to="/privacy" target="_blank" className="text-brand-600 hover:underline">
                Privacy Policy
              </Link>
              ,{" "}
              <Link to="/terms" target="_blank" className="text-brand-600 hover:underline">
                Terms and Conditions
              </Link>
              , and{" "}
              <Link to="/refund" target="_blank" className="text-brand-600 hover:underline">
                Refund Policy
              </Link>
              .
            </span>
          </label>
          <Button type="submit" className="w-full" disabled={loading || !acceptedTerms}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-4">
          <Link to="/privacy" className="hover:text-brand-600">
            Privacy
          </Link>
          {" · "}
          <Link to="/terms" className="hover:text-brand-600">
            Terms
          </Link>
          {" · "}
          <Link to="/refund" className="hover:text-brand-600">
            Refund Policy
          </Link>
        </p>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
