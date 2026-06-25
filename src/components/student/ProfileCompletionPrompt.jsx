import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiUser, FiX } from "react-icons/fi";
import Button from "../common/Button";
import { studentService } from "../../services/studentService";
import { useAuth } from "../../contexts/AuthContext";
import { isStudentProfileComplete } from "../../utils/studentProfileCompletion";

const ProfileCompletionPrompt = ({ open, initialUser, initialProfile, onClose, onComplete }) => {
  const { updateUser } = useAuth();
  const [form, setForm] = useState({
    name: initialUser?.name || "",
    phone: initialUser?.phone || "",
    headline: initialProfile?.headline || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm({
        name: initialUser?.name || "",
        phone: initialUser?.phone || "",
        headline: initialProfile?.headline || "",
      });
      setError("");
    }
  }, [open, initialUser, initialProfile]);

  if (!open) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const r = await studentService.updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
        headline: form.headline.trim(),
      });
      if (!r.success) {
        setError(r.message || "Could not save profile.");
        return;
      }
      updateUser({
        name: r.data?.user?.name || form.name.trim(),
        phone: r.data?.user?.phone || form.phone.trim(),
      });
      window.dispatchEvent(new CustomEvent("student-profile-updated"));
      if (isStudentProfileComplete(r.data?.user, r.data?.profile)) {
        onComplete?.();
      } else {
        onClose?.();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemindLater = () => {
    sessionStorage.setItem("profileCompletionDismissed", "1");
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-completion-title"
    >
      <div className="relative w-full max-w-md glass-card p-6 shadow-xl border border-brand-100 dark:border-slate-700">
        <button
          type="button"
          onClick={handleRemindLater}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600"
          aria-label="Close"
        >
          <FiX size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-600">
            <FiUser size={22} />
          </div>
          <div>
            <h2 id="profile-completion-title" className="font-display text-lg font-bold">
              Complete your profile
            </h2>
            <p className="text-sm text-slate-500">Takes less than a minute</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
          Welcome to IndLearn! Add a few details so we can personalize your learning and help with
          course payments.
        </p>

        {error && (
          <p className="text-sm text-red-600 mb-4 rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Full name</label>
            <input
              className="input-field"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Mobile number</label>
            <input
              type="tel"
              inputMode="numeric"
              className="input-field"
              placeholder="10-digit mobile number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Headline</label>
            <input
              className="input-field"
              placeholder="e.g. Aspiring Full Stack Developer"
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full mt-2" disabled={saving}>
            {saving ? "Saving..." : "Save & continue"}
          </Button>
        </form>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 pt-4 border-t border-brand-100 dark:border-slate-700">
          <button
            type="button"
            onClick={handleRemindLater}
            className="text-sm text-slate-500 hover:text-brand-600"
          >
            Remind me later
          </button>
          <Link
            to="/student/profile"
            onClick={onClose}
            className="text-sm text-brand-600 hover:underline"
          >
            Open full profile →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionPrompt;
