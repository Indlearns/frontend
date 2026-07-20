import { useEffect, useMemo, useState } from "react";
import { adminService } from "../../services/adminService";
import Button from "../../components/common/Button";
import PageHeader from "../../components/admin/PageHeader";
import { toDateInputValue } from "../../utils/media";
import { getBatchItemLabel, getBatchItemTitle } from "../../utils/batchSource";

const emptyForm = {
  name: "",
  sourceType: "course",
  course: "",
  workshop: "",
  tutor: "",
  startDate: "",
  endDate: "",
  status: "upcoming",
};

const BatchesPage = () => {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const workshopOptions = useMemo(
    () => workshops.filter((w) => (w.eventType || "workshop") !== "hackathon"),
    [workshops]
  );
  const hackathonOptions = useMemo(
    () => workshops.filter((w) => w.eventType === "hackathon"),
    [workshops]
  );

  const load = async () => {
    const [b, c, w, t] = await Promise.all([
      adminService.getBatches(),
      adminService.getCourses(),
      adminService.getWorkshops(),
      adminService.getTutors(),
    ]);
    if (b.success) setBatches(b.data);
    if (c.success) setCourses(c.data);
    if (w.success) setWorkshops(w.data);
    if (t.success) setTutors(t.data);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  };

  const startEdit = (batch) => {
    const sourceType =
      batch.sourceType || (batch.workshop ? "workshop" : "course");
    setEditingId(batch._id);
    setForm({
      name: batch.name || "",
      sourceType,
      course: batch.course?._id || batch.course || "",
      workshop: batch.workshop?._id || batch.workshop || "",
      tutor: batch.tutor?._id || batch.tutor || "",
      startDate: toDateInputValue(batch.startDate),
      endDate: toDateInputValue(batch.endDate),
      status: batch.status || "upcoming",
    });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSourceTypeChange = (sourceType) => {
    setForm((f) => ({
      ...f,
      sourceType,
      course: sourceType === "course" ? f.course : "",
      workshop: sourceType === "course" ? "" : f.workshop,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        sourceType: form.sourceType,
        course: form.sourceType === "course" ? form.course : null,
        workshop: form.sourceType !== "course" ? form.workshop : null,
        tutor: form.tutor || null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        status: form.status,
      };
      const r = editingId
        ? await adminService.updateBatch(editingId, payload)
        : await adminService.createBatch(payload);
      if (r.success) {
        resetForm();
        load();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save batch");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this batch? Batch chat will also be removed.")) return;
    try {
      await adminService.deleteBatch(id);
      if (editingId === id) resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete batch");
    }
  };

  const itemOptions =
    form.sourceType === "hackathon"
      ? hackathonOptions
      : form.sourceType === "workshop"
        ? workshopOptions
        : [];

  return (
    <div>
      <PageHeader
        title="Batches"
        subtitle="Create a batch for a course, workshop, or hackathon — assign tutor and batch chat is auto-created."
      />
      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <h2 className="font-bold text-lg">{editingId ? "Edit Batch" : "Create Batch"}</h2>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <input
            required
            placeholder="Batch name (e.g. Morning Batch Jan 2026)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field"
          />
          <select
            required
            value={form.sourceType}
            onChange={(e) => handleSourceTypeChange(e.target.value)}
            className="input-field"
          >
            <option value="course">Course</option>
            <option value="workshop">Workshop</option>
            <option value="hackathon">Hackathon</option>
          </select>

          {form.sourceType === "course" ? (
            <select
              required
              value={form.course}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
              className="input-field"
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          ) : (
            <select
              required
              value={form.workshop}
              onChange={(e) => setForm({ ...form, workshop: e.target.value })}
              className="input-field"
            >
              <option value="">
                Select {form.sourceType === "hackathon" ? "hackathon" : "workshop"}
              </option>
              {itemOptions.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.title}
                </option>
              ))}
            </select>
          )}

          <select
            value={form.tutor}
            onChange={(e) => setForm({ ...form, tutor: e.target.value })}
            className="input-field"
          >
            <option value="">Assign tutor (optional)</option>
            {tutors.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name} — {t.email}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="input-field"
            />
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="input-field"
            />
          </div>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="input-field"
          >
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update batch" : "Create batch"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>
        <div className="glass-card p-6">
          <h2 className="font-bold text-lg mb-4">Batches ({batches.length})</h2>
          <ul className="space-y-3 max-h-[500px] overflow-y-auto">
            {batches.map((b) => (
              <li
                key={b._id}
                className={`p-4 rounded-xl border flex gap-3 ${
                  editingId === b._id
                    ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/20"
                    : "border-brand-100 dark:border-brand-800"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{b.name}</p>
                  <p className="text-sm text-slate-500">
                    {getBatchItemLabel(b)}: {getBatchItemTitle(b) || "—"}
                  </p>
                  <p className="text-sm text-slate-500">
                    Tutor: {b.tutor?.name || "Not assigned"}
                  </p>
                  <p className="text-xs text-brand-600 mt-1 capitalize">
                    {b.status} · {b.students?.length || 0} students
                  </p>
                </div>
                <div className="flex flex-col gap-2 h-fit shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(b)}
                    className="text-brand-600 text-sm hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(b._id)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {!batches.length && (
              <p className="text-sm text-slate-500">No batches yet. Create one on the left.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BatchesPage;
