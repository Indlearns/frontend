import { useEffect, useState } from "react";
import { tutorService } from "../../services/tutorService";
import ClassRecordingsList from "../../components/classes/ClassRecordingsList";
import Button from "../../components/common/Button";
import {
  useLiveClassSession,
  LiveClassSessionPlaceholder,
} from "../../contexts/LiveClassSessionContext";

const TutorClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [recordingsKey, setRecordingsKey] = useState(0);

  const {
    joinClass,
    joiningId,
    joinError,
    isInClass,
    activeScheduleId,
    clearSession,
    session,
  } = useLiveClassSession();

  const load = () => {
    tutorService.getClasses(true).then((r) => {
      if (r.success) setClasses(r.data);
    });
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!isInClass) load();
  }, [isInClass]);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Live classes</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-2">
        Classes for your batches. Click <strong>Start & join class</strong> to begin — recording
        starts automatically for tutors.
      </p>
      <p className="text-sm text-slate-500 mb-6">
        The live call stays active in the floating panel when you open other menu sections.
      </p>
      {joinError && <p className="text-sm text-red-600 mb-4">{joinError}</p>}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {classes.map((c) => (
            <div
              key={c._id}
              className={`p-4 rounded-xl border ${
                activeScheduleId === c._id ? "border-brand-500 bg-brand-50/50" : "border-brand-100"
              }`}
            >
              <p className="font-semibold">{c.title}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {c.batch?.name} · {formatDate(c.date)} · {c.startTime}–{c.endTime}
              </p>
              <p className="text-xs capitalize mt-1">Status: {c.status}</p>
              {c.meetLink && (
                <a
                  href={c.meetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-brand-600 block mt-1"
                >
                  External link (admin)
                </a>
              )}
              <div className="flex gap-2 mt-3 flex-wrap">
                <Button
                  type="button"
                  disabled={joiningId === c._id || (isInClass && activeScheduleId !== c._id)}
                  onClick={() => joinClass(c)}
                >
                  {joiningId === c._id
                    ? "Joining…"
                    : c.status === "scheduled"
                      ? "Start & join class"
                      : "Join class"}
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
              No upcoming classes. Admin must assign you to a batch and schedule classes.
            </p>
          )}
        </div>
        <div className="glass-card min-h-[360px] flex flex-col p-2">
          <LiveClassSessionPlaceholder className="flex-1 min-h-[320px]" />
        </div>
      </div>

      <ClassRecordingsList
        title="Your batch recordings"
        refreshKey={recordingsKey + (session ? 0 : 1)}
        className="mt-6"
      />
    </div>
  );
};

export default TutorClassesPage;
