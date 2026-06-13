import { useEffect, useState } from "react";
import { tutorService } from "../../services/tutorService";

const TutorBatchesPage = () => {
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    tutorService.getBatches().then((r) => {
      if (r.success) setBatches(r.data);
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">My batches</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Batches assigned by admin — students listed for each batch.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        {batches.map((b) => (
          <div key={b._id} className="glass-card p-5">
            <div className="flex justify-between items-start gap-2">
              <div>
                <h2 className="font-bold text-lg">{b.name}</h2>
                <p className="text-sm text-brand-600">{b.course?.title}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-brand-100 dark:bg-brand-900/40 capitalize">
                {b.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-3">
              {b.students?.length || 0} student(s)
            </p>
            {b.students?.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm max-h-32 overflow-y-auto">
                {b.students.map((s) => (
                  <li key={s._id} className="text-slate-700 dark:text-slate-300">
                    {s.name} — {s.email}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {!batches.length && (
          <p className="text-slate-500 col-span-2">No batches assigned yet. Ask admin to assign you.</p>
        )}
      </div>
    </div>
  );
};

export default TutorBatchesPage;
