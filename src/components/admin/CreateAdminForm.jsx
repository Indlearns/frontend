import { useState } from "react";
import { FiCopy, FiCheck, FiShield } from "react-icons/fi";
import Button from "../common/Button";
import { superadminService } from "../../services/superadminService";
/* Used only on StaffAdminsPage (superadmin) */

const CreateAdminForm = ({ onCreated }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setGeneratedPassword(null);
    setLoading(true);

    try {
      const res = await superadminService.createAdmin({
        name,
        email,
        password: autoGenerate ? undefined : password,
        autoGeneratePassword: autoGenerate,
      });

      if (res.success) {
        if (res.data.temporaryPassword) {
          setGeneratedPassword(res.data.temporaryPassword);
        }
        setName("");
        setEmail("");
        setPassword("");
        onCreated?.();
      } else {
        setError(res.message);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create admin";
      if (msg.includes("tutor") && msg.includes("not allowed")) {
        setError(
          "You are logged in as Tutor, not Admin. Click Logout → open /admin/login → sign in with official@indlearns.com"
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <FiShield className="text-brand-600" size={22} />
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
          Add Admin
        </h2>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Use <strong>@indlearns.com</strong> emails (e.g. admin@indlearns.com,
        support@indlearns.com)
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {generatedPassword && (
        <div className="mb-4 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
          <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
            Admin created! Share password once:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 rounded-lg font-mono text-sm">
              {generatedPassword}
            </code>
            <button
              type="button"
              onClick={copyPassword}
              className="p-2 rounded-lg bg-brand-600 text-white"
            >
              {copied ? <FiCheck size={18} /> : <FiCopy size={18} />}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Support Team"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="admin@indlearns.com"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoGenerate}
            onChange={(e) => setAutoGenerate(e.target.checked)}
            className="rounded text-brand-600"
          />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Auto-generate secure password
          </span>
        </label>
        {!autoGenerate && (
          <input
            type="text"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            placeholder="Set password"
          />
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Admin"}
        </Button>
      </form>
    </div>
  );
};

export default CreateAdminForm;
