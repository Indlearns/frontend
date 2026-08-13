import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import Button from "../../components/common/Button";
import PageHeader from "../../components/admin/PageHeader";

const emptyForm = {
  title: "",
  company: "",
  description: "",
  location: "Remote",
  jobType: "full-time",
  skills: "",
  applyLink: "",
  isActive: true,
};

const PublicJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    adminService.getPublicJobs().then((r) => r.success && setJobs(r.data));
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  };

  const startEdit = (job) => {
    setEditingId(job._id);
    setForm({
      title: job.title || "",
      company: job.company || "",
      description: job.description || "",
      location: job.location || "Remote",
      jobType: job.jobType || "full-time",
      skills: (job.skills || []).join(", "),
      applyLink: job.applyLink || "",
      isActive: job.isActive !== false,
    });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      };
      const r = editingId
        ? await adminService.updatePublicJob(editingId, payload)
        : await adminService.createPublicJob(payload);
      if (r.success) {
        resetForm();
        load();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not save public job");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (job) => {
    await adminService.updatePublicJob(job._id, { isActive: !job.isActive });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this public job listing?")) return;
    await adminService.deletePublicJob(id);
    if (editingId === id) resetForm();
    load();
  };

  return (
    <div>
      <PageHeader
        title="Public Jobs"
        subtitle="Post job openings visible on the public website. Anyone can view and apply via the apply link — no login required."
      />

      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg">{editingId ? "Edit public job" : "Post public job"}</h2>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-sm text-brand-600">
                Cancel
              </button>
            )}
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <input
            required
            placeholder="Job title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input-field"
          />
          <input
            required
            placeholder="Company name"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="input-field"
          />
          <textarea
            placeholder="Job description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-field min-h-[120px]"
          />
          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="input-field"
          />
          <select
            value={form.jobType}
            onChange={(e) => setForm({ ...form, jobType: e.target.value })}
            className="input-field"
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
          </select>
          <input
            placeholder="Skills (comma separated)"
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
            className="input-field"
          />
          <div>
            <input
              required
              type="url"
              placeholder="Apply link (https://...)"
              value={form.applyLink}
              onChange={(e) => setForm({ ...form, applyLink: e.target.value })}
              className="input-field"
            />
            <p className="text-xs text-slate-500 mt-1">
              Applicants will be sent to this URL. Use a company careers page, Google Form, or
              LinkedIn job post link.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Visible on public jobs page
          </label>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : editingId ? "Save changes" : "Publish job"}
          </Button>
        </form>

        <div className="glass-card p-6">
          <h2 className="font-bold text-lg mb-4">Public jobs ({jobs.length})</h2>
          <ul className="space-y-3 max-h-[640px] overflow-y-auto">
            {jobs.map((job) => (
              <li
                key={job._id}
                className={`p-4 rounded-xl border ${
                  editingId === job._id
                    ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/20"
                    : "border-brand-100 dark:border-brand-800"
                }`}
              >
                <div className="flex justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{job.title}</p>
                    <p className="text-sm text-slate-500">{job.company}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full shrink-0 h-fit ${
                      job.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {job.isActive ? "Live" : "Hidden"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 capitalize">
                  {job.jobType} · {job.location}
                </p>
                {job.applyLink && (
                  <a
                    href={job.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-600 hover:underline mt-1 inline-block truncate max-w-full"
                  >
                    {job.applyLink}
                  </a>
                )}
                <div className="flex flex-wrap gap-3 mt-3 text-sm">
                  <button type="button" onClick={() => startEdit(job)} className="text-brand-600">
                    Edit
                  </button>
                  <button type="button" onClick={() => toggleActive(job)} className="text-slate-600">
                    {job.isActive ? "Hide" : "Show"}
                  </button>
                  <button type="button" onClick={() => handleDelete(job._id)} className="text-red-500">
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {!jobs.length && (
              <p className="text-sm text-slate-500">
                No public jobs yet. Post one on the left — it will appear at /jobs on the website.
              </p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PublicJobsPage;
