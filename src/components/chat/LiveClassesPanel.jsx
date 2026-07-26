import { useEffect, useState } from "react";
import { chatService } from "../../services/chatService";
import ClassRecordingsList from "../classes/ClassRecordingsList";
import Button from "../common/Button";
import {
  useLiveClassSession,
  LiveClassSessionPlaceholder,
} from "../../contexts/LiveClassSessionContext";

const LiveClassesPanel = ({
  title = "Live classes",
  subtitle,
  batchId,
  showRecordings = true,
}) => {
  const [classes, setClasses] = useState([]);
  const [recordingsKey, setRecordingsKey] = useState(0);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const canDeleteRecordings = user.role === "admin" || user.role === "superadmin";

  const {
    joinClass,
    joiningId,
    joinError,
    isInClass,
    activeScheduleId,
    clearSession,
    session,
  } = useLiveClassSession();

  const refreshClasses = () => {
    chatService.getLiveClasses().then((r) => {
      if (r.success) setClasses(r.data);
    });
  };

  useEffect(() => {
    refreshClasses();
  }, []);

  useEffect(() => {
    if (!isInClass) refreshClasses();
  }, [isInClass]);

  const joinLabel = (status) =>
    status === "scheduled" ? "Start & join class" : "Join class";

  const formatDate = (d) =>
    new Date(d).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-slate-600 dark:text-slate-400 mt-1">{subtitle}</p>}
        {joinError && <p className="text-sm text-red-600 mt-2">{joinError}</p>}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          <h2 className="font-bold">Upcoming sessions</h2>
          {classes.map((c) => (
            <div
              key={c._id}
              className={`p-4 rounded-xl border transition-colors ${
                activeScheduleId === c._id
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-950/20"
                  : "border-brand-100"
              }`}
            >
              <p className="font-semibold">{c.title}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {c.batch?.name} · {formatDate(c.date)} · {c.startTime}–{c.endTime}
              </p>
              <p className="text-xs text-slate-500 mt-1 capitalize">Status: {c.status}</p>
              {c.participants?.length > 0 && (
                <p className="text-xs text-slate-500">{c.participants.length} participants</p>
              )}
              <div className="flex gap-2 mt-3 flex-wrap">
                <Button
                  type="button"
                  disabled={joiningId === c._id || (isInClass && activeScheduleId !== c._id)}
                  onClick={() => joinClass(c)}
                >
                  {joiningId === c._id ? "Joining…" : joinLabel(c.status)}
                </Button>
                {activeScheduleId === c._id && isInClass && (
                  <Button type="button" variant="outline" onClick={clearSession}>
                    Leave call
                  </Button>
                )}
              </div>
            </div>
          ))}
          {!classes.length && (
            <p className="text-sm text-slate-500">
              No upcoming classes scheduled. Ask admin to schedule classes for your batch.
            </p>
          )}
        </div>
        <div className="glass-card p-2 min-h-[360px] flex flex-col">
          <LiveClassSessionPlaceholder className="flex-1 min-h-[320px]" />
        </div>
      </div>

      {showRecordings && (
        <ClassRecordingsList
          batchId={batchId}
          title={batchId ? "Batch recordings" : "Class recordings"}
          canDelete={canDeleteRecordings}
          refreshKey={recordingsKey + (session ? 0 : 1)}
          className="mt-6"
        />
      )}
    </div>
  );
};

export default LiveClassesPanel;
