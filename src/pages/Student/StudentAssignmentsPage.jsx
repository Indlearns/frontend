import { useEffect, useState } from "react";
import { studentService } from "../../services/studentService";
import Button from "../../components/common/Button";

const StudentAssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [submitting, setSubmitting] = useState(null);
  const [form, setForm] = useState({ content: "", attachmentUrl: "" });

  const load = () =>
    studentService.getAssignments().then((r) => r.success && setAssignments(r.data));

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (id) => {
    await studentService.submitAssignment(id, form);
    setSubmitting(null);
    setForm({ content: "", attachmentUrl: "" });
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Assignments</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        View work from your tutor and submit answers.
      </p>
      <div className="space-y-4">
        {assignments.map((a) => (
          <div key={a._id} className="glass-card p-5">
            <h2 className="font-bold">{a.title}</h2>
            <p className="text-sm text-brand-600">{a.batch?.name}</p>
            {a.description && <p className="text-sm mt-2">{a.description}</p>}
            {a.instructions && (
              <p className="text-sm mt-2 text-slate-600">Instructions: {a.instructions}</p>
            )}
            {a.attachments?.map((att, i) => (
              <a
                key={i}
                href={att.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-brand-600 block mt-2"
              >
                {att.name || "Download resource"}
              </a>
            ))}
            {a.dueDate && (
              <p className="text-xs text-slate-500 mt-2">
                Due: {new Date(a.dueDate).toLocaleString()}
              </p>
            )}
            {a.mySubmission ? (
              <div className="mt-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm">
                <p className="capitalize font-medium">Status: {a.mySubmission.status}</p>
                {a.mySubmission.score != null && (
                  <p>
                    Score: {a.mySubmission.score} / {a.maxScore}
                  </p>
                )}
                {a.mySubmission.feedback && <p>Feedback: {a.mySubmission.feedback}</p>}
              </div>
            ) : submitting === a._id ? (
              <div className="mt-4 space-y-2">
                <textarea
                  className="input-field min-h-[80px]"
                  placeholder="Your answer"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                />
                <input
                  className="input-field"
                  placeholder="Link to file (Drive, etc.)"
                  value={form.attachmentUrl}
                  onChange={(e) => setForm({ ...form, attachmentUrl: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button type="button" onClick={() => handleSubmit(a._id)}>
                    Submit
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setSubmitting(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button type="button" className="mt-3" onClick={() => setSubmitting(a._id)}>
                Submit work
              </Button>
            )}
          </div>
        ))}
        {!assignments.length && (
          <p className="text-slate-500">No assignments published yet.</p>
        )}
      </div>
    </div>
  );
};

export default StudentAssignmentsPage;
