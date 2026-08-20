import { useState } from "react";
import { FiChevronDown, FiChevronUp, FiExternalLink, FiMapPin } from "react-icons/fi";
import RichDescription from "../../components/common/RichDescription";

const jobTypeLabel = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  internship: "Internship",
  contract: "Contract",
};

const JobListingCard = ({ job }) => {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = Boolean(job.description?.trim()) || (job.skills?.length ?? 0) > 0;

  return (
    <article className="glass-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
            <h2 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white leading-snug">
              {job.title}
            </h2>
            <span className="text-xs font-medium capitalize px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
              {jobTypeLabel[job.jobType] || job.jobType}
            </span>
          </div>

          {job.company && (
            <p className="text-brand-600 font-medium text-sm mt-1">{job.company}</p>
          )}

          {job.location && (
            <p className="text-sm text-slate-500 mt-2 flex items-center gap-1.5">
              <FiMapPin size={14} className="shrink-0" />
              {job.location}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-stretch shrink-0">
          {job.applyLink && (
            <a
              href={job.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors whitespace-nowrap"
            >
              Apply now
              <FiExternalLink size={15} />
            </a>
          )}
          {hasDetails && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-brand-200 dark:border-brand-700 text-sm font-medium text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors whitespace-nowrap"
            >
              {expanded ? (
                <>
                  See less
                  <FiChevronUp size={16} />
                </>
              ) : (
                <>
                  See more
                  <FiChevronDown size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {expanded && hasDetails && (
        <div className="mt-5 pt-5 border-t border-brand-100 dark:border-brand-800 space-y-4">
          {job.description && (
            <div className="max-h-[480px] overflow-y-auto pr-1">
              <RichDescription text={job.description} className="text-sm" />
            </div>
          )}
          {job.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2">
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
        </div>
      )}
    </article>
  );
};

export default JobListingCard;
