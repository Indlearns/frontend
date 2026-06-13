import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import Button from "../../components/common/Button";
import PageHeader from "../../components/admin/PageHeader";

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({
    name: "",
    website: "",
    description: "",
    partnershipType: "hiring",
    logo: "",
  });

  const load = async () => {
    const r = await adminService.getCompanies();
    if (r.success) setCompanies(r.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await adminService.createCompany(form);
    setForm({ name: "", website: "", description: "", partnershipType: "hiring", logo: "" });
    load();
  };

  return (
    <div>
      <PageHeader
        title="Partner Companies"
        subtitle="Manage partner companies internally (not shown on the public website for now)."
      />
      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <h2 className="font-bold text-lg">Add Company</h2>
          <input
            required
            placeholder="Company name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field"
          />
          <input
            placeholder="Website URL"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            className="input-field"
          />
          <input
            placeholder="Logo URL (optional)"
            value={form.logo}
            onChange={(e) => setForm({ ...form, logo: e.target.value })}
            className="input-field"
          />
          <textarea
            placeholder="Partnership details"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-field"
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
          <Button type="submit">Add Company</Button>
        </form>
        <div className="glass-card p-6">
          <h2 className="font-bold text-lg mb-4">Partners ({companies.length})</h2>
          <ul className="space-y-3">
            {companies.map((c) => (
              <li key={c._id} className="p-4 rounded-xl border border-brand-100 flex gap-3">
                {c.logo && (
                  <img src={c.logo} alt="" className="w-12 h-12 object-contain rounded" />
                )}
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-slate-500 capitalize">{c.partnershipType}</p>
                  {c.website && (
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-brand-600"
                    >
                      {c.website}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CompaniesPage;
