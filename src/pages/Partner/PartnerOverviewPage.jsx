import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { partnerService } from "../../services/partnerService";
import Button from "../../components/common/Button";

const PartnerOverviewPage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    partnerService.getDashboard().then((r) => r.success && setData(r.data));
  }, []);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">Partner dashboard</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        Welcome{data?.company?.name ? `, ${data.company.name}` : ""}. Post jobs and review
        applicants from IndLearn students.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="glass-card p-5">
          <p className="text-sm text-slate-500">Active jobs</p>
          <p className="text-3xl font-bold text-brand-600">{data?.stats?.jobCount ?? "—"}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-slate-500">Total applications</p>
          <p className="text-3xl font-bold text-brand-600">{data?.stats?.applicationCount ?? "—"}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <Link to="/partner/jobs">
          <Button>Post a job</Button>
        </Link>
        <Link to="/partner/applications">
          <Button variant="outline">View applications</Button>
        </Link>
      </div>

      {data?.recentApplications?.length > 0 && (
        <div className="glass-card p-5">
          <h2 className="font-bold mb-4">Recent applications</h2>
          <ul className="space-y-3">
            {data.recentApplications.map((a) => (
              <li key={a._id} className="flex flex-wrap justify-between gap-2 text-sm border-b border-brand-100 pb-2 last:border-0">
                <span>
                  {a.student?.name} → {a.job?.title}
                </span>
                <span className="capitalize text-slate-500">{a.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PartnerOverviewPage;
