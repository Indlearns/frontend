import { useEffect, useState } from "react";
import { tutorService } from "../../services/tutorService";
import Button from "../../components/common/Button";

const TutorAssignmentsPage = () => {
  const [batches, setBatches] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [form, setForm] = useState({
    batch: "",
    title: "",
    description: "",
    instructions: "",
    dueDate: "",
    maxScore: 100,
    resourceUrl: "",
    resourceName: "",
  });
  const [gradeForm, setGradeForm] = useState({ score: "", feedback: "" });

  const loadBatches = () =>
    tutorService.getBatches().then((r) => r.success && setBatches(r.data));

  const loadAssignments = (batchId) =>
    tutorService.getAssignments(batchId).then((r) => r.success && setAssignments(r.data));

  useEffect(() => {
    loadBatches();
    loadAssignments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const attachments = form.resourceUrl
      ? [{ name: form.resourceName || "Resource", url: form.resourceUrl }]
      : [];
    await tutorService.createAssignment({
      batch: form.batch,
      title: form.title,
      description: form.description,
      instructions: form.instructions,
      dueDate: form.dueDate || undefined,
      maxScore: Number(form.maxScore),
      attachments,
    });
    setForm({
      batch: "",
      title: "",
      description: "",
      instructions: "",
      dueDate: "",
      maxScore: 100,
      resourceUrl: "",
      resourceName: "",
    });
    loadAssignments();
  };

  const openSubmissions = async (a) => {
    setSelected(a);
    const r = await tutorService.getSubmissions(a._id);
    if (r.success) setSubmissions(r.data);
  };

  const handleGrade = async (submissionId) => {
    if (!selected) return;
    await tutorService.gradeSubmission(selected._id, submissionId, {
      score: Number(gradeForm.score),
      feedback: gradeForm.feedback,
    });
    setGradeForm({ score: "", feedback: "" });
    openSubmissions(selected);
    loadAssignments();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this assignment?")) return;
    await tutorService.deleteAssignment(id);
    if (selected?._id === id) {
      setSelected(null);
      setSubmissions([]);
    }
    loadAssignments();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Assignments</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Create and share assignments for your batches. Grade student submissions.
      </p>

      <div className="grid xl:grid-cols-2 gap-8">
        <form onSubmit={handleCreate} className="glass-card p-6 space-y-3">
          <h2 className="font-bold">Add assignment</h2>
          <select
            required
            value={form.batch}
            onChange={(e) => setForm({ ...form, batch: e.target.value })}
            className="input-field"
          >
            <option value="">Select batch</option>
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input-field"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-field min-h-[80px]"
          />
          <textarea
            placeholder="Instructions for students"
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            className="input-field min-h-[60px]"
          />
          <input
            type="datetime-local"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="input-field"
          />
          <input
            type="number"
            min={1}
            placeholder="Max score"
            value={form.maxScore}
            onChange={(e) => setForm({ ...form, maxScore: e.target.value })}
            className="input-field"
          />
          <input
            placeholder="Resource link (PDF, Drive, etc.)"
            value={form.resourceUrl}
            onChange={(e) => setForm({ ...form, resourceUrl: e.target.value })}
            className="input-field"
          />
          <input
            placeholder="Resource label"
            value={form.resourceName}
            onChange={(e) => setForm({ ...form, resourceName: e.target.value })}
            className="input-field"
          />
          <Button type="submit">Publish assignment</Button>
        </form>

        <div className="glass-card p-6">
          <h2 className="font-bold mb-4">Your assignments</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {assignments.map((a) => (
              <div
                key={a._id}
                className={`p-3 rounded-xl border cursor-pointer ${
                  selected?._id === a._id ? "border-brand-500" : "border-brand-100"
                }`}
                onClick={() => openSubmissions(a)}
              >
                <p className="font-medium">{a.title}</p>
                <p className="text-xs text-slate-500">
                  {a.batch?.name}
                  {a.dueDate && ` · Due ${new Date(a.dueDate).toLocaleDateString()}`}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(a._id);
                  }}
                  className="text-xs text-red-600 mt-2"
                >
                  Delete
                </button>
              </div>
            ))}
            {!assignments.length && (
              <p className="text-sm text-slate-500">No assignments yet.</p>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <div className="glass-card p-6 mt-8">
          <h2 className="font-bold mb-2">Grade: {selected.title}</h2>
          <p className="text-sm text-slate-500 mb-4">Max score: {selected.maxScore}</p>
          <div className="space-y-4">
            {submissions.map((s) => (
              <div key={s._id} className="p-4 rounded-xl border border-brand-100">
                <p className="font-medium">
                  {s.student?.name} — <span className="capitalize">{s.status}</span>
                  {s.score != null && ` · ${s.score}/${selected.maxScore}`}
                </p>
                <p className="text-sm mt-2 whitespace-pre-wrap">{s.content || "(no text)"}</p>
                {s.attachmentUrl && (
                  <a
                    href={s.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-brand-600"
                  >
                    View attachment
                  </a>
                )}
                {s.feedback && (
                  <p className="text-sm text-slate-500 mt-2">Feedback: {s.feedback}</p>
                )}
                {s.status === "submitted" && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <input
                      type="number"
                      placeholder="Score"
                      className="input-field w-24"
                      value={gradeForm.score}
                      onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })}
                    />
                    <input
                      placeholder="Feedback"
                      className="input-field flex-1 min-w-[200px]"
                      value={gradeForm.feedback}
                      onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                    />
                    <Button type="button" onClick={() => handleGrade(s._id)}>
                      Save grade
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {!submissions.length && (
              <p className="text-sm text-slate-500">No submissions yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorAssignmentsPage;
