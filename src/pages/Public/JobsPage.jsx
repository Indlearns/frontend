import { useEffect, useState } from "react";
import { FiExternalLink, FiMapPin } from "react-icons/fi";
import { publicService } from "../../services/publicService";
import RichDescription from "../../components/common/RichDescription";
import { EmptyState } from "../../components/public/ContentCards";

const jobTypeLabel = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  internship: "Internship",
  contract: "Contract",
};

const PublicJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicService
      .getJobs()
      .then((r) => {
        if (r.success) setJobs(r.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="section-container py-12">
      <div className="max-w-3xl mb-8">
        <h1 className="font-display text-3xl lg:text-4xl font-bold">Public Jobs</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">
          Browse open roles from IndLearn and hiring partners. No login required — apply directly
          using the link on each listing.
        </p>
      </div>

      <div className="space-y-4 mt-8 max-w-4xl">
        {loading && <p className="text-slate-500">Loading jobs...</p>}

        {!loading &&
          jobs.map((job) => (
            <article key={job._id} className="glass-card p-6">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h2 className="font-bold text-xl">{job.title}</h2>
                  <p className="text-brand-600 font-medium mt-1">{job.company}</p>
                </div>
                <span className="text-xs capitalize px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 h-fit">
                  {jobTypeLabel[job.jobType] || job.jobType}
                </span>
              </div>

              {job.location && (
                <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                  <FiMapPin size={14} />
                  {job.location}
                </p>
              )}

              {job.description && (
                <div className="mt-3">
                  <RichDescription text={job.description} className="text-sm" />
                </div>
              )}

              {job.skills?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs px-2 py-1 rounded-full bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {job.applyLink && (
                <a
                  href={job.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
                >
                  Apply now
                  <FiExternalLink size={16} />
                </a>
              )}
            </article>
          ))}

        {!loading && !jobs.length && (
          <EmptyState
            title="No public jobs right now"
            hint="New openings are added regularly. Check back soon or explore our courses to build job-ready skills."
          />
        )}
      </div>
    </div>
  );
};

export default PublicJobsPage;
