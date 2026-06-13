import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import Button from "../../components/common/Button";
import PageHeader from "../../components/admin/PageHeader";
import { formatPrice, formatRegistrationCloseDate } from "../../utils/media";

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

  const load = async () => {
    const r = await adminService.getWorkshops();
    if (r.success) setWorkshops(r.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await adminService.createWorkshop({
      ...form,
      price: Number(form.price) || 0,
    });
    setForm(emptyForm);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Workshops & Hackathons"
        subtitle="Set price in INR. Paid events use Razorpay at registration. Use Hackathon type for /events page."
      />
      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <h2 className="font-bold text-lg">Create event</h2>
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
            className="input-field"
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
              placeholder="0 for free"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="input-field"
            />
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
            placeholder="Meet / event link (shown after payment)"
            value={form.meetLink}
            onChange={(e) => setForm({ ...form, meetLink: e.target.value })}
            className="input-field"
          />
          <Button type="submit">Create event</Button>
        </form>
        <div className="glass-card p-6">
          <h2 className="font-bold text-lg mb-4">All events ({workshops.length})</h2>
          <ul className="space-y-3 max-h-[600px] overflow-y-auto">
            {workshops.map((w) => (
              <li key={w._id} className="p-4 rounded-xl border border-brand-100">
                <p className="font-semibold">{w.title}</p>
                <p className="text-sm text-slate-500 capitalize">
                  {w.eventType} · {formatPrice(w.price, w.currency)}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(w.date).toLocaleDateString()} · {w.startTime}–{w.endTime}
                  {w.registrationCloseDate &&
                    ` · Closes ${formatRegistrationCloseDate(w.registrationCloseDate)}`}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WorkshopsPage;
