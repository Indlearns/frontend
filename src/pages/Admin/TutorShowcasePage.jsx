import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import Button from "../../components/common/Button";
import PageHeader from "../../components/admin/PageHeader";
import { getImageUrl } from "../../utils/media";

const emptyForm = () => ({
  name: "",
  experience: "",
  description: "",
  sortOrder: "0",
  isActive: true,
});

const TutorShowcasePage = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const r = await adminService.getTutorShowcase();
    if (r.success) setItems(r.data);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
    setImageFile(null);
    setPreview("");
    setRemoveImage(false);
    setError("");
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      experience: item.experience,
      description: item.description,
      sortOrder: String(item.sortOrder ?? 0),
      isActive: item.isActive,
    });
    setImageFile(null);
    setPreview(item.imageUrl ? getImageUrl(item.imageUrl) : "");
    setRemoveImage(false);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setImageFile(file || null);
    setRemoveImage(false);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else if (editingId) {
      const current = items.find((i) => i._id === editingId);
      setPreview(current?.imageUrl ? getImageUrl(current.imageUrl) : "");
    } else {
      setPreview("");
    }
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("experience", form.experience);
    fd.append("description", form.description);
    fd.append("sortOrder", String(form.sortOrder || 0));
    fd.append("isActive", String(form.isActive));
    if (imageFile) fd.append("image", imageFile);
    if (removeImage) fd.append("removeImage", "true");
    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fd = buildFormData();
      const r = editingId
        ? await adminService.updateTutorShowcase(editingId, fd)
        : await adminService.createTutorShowcase(fd);
      if (r.success) {
        resetForm();
        load();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save showcase entry");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (item) => {
    const fd = new FormData();
    fd.append("isActive", String(!item.isActive));
    await adminService.updateTutorShowcase(item._id, fd);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this tutor showcase entry?")) return;
    if (editingId === id) resetForm();
    await adminService.deleteTutorShowcase(id);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Tutor showcase"
        subtitle="Manually add tutor profiles for the homepage testimonial section. Upload a photo, name, experience, and description — not linked to tutor login accounts."
      />

      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <h2 className="font-semibold text-lg">
            {editingId ? "Edit showcase" : "New showcase entry"}
          </h2>
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <label className="block text-sm font-medium mb-1">Tutor photo</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              className="input-field file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-brand-100 file:text-brand-700"
            />
            <p className="text-xs text-slate-500 mt-1">JPG, PNG, WebP or GIF — max 5 MB.</p>
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-3 w-20 h-20 rounded-full object-cover border-2 border-brand-200"
              />
            )}
            {editingId && preview && !imageFile && (
              <button
                type="button"
                onClick={() => {
                  setRemoveImage(true);
                  setPreview("");
                  setImageFile(null);
                }}
                className="block mt-2 text-xs text-red-600 hover:underline"
              >
                Remove current photo
              </button>
            )}
            {editingId && !imageFile && !removeImage && (
              <p className="text-xs text-slate-500 mt-1">Leave empty to keep the current photo.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tutor name</label>
            <input
              className="input-field"
              placeholder="e.g. Rahul Sharma"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Experience</label>
            <input
              className="input-field"
              placeholder="e.g. 8+ years · Full Stack & DSA"
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description / testimonial</label>
            <textarea
              className="input-field min-h-[120px]"
              placeholder="What students should know about this tutor..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Display order</label>
            <input
              type="number"
              className="input-field"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            />
            <p className="text-xs text-slate-500 mt-1">Lower numbers appear first on the homepage.</p>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Show on homepage
          </label>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update" : "Add to showcase"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>

        <div className="glass-card p-6">
          <h2 className="font-semibold text-lg mb-4">Showcase entries ({items.length})</h2>
          {items.length === 0 ? (
            <p className="text-sm text-slate-500">No entries yet. Add one to show on the homepage.</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="p-4 rounded-xl border border-brand-100 dark:border-brand-900/50"
                >
                  <div className="flex gap-3">
                    {item.imageUrl ? (
                      <img
                        src={getImageUrl(item.imageUrl)}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover shrink-0 border border-brand-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-brand-100 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-brand-600 mt-0.5">{item.experience}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-3">
                            “{item.description}”
                          </p>
                          <p className="text-xs text-slate-400 mt-2">
                            Order: {item.sortOrder ?? 0}
                            {!item.isActive && " · Hidden"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleActive(item)}
                            className={`text-xs px-2 py-1 rounded-full ${
                              item.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {item.isActive ? "Visible" : "Hidden"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="text-xs text-brand-600 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item._id)}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorShowcasePage;
