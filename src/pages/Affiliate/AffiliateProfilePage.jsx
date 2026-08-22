import { useEffect, useState } from "react";
import { affiliateService } from "../../services/affiliateService";
import Button from "../../components/common/Button";

const emptyForm = {
  name: "",
  phone: "",
  kycType: "aadhar",
  aadharNumber: "",
  panNumber: "",
  bankAccountHolderName: "",
  bankAccountNumber: "",
  bankIfsc: "",
  bankName: "",
};

const AffiliateProfilePage = () => {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    affiliateService.getProfile().then((r) => {
      if (r.success) {
        const d = r.data;
        setForm({
          name: d.name || "",
          phone: d.phone || "",
          kycType: d.kycType || "aadhar",
          aadharNumber: d.aadharNumber || "",
          panNumber: d.panNumber || "",
          bankAccountHolderName: d.bankAccountHolderName || "",
          bankAccountNumber: d.bankAccountNumber || "",
          bankIfsc: d.bankIfsc || "",
          bankName: d.bankName || "",
        });
        setProfileComplete(d.profileComplete);
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const r = await affiliateService.updateProfile(form);
      if (r.success) {
        setMessage("Profile saved successfully.");
        setProfileComplete(r.data.profileComplete);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-slate-500">Loading profile...</p>;

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-bold mb-2">Complete your profile</h1>
      <p className="text-sm text-slate-500 mb-6">
        KYC (Aadhar or PAN) and bank details are required before you can use affiliate links or withdraw
        earnings.
      </p>

      {profileComplete && (
        <div className="mb-4 p-3 rounded-xl bg-green-50 text-green-700 text-sm">Profile complete ✓</div>
      )}
      {message && <div className="mb-4 p-3 rounded-xl bg-green-50 text-green-700 text-sm">{message}</div>}
      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
        <input
          required
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="input-field"
        />
        <input
          required
          placeholder="Mobile number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="input-field"
        />

        <div>
          <p className="text-sm font-medium mb-2">KYC document</p>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="kycType"
                checked={form.kycType === "aadhar"}
                onChange={() => setForm({ ...form, kycType: "aadhar", panNumber: "" })}
              />
              Aadhar
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="kycType"
                checked={form.kycType === "pan"}
                onChange={() => setForm({ ...form, kycType: "pan", aadharNumber: "" })}
              />
              PAN card
            </label>
          </div>
        </div>

        {form.kycType === "aadhar" ? (
          <input
            required
            placeholder="Aadhar number (12 digits)"
            maxLength={12}
            value={form.aadharNumber}
            onChange={(e) => setForm({ ...form, aadharNumber: e.target.value.replace(/\D/g, "") })}
            className="input-field"
          />
        ) : (
          <input
            required
            placeholder="PAN (e.g. ABCDE1234F)"
            maxLength={10}
            value={form.panNumber}
            onChange={(e) => setForm({ ...form, panNumber: e.target.value.toUpperCase() })}
            className="input-field"
          />
        )}

        <hr className="border-brand-100 dark:border-brand-800" />
        <p className="text-sm font-medium">Bank account for withdrawals</p>

        <input
          required
          placeholder="Account holder name"
          value={form.bankAccountHolderName}
          onChange={(e) => setForm({ ...form, bankAccountHolderName: e.target.value })}
          className="input-field"
        />
        <input
          required
          placeholder="Account number"
          value={form.bankAccountNumber}
          onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value.replace(/\s/g, "") })}
          className="input-field"
        />
        <input
          required
          placeholder="IFSC code"
          value={form.bankIfsc}
          onChange={(e) => setForm({ ...form, bankIfsc: e.target.value.toUpperCase() })}
          className="input-field"
        />
        <input
          required
          placeholder="Bank name"
          value={form.bankName}
          onChange={(e) => setForm({ ...form, bankName: e.target.value })}
          className="input-field"
        />

        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save profile"}
        </Button>
      </form>
    </div>
  );
};

export default AffiliateProfilePage;
