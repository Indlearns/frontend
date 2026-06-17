import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import Button from "../../components/common/Button";
import PageHeader from "../../components/admin/PageHeader";
import CourseEnrollmentsPanel from "../../components/admin/CourseEnrollmentsPanel";
import {
  getImageUrl,
  formatPrice,
  formatEnrollmentCloseDate,
  toDateInputValue,
  isFreePrice,
} from "../../utils/media";

const emptyForm = {
  title: "",
  description: "",
  category: "",
  duration: "",
  enrollmentCloseDate: "",
  status: "draft",
  price: "",
};

const statusLabel = (status) => {
  if (status === "published") return "open";
  return status;
};

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [enrollmentsCourseId, setEnrollmentsCourseId] = useState(null);
  const [filter, setFilter] = useState("all");

  const filteredCourses = courses.filter((c) => {
    if (filter === "free") return isFreePrice(c);
    if (filter === "paid") return !isFreePrice(c);
    return true;
  });

  const load = async () => {
    const r = await adminService.getCourses();
    if (r.success) setCourses(r.data);
  };

  useEffect(() => {
    load();
  }, []);

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("category", form.category);
    fd.append("duration", form.duration);
    fd.append("enrollmentCloseDate", form.enrollmentCloseDate || "");
    fd.append("status", form.status);
    fd.append("price", String(form.price || 0));
    if (imageFile) fd.append("image", imageFile);
    return fd;
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setImageFile(null);
    setPreview("");
    setError("");
  };

  const startEdit = (course) => {
    setEditingId(course._id);
    setForm({
      title: course.title || "",
      description: course.description || "",
      category: course.category || "",
      duration: course.duration || "",
      enrollmentCloseDate: toDateInputValue(course.enrollmentCloseDate),
      status: course.status || "draft",
      price: course.price != null ? String(course.price) : "",
    });
    setImageFile(null);
    setPreview(course.thumbnail ? getImageUrl(course.thumbnail) : "");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setImageFile(file || null);
    if (file) setPreview(URL.createObjectURL(file));
    else if (editingId) {
      const course = courses.find((c) => c._id === editingId);
      setPreview(course?.thumbnail ? getImageUrl(course.thumbnail) : "");
    } else setPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = editingId
        ? await adminService.updateCourse(editingId, buildFormData())
        : await adminService.createCourse(buildFormData());
      if (r.success) {
        resetForm();
        load();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save course");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this course?")) return;
    await adminService.deleteCourse(id);
    if (editingId === id) resetForm();
    load();
  };

  return (
    <div>
      <PageHeader
        title="Courses"
        subtitle="Create, edit, and delete courses — free (price 0) and paid. Open courses can be edited anytime."
      />

      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold text-lg">
              {editingId ? "Edit course" : "Create course"}
            </h2>
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

          <div>
            <label className="block text-sm font-medium mb-1">Course image</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              className="input-field"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-2 h-32 w-full object-cover rounded-xl border border-brand-100"
              />
            )}
            {editingId && !imageFile && (
              <p className="text-xs text-slate-500 mt-1">Leave empty to keep the current image.</p>
            )}
            <p className="text-xs text-slate-500 mt-1">
              JPG, PNG, WebP or GIF · max 5 MB · recommended 1280×720 px. Images are stored permanently until you delete the course.
            </p>
          </div>

          <input
            required
            placeholder="Course heading / title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input-field"
          />
          <textarea
            required
            placeholder="Description — use headings (# Title or Title:), bullets (- item), numbered lists (1. item)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-field min-h-[100px]"
          />
          <input
            placeholder="Category (e.g. Web Development)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="input-field"
          />
          <input
            placeholder="Duration (e.g. 12 weeks)"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            className="input-field"
          />
          <div>
            <label className="block text-sm font-medium mb-1">Price (INR)</label>
            <input
              type="number"
              min={0}
              step={1}
              placeholder="0 for free course"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="input-field"
            />
            <p className="text-xs text-slate-500 mt-1">
              Use 0 for a free course. Paid courses use Razorpay at checkout.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Enrollment close date</label>
            <input
              type="date"
              value={form.enrollmentCloseDate}
              onChange={(e) => setForm({ ...form, enrollmentCloseDate: e.target.value })}
              className="input-field"
            />
            <p className="text-xs text-slate-500 mt-1">
              Last day students can enroll. Leave empty for no deadline.
            </p>
          </div>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="input-field"
          >
            <option value="draft">Draft</option>
            <option value="published">Open (visible on site)</option>
            <option value="archived">Archived</option>
          </select>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : editingId ? "Save changes" : "Create course"}
          </Button>
        </form>

        <div className="glass-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="font-bold text-lg">All courses ({filteredCourses.length})</h2>
            <div className="flex gap-1 text-sm">
              {["all", "free", "paid"].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1 rounded-lg capitalize ${
                    filter === key
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
          <ul className="space-y-4 max-h-[600px] overflow-y-auto">
            {filteredCourses.map((c) => (
              <li
                key={c._id}
                className={`p-4 rounded-xl border flex flex-wrap gap-3 ${
                  editingId === c._id
                    ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/20"
                    : "border-brand-100 dark:border-brand-800"
                }`}
              >
                {c.thumbnail ? (
                  <img
                    src={getImageUrl(c.thumbnail)}
                    alt=""
                    className="w-20 h-20 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-brand-100 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{c.title}</p>
                  <p className="text-sm text-slate-500 line-clamp-2">{c.description}</p>
                  <p className="text-sm text-brand-600 font-medium mt-1">
                    {formatPrice(c.price, c.currency)}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 capitalize">
                      {statusLabel(c.status)}
                    </span>
                    {isFreePrice(c) && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        Free
                      </span>
                    )}
                    {c.enrollmentCloseDate && (
                      <span className="text-xs text-slate-500">
                        Closes {formatEnrollmentCloseDate(c.enrollmentCloseDate)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 h-fit shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setEnrollmentsCourseId((id) => (id === c._id ? null : c._id))
                    }
                    className="text-emerald-600 text-sm hover:underline"
                  >
                    {enrollmentsCourseId === c._id ? "Hide" : "Enrollments"}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(c)}
                    className="text-brand-600 text-sm hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c._id)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Delete
                  </button>
                </div>
                {enrollmentsCourseId === c._id && (
                  <div className="w-full basis-full mt-2">
                    <CourseEnrollmentsPanel
                      courseId={c._id}
                      courseTitle={c.title}
                      onClose={() => setEnrollmentsCourseId(null)}
                      compact
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
