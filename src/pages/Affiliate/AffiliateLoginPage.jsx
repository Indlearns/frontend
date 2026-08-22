import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAffiliateAuth } from "../../contexts/AffiliateAuthContext";
import Button from "../../components/common/Button";
import Logo from "../../components/common/Logo";
import { AFFILIATE_PORTAL_PATH } from "./affiliatePaths";

const AffiliateLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAffiliateAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) navigate(AFFILIATE_PORTAL_PATH);
      else setError(res.message || "Login failed");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-slate-100 dark:bg-slate-950">
      <div className="w-full max-w-md glass-card p-8">
        <div className="flex justify-center mb-6">
          <Logo variant="auth" />
        </div>
        <h1 className="font-display text-2xl font-bold text-center">Affiliate Login</h1>
        <p className="text-center text-slate-500 text-sm mt-2 mb-6">
          Access your dashboard, links, and earnings
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
          <div className="relative">
            <input
              required
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          New affiliate?{" "}
          <Link to="/affiliate/register" className="text-brand-600 font-medium hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AffiliateLoginPage;
