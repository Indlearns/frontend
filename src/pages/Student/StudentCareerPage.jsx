import { useEffect, useState } from "react";
import { studentService } from "../../services/studentService";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";

const StudentCareerPage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    studentService.getCareerJobs().then((r) => r.success && setData(r.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Career</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Jobs matched to your enrolled courses and skills. Complete more of your program to
        strengthen your profile.
      </p>
      {data?.courseCategories?.length > 0 && (
        <p className="text-sm text-brand-600 mb-6">
          Matching: {data.courseCategories.join(", ")}
        </p>
      )}
      <div className="space-y-4">
        {data?.jobs?.map((job) => (
          <div key={job._id} className="glass-card p-5">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <h2 className="font-bold text-lg">{job.title}</h2>
                <p className="text-brand-600 text-sm">{job.company}</p>
              </div>
              <span className="text-xs capitalize px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                {job.jobType}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">{job.location}</p>
            {job.description && <p className="text-sm mt-3">{job.description}</p>}
            {job.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {job.skills.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/50"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
            {job.applyLink && (
              <a
                href={job.applyLink}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-4 text-sm font-medium text-brand-600"
              >
                Apply externally →
              </a>
            )}
          </div>
        ))}
        {!data?.jobs?.length && <p className="text-slate-500">No jobs listed yet.</p>}
      </div>
      <Link to="/student/resume" className="inline-block mt-8">
        <Button variant="outline">Build resume from progress</Button>
      </Link>
    </div>
  );
};

export default StudentCareerPage;
