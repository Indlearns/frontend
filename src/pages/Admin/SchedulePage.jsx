import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import Button from "../../components/common/Button";
import PageHeader from "../../components/admin/PageHeader";

const SchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState({
    batch: "",
    title: "",
    date: "",
    startTime: "09:00",
    endTime: "11:00",
    meetLink: "",
    notes: "",
  });

  const load = async () => {
    const [s, b] = await Promise.all([
      adminService.getSchedules(),
      adminService.getBatches(),
    ]);
    if (s.success) setSchedules(s.data);
    if (b.success) setBatches(b.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await adminService.createSchedule(form);
    setForm({
      batch: "",
      title: "",
      date: "",
      startTime: "09:00",
      endTime: "11:00",
      meetLink: "",
      notes: "",
    });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this class?")) return;
    await adminService.deleteSchedule(id);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Class Schedule"
        subtitle="Schedule daily classes for each batch."
      />
      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <h2 className="font-bold text-lg">Schedule Class</h2>
          <select
            required
            value={form.batch}
            onChange={(e) => setForm({ ...form, batch: e.target.value })}
            className="input-field"
          >
            <option value="">Select batch</option>
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name} — {b.course?.title}
              </option>
            ))}
          </select>
          <input
            required
            placeholder="Class title (e.g. React Hooks)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input-field"
          />
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="input-field"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              className="input-field"
            />
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              className="input-field"
            />
          </div>
          <input
            placeholder="Live class link"
            value={form.meetLink}
            onChange={(e) => setForm({ ...form, meetLink: e.target.value })}
            className="input-field"
          />
          <textarea
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="input-field"
          />
          <Button type="submit">Add to Schedule</Button>
        </form>
        <div className="glass-card p-6">
          <h2 className="font-bold text-lg mb-4">Upcoming Classes</h2>
          <ul className="space-y-3 max-h-[500px] overflow-y-auto">
            {schedules.map((s) => (
              <li key={s._id} className="p-4 rounded-xl border border-brand-100">
                <p className="font-semibold">{s.title}</p>
                <p className="text-sm text-slate-500">
                  {s.batch?.name} · {new Date(s.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-slate-500">
                  {s.startTime}–{s.endTime} · Tutor: {s.tutor?.name || "—"}
                </p>
                {s.meetLink && (
                  <a
                    href={s.meetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-brand-600 hover:underline"
                  >
                    Join link
                  </a>
                )}
                <button
                  onClick={() => handleDelete(s._id)}
                  className="text-red-500 text-xs mt-2 hover:underline block"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
