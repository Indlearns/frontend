import { useEffect, useState } from "react";
import { partnerService } from "../../services/partnerService";

const statusOptions = ["applied", "reviewing", "shortlisted", "rejected", "hired"];

const PartnerApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const load = () => {
    partnerService.getApplications().then((r) => r.success && setApplications(r.data));
  };

  useEffect(() => {
    load();
  }, []);

  const openDetail = async (id) => {
    setSelected(id);
    setLoadingDetail(true);
    const r = await partnerService.getApplication(id);
    if (r.success) setDetail(r.data);
    setLoadingDetail(false);
  };

  const updateStatus = async (id, status) => {
    await partnerService.updateApplicationStatus(id, status);
    load();
    if (selected === id) openDetail(id);
  };

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Student applications</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {applications.map((a) => (
            <button
              key={a._id}
              type="button"
              onClick={() => openDetail(a._id)}
              className={`w-full text-left p-4 rounded-xl border transition-colors ${
                selected === a._id ? "border-brand-500 bg-brand-50/50" : "border-brand-100"
              }`}
            >
              <p className="font-semibold">{a.student?.name}</p>
              <p className="text-sm text-brand-600">{a.job?.title}</p>
              <p className="text-xs text-slate-500 mt-1 capitalize">{a.status}</p>
            </button>
          ))}
          {!applications.length && (
            <p className="text-sm text-slate-500 p-4">No applications yet.</p>
          )}
        </div>

        <div className="glass-card p-6 min-h-[320px]">
          {loadingDetail && <p className="text-slate-500">Loading...</p>}
          {!loadingDetail && !detail && (
            <p className="text-slate-500">Select an application to view student progress.</p>
          )}
          {detail && (
            <div className="space-y-4">
              <div>
                <h2 className="font-bold text-lg">{detail.application.student?.name}</h2>
                <p className="text-sm text-slate-500">{detail.application.student?.email}</p>
                {detail.application.student?.phone && (
                  <p className="text-sm text-slate-500">{detail.application.student.phone}</p>
                )}
                <p className="text-sm mt-2">
                  Applied for: <strong>{detail.application.job?.title}</strong>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Application status</label>
                <select
                  value={detail.application.status}
                  onChange={(e) => updateStatus(detail.application._id, e.target.value)}
                  className="input-field mt-1 capitalize"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {detail.application.coverNote && (
                <div>
                  <p className="text-sm font-medium">Cover note</p>
                  <p className="text-sm text-slate-600 mt-1">{detail.application.coverNote}</p>
                </div>
              )}

              <div>
                <p className="font-semibold mb-2">Learning progress (live)</p>
                {detail.liveProgress?.enrollments?.length ? (
                  <ul className="space-y-3">
                    {detail.liveProgress.enrollments.map((e, i) => (
                      <li key={i} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 text-sm">
                        <p className="font-medium">{e.courseTitle || e.batchName}</p>
                        <p className="text-brand-600">{e.overallPercent}% overall complete</p>
                        <p className="text-xs text-slate-500">
                          Assignments: {e.assignmentPct}% · Classes: {e.classPct}%
                          {e.averageScore != null && ` · Avg score: ${e.averageScore}`}
                        </p>
                        {e.milestones?.length > 0 && (
                          <ul className="text-xs text-slate-500 mt-1 list-disc pl-4">
                            {e.milestones.map((m) => (
                              <li key={m}>{m}</li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">No batch enrollment progress yet.</p>
                )}
              </div>

              {detail.profile?.skills?.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Profile skills</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {detail.profile.skills.map((s) => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded bg-brand-100">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerApplicationsPage;
