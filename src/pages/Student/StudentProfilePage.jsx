import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { studentService } from "../../services/studentService";
import Button from "../../components/common/Button";

const emptyEdu = { school: "", degree: "", year: "", description: "" };
const emptyExp = { company: "", role: "", start: "", end: "", description: "" };

const StudentProfilePage = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    headline: "",
    summary: "",
    location: "",
    github: "",
    linkedin: "",
    portfolio: "",
    skills: "",
    education: [{ ...emptyEdu }],
    experience: [{ ...emptyExp }],
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    studentService.getProfile().then((r) => {
      if (!r.success) return;
      const { user, profile } = r.data;
      setForm({
        name: user?.name || "",
        phone: user?.phone || "",
        headline: profile?.headline || "",
        summary: profile?.summary || "",
        location: profile?.location || "",
        github: profile?.github || "",
        linkedin: profile?.linkedin || "",
        portfolio: profile?.portfolio || "",
        skills: (profile?.skills || []).join(", "),
        education: profile?.education?.length ? profile.education : [{ ...emptyEdu }],
        experience: profile?.experience?.length ? profile.experience : [{ ...emptyExp }],
      });
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    await studentService.updateProfile({
      name: form.name,
      phone: form.phone,
      headline: form.headline,
      summary: form.summary,
      location: form.location,
      github: form.github,
      linkedin: form.linkedin,
      portfolio: form.portfolio,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      education: form.education,
      experience: form.experience,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Profile</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Information here feeds your resume builder and career profile.
      </p>
      <form onSubmit={handleSave} className="space-y-4">
        <input
          className="input-field"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="input-field"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          className="input-field"
          placeholder="Headline (e.g. Aspiring Full Stack Developer)"
          value={form.headline}
          onChange={(e) => setForm({ ...form, headline: e.target.value })}
        />
        <textarea
          className="input-field min-h-[80px]"
          placeholder="Professional summary"
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
        />
        <input
          className="input-field"
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <input
          className="input-field"
          placeholder="Skills (comma separated)"
          value={form.skills}
          onChange={(e) => setForm({ ...form, skills: e.target.value })}
        />
        <input
          className="input-field"
          placeholder="GitHub URL"
          value={form.github}
          onChange={(e) => setForm({ ...form, github: e.target.value })}
        />
        <input
          className="input-field"
          placeholder="LinkedIn URL"
          value={form.linkedin}
          onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
        />
        <input
          className="input-field"
          placeholder="Portfolio URL"
          value={form.portfolio}
          onChange={(e) => setForm({ ...form, portfolio: e.target.value })}
        />

        <h2 className="font-bold pt-4">Education</h2>
        {form.education.map((edu, i) => (
          <div key={i} className="space-y-2 p-4 rounded-xl border border-brand-100">
            <input
              className="input-field"
              placeholder="School"
              value={edu.school}
              onChange={(e) => {
                const education = [...form.education];
                education[i] = { ...edu, school: e.target.value };
                setForm({ ...form, education });
              }}
            />
            <input
              className="input-field"
              placeholder="Degree"
              value={edu.degree}
              onChange={(e) => {
                const education = [...form.education];
                education[i] = { ...edu, degree: e.target.value };
                setForm({ ...form, education });
              }}
            />
            <input
              className="input-field"
              placeholder="Year"
              value={edu.year}
              onChange={(e) => {
                const education = [...form.education];
                education[i] = { ...edu, year: e.target.value };
                setForm({ ...form, education });
              }}
            />
          </div>
        ))}

        <h2 className="font-bold pt-4">Experience</h2>
        {form.experience.map((exp, i) => (
          <div key={i} className="space-y-2 p-4 rounded-xl border border-brand-100">
            <input
              className="input-field"
              placeholder="Company"
              value={exp.company}
              onChange={(e) => {
                const experience = [...form.experience];
                experience[i] = { ...exp, company: e.target.value };
                setForm({ ...form, experience });
              }}
            />
            <input
              className="input-field"
              placeholder="Role"
              value={exp.role}
              onChange={(e) => {
                const experience = [...form.experience];
                experience[i] = { ...exp, role: e.target.value };
                setForm({ ...form, experience });
              }}
            />
          </div>
        ))}

        <Button type="submit">{saved ? "Saved!" : "Save profile"}</Button>
      </form>

      <div className="mt-10 pt-8 border-t border-brand-100">
        <h2 className="font-bold text-lg mb-3">My registrations</h2>
        <p className="text-sm text-slate-500 mb-4">
          Workshops and hackathons you have enrolled in.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/student/workshops">
            <Button type="button" variant="outline">
              My workshops
            </Button>
          </Link>
          <Link to="/student/hackathons">
            <Button type="button" variant="outline">
              My hackathons
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
