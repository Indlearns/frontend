import { useEffect, useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";
import { adminService } from "../../services/adminService";
import Button from "../../components/common/Button";
import PageHeader from "../../components/admin/PageHeader";
import { PARTNER_LOGIN_PATH } from "../../utils/constants";

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({
    companyName: "",
    email: "",
    password: "",
    autoGeneratePassword: true,
    website: "",
    description: "",
    partnershipType: "hiring",
  });
  const [createdCreds, setCreatedCreds] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const r = await adminService.getCompanies();
    if (r.success) setCompanies(r.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCreatedCreds(null);
    setLoading(true);
    try {
      const r = await adminService.createPartner({
        companyName: form.companyName,
        email: form.email,
        password: form.autoGeneratePassword ? undefined : form.password,
        autoGeneratePassword: form.autoGeneratePassword,
        website: form.website,
        description: form.description,
        partnershipType: form.partnershipType,
      });
      if (r.success) {
        setCreatedCreds({
          email: form.email,
          password: r.data.temporaryPassword,
          loginUrl: PARTNER_LOGIN_PATH,
        });
        setForm({
          companyName: "",
          email: "",
          password: "",
          autoGeneratePassword: true,
          website: "",
          description: "",
          partnershipType: "hiring",
        });
        load();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create partner");
    } finally {
      setLoading(false);
    }
  };

  const copyCreds = () => {
    if (!createdCreds) return;
    const text = `Partner login: ${window.location.origin}${createdCreds.loginUrl}\nEmail: ${createdCreds.email}${createdCreds.password ? `\nPassword: ${createdCreds.password}` : ""}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleActive = async (c) => {
    await adminService.updateCompany(c._id, { isActive: !c.isActive });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this partner company and its login? All jobs and applications will be removed.")) return;
    await adminService.deleteCompany(id);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Partner Companies"
        subtitle="Admin only — create partner logins so companies can post jobs and review student applications."
      />

      {createdCreds && (
        <div className="glass-card p-4 mb-6 border border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <p className="font-semibold text-green-800 dark:text-green-300">Partner account created</p>
          <p className="text-sm mt-2">
            Login URL: <code className="text-brand-600">{PARTNER_LOGIN_PATH}</code> (not shown on student/tutor login)
          </p>
          <p className="text-sm">Email: {createdCreds.email}</p>
          {createdCreds.password && (
            <p className="text-sm font-mono mt-1">Password: {createdCreds.password}</p>
          )}
          <button
            type="button"
            onClick={copyCreds}
            className="mt-3 inline-flex items-center gap-2 text-sm text-brand-600 hover:underline"
          >
            {copied ? <FiCheck /> : <FiCopy />}
            Copy credentials
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <h2 className="font-bold text-lg">Create partner account</h2>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <input
            required
            placeholder="Company name"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            className="input-field"
          />
          <input
            required
            type="email"
            placeholder="Official company email (login)"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input-field"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.autoGeneratePassword}
              onChange={(e) => setForm({ ...form, autoGeneratePassword: e.target.checked })}
            />
            Auto-generate secure password
          </label>
          {!form.autoGeneratePassword && (
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password (min 6 characters)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-field"
            />
          )}
          <input
            placeholder="Website URL (optional)"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            className="input-field"
          />
          <textarea
            placeholder="About the partnership (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-field min-h-[80px]"
          />
          <select
            value={form.partnershipType}
            onChange={(e) => setForm({ ...form, partnershipType: e.target.value })}
            className="input-field"
          >
            <option value="hiring">Hiring Partner</option>
            <option value="sponsor">Sponsor</option>
            <option value="curriculum">Curriculum Partner</option>
            <option value="other">Other</option>
          </select>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create partner & login"}
          </Button>
        </form>

        <div className="glass-card p-6">
          <h2 className="font-bold text-lg mb-4">Partners ({companies.length})</h2>
          <ul className="space-y-3 max-h-[600px] overflow-y-auto">
            {companies.map((c) => (
              <li key={c._id} className="p-4 rounded-xl border border-brand-100">
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="font-semibold">{c.name}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${c.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-slate-500 capitalize">{c.partnershipType}</p>
                <p className="text-sm text-brand-600">{c.contactEmail || c.partnerUser?.email}</p>
                {c.website && (
                  <a href={c.website} target="_blank" rel="noreferrer" className="text-xs text-brand-600">
                    {c.website}
                  </a>
                )}
                <div className="flex gap-3 mt-2 text-sm">
                  <button type="button" onClick={() => toggleActive(c)} className="text-brand-600">
                    {c.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button type="button" onClick={() => handleDelete(c._id)} className="text-red-500">
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {!companies.length && (
              <p className="text-sm text-slate-500">No partner companies yet.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CompaniesPage;
