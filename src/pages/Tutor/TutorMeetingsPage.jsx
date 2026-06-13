import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { tutorService } from "../../services/tutorService";
import Button from "../../components/common/Button";

const TutorMeetingsPage = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("pending");

  const load = () => {
    tutorService.getMeetingRequests(filter || undefined).then((r) => {
      if (r.success) setRequests(r.data);
    });
  };

  useEffect(() => {
    load();
  }, [filter]);

  const respond = async (id, action) => {
    const note =
      action === "decline"
        ? "Unable to meet at this time."
        : "Accepted — open chat to continue.";
    await tutorService.respondMeetingRequest(id, action, note);
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Doubt & meeting requests</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Students request doubt clearance or meetings. Accept to open chat + Jitsi video with them.
      </p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {["pending", "accepted", "declined", ""].map((s) => (
          <button
            key={s || "all"}
            type="button"
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${
              filter === s
                ? "bg-brand-500 text-white"
                : "bg-slate-100 dark:bg-slate-800"
            }`}
          >
            {s || "All"}
          </button>
        ))}
        <Link to="/tutor/chat" className="ml-auto">
          <Button variant="outline">Open messages</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {requests.map((r) => (
          <div key={r._id} className="glass-card p-5">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-bold">{r.title}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {r.student?.name} · {r.batch?.name || "Batch"} ·{" "}
                  <span className="capitalize">{r.type}</span>
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/40 capitalize">
                {r.status}
              </span>
            </div>
            {r.message && <p className="text-sm mt-3">{r.message}</p>}
            {r.preferredAt && (
              <p className="text-xs text-slate-500 mt-2">
                Preferred: {new Date(r.preferredAt).toLocaleString()}
              </p>
            )}
            {r.status === "pending" && (
              <div className="flex gap-2 mt-4">
                <Button type="button" onClick={() => respond(r._id, "accept")}>
                  Accept — open chat & video
                </Button>
                <Button type="button" variant="outline" onClick={() => respond(r._id, "decline")}>
                  Decline
                </Button>
              </div>
            )}
            {r.status === "accepted" && r.conversation && (
              <Link
                to="/tutor/chat"
                className="inline-block mt-3 text-sm text-brand-600 font-medium"
              >
                Go to conversation →
              </Link>
            )}
          </div>
        ))}
        {!requests.length && (
          <p className="text-slate-500">No requests in this filter.</p>
        )}
      </div>
    </div>
  );
};

export default TutorMeetingsPage;
