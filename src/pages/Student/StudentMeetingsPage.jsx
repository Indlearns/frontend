import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { studentService } from "../../services/studentService";
import Button from "../../components/common/Button";

const StudentMeetingsPage = () => {
  const [tutors, setTutors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({
    tutorId: "",
    batchId: "",
    type: "doubt",
    title: "",
    message: "",
  });

  const load = () => {
    studentService.getTutors().then((r) => r.success && setTutors(r.data));
    studentService.getMeetingRequests().then((r) => r.success && setRequests(r.data));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tutor = tutors.find((t) => t._id === form.tutorId);
    await studentService.requestMeeting({
      tutorId: form.tutorId,
      batchId: form.batchId || tutor?.batchId,
      type: form.type,
      title: form.title,
      message: form.message,
    });
    setForm({ tutorId: "", batchId: "", type: "doubt", title: "", message: "" });
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Request doubt / meeting</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Ask your tutor for help. When they accept, use Messages for chat and video.
      </p>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-3 max-w-lg mb-8">
        <select
          required
          value={form.tutorId}
          onChange={(e) => {
            const t = tutors.find((x) => x._id === e.target.value);
            setForm({
              ...form,
              tutorId: e.target.value,
              batchId: t?.batchId || "",
            });
          }}
          className="input-field"
        >
          <option value="">Select tutor</option>
          {tutors.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name} — {t.batchName}
            </option>
          ))}
        </select>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="input-field"
        >
          <option value="doubt">Doubt clearance</option>
          <option value="meeting">Meeting</option>
        </select>
        <input
          required
          placeholder="Subject"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="input-field"
        />
        <textarea
          placeholder="Describe your doubt or meeting need"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="input-field min-h-[80px]"
        />
        <Button type="submit">Send request</Button>
      </form>

      <h2 className="font-bold mb-3">Your requests</h2>
      <div className="space-y-3">
        {requests.map((r) => (
          <div key={r._id} className="glass-card p-4">
            <p className="font-medium">{r.title}</p>
            <p className="text-sm text-slate-500 capitalize">
              {r.status} · {r.type} · {r.tutor?.name}
            </p>
            {r.status === "accepted" && (
              <Link to="/student/chat" className="text-sm text-brand-600 mt-2 inline-block">
                Open chat & video →
              </Link>
            )}
          </div>
        ))}
        {!requests.length && <p className="text-slate-500 text-sm">No requests yet.</p>}
      </div>
    </div>
  );
};

export default StudentMeetingsPage;
