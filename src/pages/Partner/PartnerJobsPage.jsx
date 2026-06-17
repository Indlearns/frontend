import { useEffect, useState } from "react";
import { partnerService } from "../../services/partnerService";
import Button from "../../components/common/Button";

const emptyForm = {
  title: "",
  description: "",
  location: "Remote",
  jobType: "full-time",
  skills: "",
  courseCategories: "",
};

const PartnerJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    partnerService.getJobs().then((r) => r.success && setJobs(r.data));
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
      description: job.description || "",
      location: job.location || "Remote",
      jobType: job.jobType || "full-time",
      skills: (job.skills || []).join(", "),
      courseCategories: (job.courseCategories || []).join(", "),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        courseCategories: form.courseCategories.split(",").map((s) => s.trim()).filter(Boolean),
      };
      const r = editingId
        ? await partnerService.updateJob(editingId, payload)
        : await partnerService.createJob(payload);
      if (r.success) {
        resetForm();
        load();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not save job");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (job) => {
    await partnerService.updateJob(job._id, { isActive: !job.isActive });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this job and all its applications?")) return;
    await partnerService.deleteJob(id);
    if (editingId === id) resetForm();
    load();
  };

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Job postings</h1>
      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold">{editingId ? "Edit job" : "Post new job"}</h2>
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
          <textarea
            placeholder="Job description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-field min-h-[100px]"
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
          <input
            placeholder="Course categories to match (comma separated)"
            value={form.courseCategories}
            onChange={(e) => setForm({ ...form, courseCategories: e.target.value })}
            className="input-field"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : editingId ? "Save changes" : "Publish job"}
          </Button>
        </form>

        <div className="glass-card p-6">
          <h2 className="font-bold mb-4">Your jobs ({jobs.length})</h2>
          <ul className="space-y-3 max-h-[600px] overflow-y-auto">
            {jobs.map((j) => (
              <li key={j._id} className="p-4 rounded-xl border border-brand-100">
                <div className="flex justify-between gap-2">
                  <p className="font-semibold">{j.title}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${j.isActive ? "bg-green-100 text-green-700" : "bg-slate-100"}`}
                  >
                    {j.isActive ? "Active" : "Closed"}
                  </span>
                </div>
                <p className="text-sm text-slate-500 capitalize">{j.jobType} · {j.location}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-sm">
                  <button type="button" onClick={() => startEdit(j)} className="text-brand-600">
                    Edit
                  </button>
                  <button type="button" onClick={() => toggleActive(j)} className="text-slate-600">
                    {j.isActive ? "Close" : "Reopen"}
                  </button>
                  <button type="button" onClick={() => handleDelete(j._id)} className="text-red-500">
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {!jobs.length && <p className="text-sm text-slate-500">No jobs posted yet.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PartnerJobsPage;
