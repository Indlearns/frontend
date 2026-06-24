import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import Button from "../../components/common/Button";
import PageHeader from "../../components/admin/PageHeader";

const ReferralCodesPage = () => {
  const [codes, setCodes] = useState([]);
  const [form, setForm] = useState({
    code: "",
    discountAmount: "",
    maxUses: "",
    isActive: true,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const r = await adminService.getReferralCodes();
    if (r.success) setCodes(r.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = await adminService.createReferralCode({
        code: form.code,
        discountAmount: Number(form.discountAmount),
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        isActive: form.isActive,
      });
      if (r.success) {
        setForm({ code: "", discountAmount: "", maxUses: "", isActive: true });
        load();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create referral code");
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
    await adminService.deleteReferralCode(id);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Course referral codes"
        subtitle="Create discount codes students can apply at course checkout. Discount is in INR and is subtracted from the course price."
      />

      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <h2 className="font-semibold text-lg">New referral code</h2>
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

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active
          </label>

          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create code"}
          </Button>
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
                  className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-brand-100 dark:border-brand-900/50"
                >
                  <div>
                    <p className="font-mono font-semibold">{item.code}</p>
                    <p className="text-sm text-slate-500">
                      {item.discountAmount} INR off · Used {item.usageCount}
                      {item.maxUses != null ? ` / ${item.maxUses}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
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
                      onClick={() => handleDelete(item._id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Delete
                    </button>
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
