import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import Button from "../../components/common/Button";
import PageHeader from "../../components/admin/PageHeader";

const emptyForm = () => ({
  code: "",
  discountAmount: "",
  maxUses: "",
  isActive: true,
  courses: [],
  workshops: [],
  hackathons: [],
});

const ScopePicker = ({ title, hint, items, selected, onChange }) => (
  <div>
    <p className="text-sm font-medium">{title}</p>
    {hint && <p className="text-xs text-slate-500 mb-2">{hint}</p>}
    {items.length === 0 ? (
      <p className="text-xs text-slate-400">No items available.</p>
    ) : (
      <div className="max-h-40 overflow-y-auto space-y-1 rounded-lg border border-brand-100 p-2">
        {items.map((item) => {
          const id = item._id;
          const checked = selected.includes(id);
          return (
            <label key={id} className="flex items-start gap-2 text-sm cursor-pointer py-0.5">
              <input
                type="checkbox"
                checked={checked}
                onChange={() =>
                  onChange(checked ? selected.filter((x) => x !== id) : [...selected, id])
                }
                className="mt-0.5"
              />
              <span>{item.title}</span>
            </label>
          );
        })}
      </div>
    )}
  </div>
);

const formatScopeSummary = (item) => {
  const courseCount = item.courses?.length || 0;
  const workshopCount = item.workshops?.length || 0;
  const hackathonCount = item.hackathons?.length || 0;
  if (!courseCount && !workshopCount && !hackathonCount) return "All paid courses, workshops & hackathons";
  const parts = [];
  if (courseCount) parts.push(`${courseCount} course${courseCount > 1 ? "s" : ""}`);
  if (workshopCount) parts.push(`${workshopCount} workshop${workshopCount > 1 ? "s" : ""}`);
  if (hackathonCount) parts.push(`${hackathonCount} hackathon${hackathonCount > 1 ? "s" : ""}`);
  return parts.join(" · ");
};

const ReferralCodesPage = () => {
  const [codes, setCodes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const [codesRes, coursesRes, workshopsRes] = await Promise.all([
      adminService.getReferralCodes(),
      adminService.getCourses(),
      adminService.getWorkshops(),
    ]);
    if (codesRes.success) setCodes(codesRes.data);
    if (coursesRes.success) setCourses(coursesRes.data);
    if (workshopsRes.success) {
      const all = workshopsRes.data;
      setWorkshops(all.filter((w) => w.eventType !== "hackathon"));
      setHackathons(all.filter((w) => w.eventType === "hackathon"));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
    setError("");
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      code: item.code,
      discountAmount: String(item.discountAmount),
      maxUses: item.maxUses != null ? String(item.maxUses) : "",
      isActive: item.isActive,
      courses: (item.courses || []).map((c) => (typeof c === "object" ? c._id : c)),
      workshops: (item.workshops || []).map((w) => (typeof w === "object" ? w._id : w)),
      hackathons: (item.hackathons || []).map((h) => (typeof h === "object" ? h._id : h)),
    });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const payload = {
      code: form.code,
      discountAmount: Number(form.discountAmount),
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      isActive: form.isActive,
      courses: form.courses,
      workshops: form.workshops,
      hackathons: form.hackathons,
    };
    try {
      const r = editingId
        ? await adminService.updateReferralCode(editingId, payload)
        : await adminService.createReferralCode(payload);
      if (r.success) {
        resetForm();
        load();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save referral code");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (item) => {
    await adminService.updateReferralCode(item._id, { isActive: !item.isActive });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this referral code?")) return;
    if (editingId === id) resetForm();
    await adminService.deleteReferralCode(id);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Referral codes"
        subtitle="Create discount codes for courses, workshops, and hackathons. Select specific items or leave all unchecked to allow any paid item."
      />

      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <h2 className="font-semibold text-lg">
            {editingId ? "Edit referral code" : "New referral code"}
          </h2>
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <label className="block text-sm font-medium mb-1">Referral code</label>
            <input
              className="input-field uppercase"
              placeholder="e.g. SAVE500"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Discount amount (INR)</label>
            <input
              type="number"
              min="1"
              className="input-field"
              placeholder="500"
              value={form.discountAmount}
              onChange={(e) => setForm({ ...form, discountAmount: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Max uses (optional)</label>
            <input
              type="number"
              min="1"
              className="input-field"
              placeholder="Unlimited if empty"
              value={form.maxUses}
              onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
            />
          </div>

          <div className="pt-2 border-t border-brand-100 space-y-4">
            <p className="text-sm font-medium">Applies to (optional)</p>
            <p className="text-xs text-slate-500 -mt-2">
              Check specific items below. If nothing is checked, the code works on any paid course,
              workshop, or hackathon.
            </p>

            <ScopePicker
              title="Courses"
              items={courses}
              selected={form.courses}
              onChange={(courses) => setForm({ ...form, courses })}
            />
            <ScopePicker
              title="Workshops"
              items={workshops}
              selected={form.workshops}
              onChange={(workshops) => setForm({ ...form, workshops })}
            />
            <ScopePicker
              title="Hackathons"
              items={hackathons}
              selected={form.hackathons}
              onChange={(hackathons) => setForm({ ...form, hackathons })}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active
          </label>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update code" : "Create code"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>

        <div className="glass-card p-6">
          <h2 className="font-semibold text-lg mb-4">Existing codes</h2>
          {codes.length === 0 ? (
            <p className="text-sm text-slate-500">No referral codes yet.</p>
          ) : (
            <div className="space-y-3">
              {codes.map((item) => (
                <div
                  key={item._id}
                  className="p-3 rounded-xl border border-brand-100 dark:border-brand-900/50"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono font-semibold">{item.code}</p>
                      <p className="text-sm text-slate-500">
                        {item.discountAmount} INR off · Used {item.usageCount}
                        {item.maxUses != null ? ` / ${item.maxUses}` : ""}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{formatScopeSummary(item)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => toggleActive(item)}
                        className={`text-xs px-2 py-1 rounded-full ${
                          item.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="text-xs text-brand-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferralCodesPage;
