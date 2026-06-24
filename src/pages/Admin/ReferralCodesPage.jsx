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

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "—";

const itemTypeLabel = (type) => {
  if (type === "hackathon") return "Hackathon";
  if (type === "workshop") return "Workshop";
  return "Course";
};

const UsageTable = ({ usages, emptyMessage, showCode = false }) => {
  if (!usages.length) {
    return <p className="text-sm text-slate-500 py-2">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto mt-3">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500 border-b border-brand-100">
            {showCode && <th className="py-2 pr-3 font-medium">Code</th>}
            <th className="py-2 pr-3 font-medium">Customer</th>
            <th className="py-2 pr-3 font-medium">Email</th>
            <th className="py-2 pr-3 font-medium">Phone</th>
            <th className="py-2 pr-3 font-medium">Item</th>
            <th className="py-2 pr-3 font-medium">Discount</th>
            <th className="py-2 pr-3 font-medium">Paid</th>
            <th className="py-2 font-medium">Used on</th>
          </tr>
        </thead>
        <tbody>
          {usages.map((row) => (
            <tr key={row._id} className="border-b border-brand-50 last:border-0">
              {showCode && (
                <td className="py-2 pr-3 font-mono text-xs">{row.referralCode || "—"}</td>
              )}
              <td className="py-2 pr-3 font-medium">{row.student?.name || "—"}</td>
              <td className="py-2 pr-3">{row.student?.email || "—"}</td>
              <td className="py-2 pr-3">{row.student?.phone || "—"}</td>
              <td className="py-2 pr-3">
                <span className="text-xs text-slate-500 block">{itemTypeLabel(row.itemType)}</span>
                {row.itemTitle}
              </td>
              <td className="py-2 pr-3">{row.discountAmount} INR</td>
              <td className="py-2 pr-3">{row.amountPaid} INR</td>
              <td className="py-2 whitespace-nowrap">{formatDate(row.usedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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
  const [expandedCodeId, setExpandedCodeId] = useState(null);
  const [usagesByCode, setUsagesByCode] = useState({});
  const [loadingUsagesId, setLoadingUsagesId] = useState(null);
  const [allUsages, setAllUsages] = useState([]);
  const [loadingAllUsages, setLoadingAllUsages] = useState(false);
  const [showAllUsages, setShowAllUsages] = useState(false);

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

  const toggleUsages = async (codeId) => {
    if (expandedCodeId === codeId) {
      setExpandedCodeId(null);
      return;
    }

    setExpandedCodeId(codeId);
    setLoadingUsagesId(codeId);
    try {
      const r = await adminService.getReferralCodeUsages(codeId);
      if (r.success) {
        setUsagesByCode((prev) => ({ ...prev, [codeId]: r.data.usages }));
      }
    } catch {
      setUsagesByCode((prev) => ({ ...prev, [codeId]: [] }));
    } finally {
      setLoadingUsagesId(null);
    }
  };

  const loadAllUsages = async () => {
    if (showAllUsages) {
      setShowAllUsages(false);
      return;
    }
    setShowAllUsages(true);
    if (allUsages.length) return;

    setLoadingAllUsages(true);
    try {
      const r = await adminService.getAllReferralUsages();
      if (r.success) setAllUsages(r.data);
    } finally {
      setLoadingAllUsages(false);
    }
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
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="font-semibold text-lg">Existing codes</h2>
            <Button type="button" variant="outline" onClick={loadAllUsages} disabled={loadingAllUsages}>
              {loadingAllUsages
                ? "Loading..."
                : showAllUsages
                  ? "Hide all usage"
                  : "View all customer usage"}
            </Button>
          </div>
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
                        onClick={() => toggleUsages(item._id)}
                        className="text-xs text-brand-700 hover:underline"
                      >
                        {expandedCodeId === item._id ? "Hide customers" : "View customers"}
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
                  {expandedCodeId === item._id && (
                    <div className="mt-3 pt-3 border-t border-brand-100">
                      {loadingUsagesId === item._id ? (
                        <p className="text-sm text-slate-500">Loading customer details...</p>
                      ) : (
                        <UsageTable
                          usages={usagesByCode[item._id] || []}
                          emptyMessage="No customers have used this code yet."
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAllUsages && (
        <div className="glass-card p-6 mt-8">
          <h2 className="font-semibold text-lg mb-2">All referral code usage</h2>
          <p className="text-sm text-slate-500 mb-4">
            Customers who completed checkout with a referral code (courses, workshops, hackathons).
          </p>
          {loadingAllUsages ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : (
            <UsageTable usages={allUsages} emptyMessage="No referral usage recorded yet." showCode />
          )}
        </div>
      )}
    </div>
  );
};

export default ReferralCodesPage;
