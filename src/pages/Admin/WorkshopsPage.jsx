import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import Button from "../../components/common/Button";
import PageHeader from "../../components/admin/PageHeader";
import {
  formatPrice,
  formatRegistrationCloseDate,
  isFreePrice,
  toDateInputValue,
} from "../../utils/media";

const emptyForm = {
  title: "",
  description: "",
  eventType: "workshop",
  date: "",
  startTime: "10:00",
  endTime: "12:00",
  meetLink: "",
  status: "upcoming",
  price: "",
  registrationCloseDate: "",
};

const WorkshopsPage = () => {
  const [workshops, setWorkshops] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const r = await adminService.getWorkshops();
    if (r.success) setWorkshops(r.data);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  };

  const startEdit = (workshop) => {
    setEditingId(workshop._id);
    setForm({
      title: workshop.title || "",
      description: workshop.description || "",
      eventType: workshop.eventType || "workshop",
      date: toDateInputValue(workshop.date),
      startTime: workshop.startTime || "10:00",
      endTime: workshop.endTime || "12:00",
      meetLink: workshop.meetLink || "",
      status: workshop.status || "upcoming",
      price: workshop.price != null ? String(workshop.price) : "",
      registrationCloseDate: toDateInputValue(workshop.registrationCloseDate),
    });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
      };
      const r = editingId
        ? await adminService.updateWorkshop(editingId, payload)
        : await adminService.createWorkshop(payload);
      if (r.success) {
        resetForm();
        load();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this event?")) return;
    await adminService.deleteWorkshop(id);
    if (editingId === id) resetForm();
    load();
  };

  return (
    <div>
      <PageHeader
        title="Workshops & Hackathons"
        subtitle="Create, edit, and delete free or paid events. Price 0 = free registration."
      />
      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold text-lg">{editingId ? "Edit event" : "Create event"}</h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-slate-500 hover:text-brand-600"
              >
                Cancel edit
              </button>
            )}
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
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
          <select
            value={form.eventType}
            onChange={(e) => setForm({ ...form, eventType: e.target.value })}
            className="input-field"
          >
            <option value="workshop">Workshop</option>
            <option value="hackathon">Hackathon</option>
          </select>
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
          <div>
            <label className="block text-sm font-medium mb-1">Price (INR)</label>
            <input
              type="number"
              min={0}
              step={1}
              placeholder="0 for free event"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="input-field"
            />
            <p className="text-xs text-slate-500 mt-1">Use 0 for a free workshop or hackathon.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Registration close date</label>
            <input
              type="date"
              value={form.registrationCloseDate}
              onChange={(e) => setForm({ ...form, registrationCloseDate: e.target.value })}
              className="input-field"
            />
          </div>
          <input
            placeholder="Meet / event link"
            value={form.meetLink}
            onChange={(e) => setForm({ ...form, meetLink: e.target.value })}
            className="input-field"
          />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="input-field"
          >
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : editingId ? "Save changes" : "Create event"}
          </Button>
        </form>
        <div className="glass-card p-6">
          <h2 className="font-bold text-lg mb-4">All events ({workshops.length})</h2>
          <ul className="space-y-3 max-h-[600px] overflow-y-auto">
            {workshops.map((w) => (
              <li
                key={w._id}
                className={`p-4 rounded-xl border ${
                  editingId === w._id
                    ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/20"
                    : "border-brand-100"
                }`}
              >
                <p className="font-semibold">{w.title}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="text-sm text-slate-500 capitalize">{w.eventType}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isFreePrice(w)
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-brand-100 text-brand-700"
                    }`}
                  >
                    {formatPrice(w.price, w.currency)}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                    {w.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(w.date).toLocaleDateString()} · {w.startTime}–{w.endTime}
                  {w.registrationCloseDate &&
                    ` · Closes ${formatRegistrationCloseDate(w.registrationCloseDate)}`}
                </p>
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => startEdit(w)}
                    className="text-brand-600 text-sm hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(w._id)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {!workshops.length && (
              <p className="text-sm text-slate-500">No workshops or hackathons yet.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WorkshopsPage;
