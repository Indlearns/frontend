import { useEffect, useMemo, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { publicService } from "../../services/publicService";
import JobListingCard from "../../components/public/JobListingCard";
import { EmptyState } from "../../components/public/ContentCards";
import { filterJobsByKeyword } from "../../utils/jobSearch";

const PublicJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    publicService
      .getJobs()
      .then((r) => {
        if (r.success) setJobs(r.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredJobs = useMemo(() => filterJobsByKeyword(jobs, search), [jobs, search]);
  const hasSearch = search.trim().length > 0;

  return (
    <div className="section-container py-12">
      <div className="max-w-3xl mb-8">
        <h1 className="font-display text-3xl lg:text-4xl font-bold">Public Jobs</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">
          Browse open roles from IndLearn and hiring partners. No login required — apply directly
          using the link on each listing.
        </p>
      </div>

      {!loading && jobs.length > 0 && (
        <div className="max-w-4xl mb-6">
          <label htmlFor="job-search" className="sr-only">
            Search jobs
          </label>
          <div className="relative">
            <FiSearch
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              aria-hidden
            />
            <input
              id="job-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, company, skills, or location..."
              className="input-field pl-11 pr-11"
              autoComplete="off"
            />
            {hasSearch && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Clear search"
              >
                <FiX size={18} />
              </button>
            )}
          </div>
          {hasSearch && (
            <p className="text-sm text-slate-500 mt-2">
              {filteredJobs.length} job{filteredJobs.length === 1 ? "" : "s"} found
            </p>
          )}
        </div>
      )}

      <div className="space-y-3 mt-2 max-w-4xl">
        {loading && <p className="text-slate-500">Loading jobs...</p>}

        {!loading && filteredJobs.map((job) => <JobListingCard key={job._id} job={job} />)}

        {!loading && !jobs.length && (
          <EmptyState
            title="No public jobs right now"
            hint="New openings are added regularly. Check back soon or explore our courses to build job-ready skills."
          />
        )}

        {!loading && jobs.length > 0 && !filteredJobs.length && (
          <EmptyState
            title="No matching jobs"
            hint={`Nothing matched "${search.trim()}". Try a different keyword such as a job title, company, skill, or location.`}
          />
        )}
      </div>
    </div>
  );
};

export default PublicJobsPage;
