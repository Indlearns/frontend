import { useEffect, useMemo, useState } from "react";
import { adminService } from "../../services/adminService";
import { chatService } from "../../services/chatService";
import Button from "../../components/common/Button";
import PageHeader from "../../components/admin/PageHeader";
import IndLearnVideoRoom from "../../components/video/IndLearnVideoRoom";
import { WEEKDAYS, previewScheduleDates } from "../../utils/scheduleDates";

const emptyForm = {
  batch: "",
  title: "",
  mode: "range",
  date: "",
  fromDate: "",
  toDate: "",
  weekdays: [1, 2, 3, 4, 5],
  extraDate: "",
  extraDates: [],
  startTime: "09:00",
  endTime: "11:00",
  meetLink: "",
  notes: "",
};

const SchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [batches, setBatches] = useState([]);
  const [activeClass, setActiveClass] = useState(null);
  const [video, setVideo] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const previewDates = useMemo(() => previewScheduleDates(form), [form]);

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

  const toggleWeekday = (value) => {
    setForm((f) => {
      const has = f.weekdays.includes(value);
      return {
        ...f,
        weekdays: has ? f.weekdays.filter((d) => d !== value) : [...f.weekdays, value].sort(),
      };
    });
  };

  const addExtraDate = () => {
    if (!form.extraDate) return;
    if (form.extraDates.includes(form.extraDate)) return;
    setForm((f) => ({
      ...f,
      extraDates: [...f.extraDates, f.extraDate].sort(),
      extraDate: "",
    }));
  };

  const buildPayload = () => {
    const base = {
      batch: form.batch,
      title: form.title,
      startTime: form.startTime,
      endTime: form.endTime,
      meetLink: form.meetLink,
      notes: form.notes,
    };

    if (form.mode === "single") {
      return { ...base, date: form.date };
    }

    return {
      ...base,
      fromDate: form.fromDate,
      toDate: form.toDate,
      weekdays: form.weekdays,
      dates: previewDates,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (previewDates.length === 0) {
        setError("Select at least one class date.");
        return;
      }

      const r = await adminService.createSchedule(buildPayload());
      if (r.success) {
        setMessage(r.message || `${r.count} class(es) scheduled.`);
        setForm(emptyForm);
        load();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not schedule classes.");
    } finally {
      setLoading(false);
    }
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

  const handleDeleteGroup = async (groupId) => {
    if (!confirm("Delete ALL classes in this series?")) return;
    await adminService.deleteScheduleGroup(groupId);
    setActiveClass(null);
    setVideo(null);
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

  const upcoming = schedules.filter(
    (s) => s.status !== "completed" && s.status !== "cancelled"
  );

  return (
    <div>
      <PageHeader
        title="Class Schedule"
        subtitle="Schedule one day or a full month — same time every day. Batch students, tutor, and you are added automatically."
      />
      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <h2 className="font-bold text-lg">Schedule classes</h2>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {message && <p className="text-brand-600 text-sm">{message}</p>}

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
              {batchStudentCount} student{batchStudentCount === 1 ? "" : "s"} + tutor + you on every
              session.
            </p>
          )}

          <input
            required
            placeholder="Class title (e.g. React — Morning batch)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input-field"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, mode: "single" })}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border ${
                form.mode === "single"
                  ? "bg-brand-600 text-white border-brand-600"
                  : "border-brand-200 text-slate-600"
              }`}
            >
              Single day
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, mode: "range" })}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border ${
                form.mode === "range"
                  ? "bg-brand-600 text-white border-brand-600"
                  : "border-brand-200 text-slate-600"
              }`}
            >
              Date range (month)
            </button>
          </div>

          {form.mode === "single" ? (
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="input-field"
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">From</label>
                  <input
                    type="date"
                    required
                    value={form.fromDate}
                    onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">To</label>
                  <input
                    type="date"
                    required
                    value={form.toDate}
                    onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-2">Days of week</p>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleWeekday(d.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm border ${
                        form.weekdays.includes(d.value)
                          ? "bg-brand-600 text-white border-brand-600"
                          : "border-brand-200 text-slate-600"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">Add extra date (optional)</p>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={form.extraDate}
                    onChange={(e) => setForm({ ...form, extraDate: e.target.value })}
                    className="input-field flex-1"
                  />
                  <Button type="button" variant="outline" onClick={addExtraDate}>
                    Add
                  </Button>
                </div>
                {form.extraDates.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.extraDates.map((d) => (
                      <span
                        key={d}
                        className="text-xs bg-brand-100 text-brand-800 px-2 py-1 rounded-lg flex items-center gap-1"
                      >
                        {d}
                        <button
                          type="button"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              extraDates: f.extraDates.filter((x) => x !== d),
                            }))
                          }
                          className="text-brand-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div>
            <p className="text-xs text-slate-500 mb-1">Same time for every session</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="time"
                required
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="input-field"
              />
              <input
                type="time"
                required
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {previewDates.length > 0 && (
            <div className="rounded-xl bg-brand-50 dark:bg-brand-950/30 p-3 text-sm">
              <p className="font-medium text-brand-800 dark:text-brand-200">
                {previewDates.length} class{previewDates.length === 1 ? "" : "es"} at{" "}
                {form.startTime}–{form.endTime}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                {previewDates.slice(0, 5).join(", ")}
                {previewDates.length > 5 ? ` … +${previewDates.length - 5} more` : ""}
              </p>
            </div>
          )}

          <input
            placeholder="Optional external link"
            value={form.meetLink}
            onChange={(e) => setForm({ ...form, meetLink: e.target.value })}
            className="input-field"
          />
          <textarea
            placeholder="Notes (same for all sessions)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="input-field min-h-[80px]"
          />
          <Button type="submit" disabled={loading || previewDates.length === 0}>
            {loading
              ? "Scheduling..."
              : previewDates.length > 1
                ? `Schedule ${previewDates.length} classes`
                : "Schedule class"}
          </Button>
        </form>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="font-bold text-lg mb-4">Upcoming classes ({upcoming.length})</h2>
            <ul className="space-y-3 max-h-[400px] overflow-y-auto">
              {upcoming.map((s) => (
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
                    {s.scheduleGroupId && (
                      <button
                        type="button"
                        onClick={() => handleDeleteGroup(s.scheduleGroupId)}
                        className="text-red-600 text-xs hover:underline self-center"
                      >
                        Delete series
                      </button>
                    )}
                  </div>
                </li>
              ))}
              {!upcoming.length && (
                <p className="text-sm text-slate-500">No upcoming classes yet.</p>
              )}
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
