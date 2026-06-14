import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import { chatService } from "../../services/chatService";
import Button from "../../components/common/Button";
import PageHeader from "../../components/admin/PageHeader";
import IndLearnVideoRoom from "../../components/video/IndLearnVideoRoom";

const SchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [batches, setBatches] = useState([]);
  const [activeClass, setActiveClass] = useState(null);
  const [video, setVideo] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
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
    if (activeClass?._id === id) {
      setActiveClass(null);
      setVideo(null);
    }
    load();
  };

  const handleJoin = async (schedule) => {
    setActiveClass(schedule);
    const r = await chatService.joinLiveClass(schedule._id);
    if (r.success) {
      setVideo(r.data);
      load();
    }
  };

  const selectedBatch = batches.find((b) => b._id === form.batch);
  const batchStudentCount = selectedBatch?.students?.length ?? 0;

  return (
    <div>
      <PageHeader
        title="Class Schedule"
        subtitle="Schedule classes for a batch — all batch students, tutor, and you are added automatically."
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
                {b.name} — {b.course?.title} ({b.students?.length || 0} students)
              </option>
            ))}
          </select>
          {form.batch && (
            <p className="text-xs text-slate-500">
              {batchStudentCount} student{batchStudentCount === 1 ? "" : "s"} will be added to this
              class, plus the batch tutor and you.
            </p>
          )}
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
            placeholder="Optional external link (Google Meet, etc.)"
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
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="font-bold text-lg mb-4">Upcoming Classes</h2>
            <ul className="space-y-3 max-h-[400px] overflow-y-auto">
              {schedules.map((s) => (
                <li key={s._id} className="p-4 rounded-xl border border-brand-100">
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-sm text-slate-500">
                    {s.batch?.name} · {new Date(s.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-slate-500">
                    {s.startTime}–{s.endTime} · Tutor: {s.tutor?.name || "—"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 capitalize">
                    Status: {s.status} · {s.participants?.length || 0} participants
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button type="button" onClick={() => handleJoin(s)}>
                      {s.status === "scheduled" ? "Start & join" : "Join class"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s._id)}
                      className="text-red-500 text-xs hover:underline self-center"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-2 min-h-[320px] flex flex-col">
            {video?.roomId ? (
              <>
                <p className="p-3 font-semibold text-sm">{activeClass?.title}</p>
                <IndLearnVideoRoom
                  roomId={video.roomId || video.roomName}
                  displayName={user.name}
                  iceServers={video.iceServers}
                  className="flex-1 min-h-[280px]"
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 p-6 text-center text-sm">
                Select a class and click Start & join to enter the video room.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
