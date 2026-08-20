import { useEffect, useState } from "react";
import { publicService } from "../../services/publicService";
import JobListingCard from "../../components/public/JobListingCard";
import { EmptyState } from "../../components/public/ContentCards";

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

      <div className="space-y-3 mt-8 max-w-4xl">
        {loading && <p className="text-slate-500">Loading jobs...</p>}

        {!loading && jobs.map((job) => <JobListingCard key={job._id} job={job} />)}

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
