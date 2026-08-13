import { useEffect, useMemo, useState } from "react";
import { FiUsers } from "react-icons/fi";
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

  const [studentsBatchId, setStudentsBatchId] = useState(null);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsSaving, setStudentsSaving] = useState(false);
  const [studentsError, setStudentsError] = useState("");

  const workshopOptions = useMemo(
    () => workshops.filter((w) => (w.eventType || "workshop") !== "hackathon"),
    [workshops]
  );
  const hackathonOptions = useMemo(
    () => workshops.filter((w) => w.eventType === "hackathon"),
    [workshops]
  );

  const studentsBatch = batches.find((b) => b._id === studentsBatchId);

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
      if (studentsBatchId === id) closeStudentsPanel();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete batch");
    }
  };

  const closeStudentsPanel = () => {
    setStudentsBatchId(null);
    setEligibleStudents([]);
    setSelectedStudentIds([]);
    setStudentsError("");
  };

  const openStudentsPanel = async (batch) => {
    setStudentsBatchId(batch._id);
    setStudentsLoading(true);
    setStudentsError("");
    try {
      const r = await adminService.getBatchEligibleStudents(batch._id);
      if (r.success) {
        setEligibleStudents(r.data);
        setSelectedStudentIds(r.data.filter((s) => s.inBatch).map((s) => s._id));
      } else {
        setStudentsError("Could not load eligible students.");
      }
    } catch (err) {
      setStudentsError(err.response?.data?.message || "Could not load eligible students.");
    } finally {
      setStudentsLoading(false);
    }
  };

  const toggleStudent = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllEligible = () => {
    setSelectedStudentIds(eligibleStudents.map((s) => s._id));
  };

  const clearStudentSelection = () => {
    setSelectedStudentIds([]);
  };

  const saveBatchStudents = async () => {
    if (!studentsBatchId) return;
    setStudentsSaving(true);
    setStudentsError("");
    try {
      const r = await adminService.updateBatchStudents(studentsBatchId, selectedStudentIds);
      if (r.success) {
        closeStudentsPanel();
        load();
      }
    } catch (err) {
      setStudentsError(err.response?.data?.message || "Failed to save students.");
    } finally {
      setStudentsSaving(false);
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
        subtitle="Create batches for courses, workshops, or hackathons. Assign a tutor, then manually add enrolled students to each batch."
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
                  {c.enrollmentCount != null ? ` (${c.enrollmentCount} enrolled)` : ""}
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
                  editingId === b._id || studentsBatchId === b._id
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
                    onClick={() =>
                      studentsBatchId === b._id ? closeStudentsPanel() : openStudentsPanel(b)
                    }
                    className="text-emerald-600 text-sm hover:underline"
                  >
                    {studentsBatchId === b._id ? "Close" : "Students"}
                  </button>
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

      {studentsBatchId && (
        <div className="glass-card p-6 mt-8">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2">
                <FiUsers className="text-brand-600" />
                Add students — {studentsBatch?.name}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Only students enrolled in {getBatchItemTitle(studentsBatch) || "this program"} can
                be added. Students are not added automatically on enrollment.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={selectAllEligible}>
                Select all
              </Button>
              <Button type="button" variant="outline" onClick={clearStudentSelection}>
                Clear
              </Button>
              <Button
                type="button"
                disabled={studentsSaving || studentsLoading}
                onClick={saveBatchStudents}
              >
                {studentsSaving ? "Saving..." : `Save (${selectedStudentIds.length})`}
              </Button>
              <Button type="button" variant="outline" onClick={closeStudentsPanel}>
                Cancel
              </Button>
            </div>
          </div>

          {studentsError && <p className="text-sm text-red-600 mb-3">{studentsError}</p>}
          {studentsLoading && <p className="text-sm text-slate-500">Loading eligible students...</p>}

          {!studentsLoading && eligibleStudents.length === 0 && (
            <p className="text-sm text-slate-500">
              No enrolled students found for this batch&apos;s course or workshop yet.
            </p>
          )}

          {!studentsLoading && eligibleStudents.length > 0 && (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto">
              {eligibleStudents.map((s) => (
                <li key={s._id}>
                  <label className="flex items-start gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(s._id)}
                      onChange={() => toggleStudent(s._id)}
                      className="mt-1"
                    />
                    <span className="min-w-0">
                      <span className="block font-medium truncate">{s.name || "—"}</span>
                      <span className="block text-xs text-slate-500 truncate">{s.email}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default BatchesPage;
