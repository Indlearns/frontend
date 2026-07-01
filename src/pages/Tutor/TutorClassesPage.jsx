import { useEffect, useState } from "react";
import { tutorService } from "../../services/tutorService";
import { chatService } from "../../services/chatService";
import IndLearnVideoRoom from "../../components/video/IndLearnVideoRoom";
import ClassRecordingsList from "../../components/classes/ClassRecordingsList";
import Button from "../../components/common/Button";

const TutorClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [active, setActive] = useState(null);
  const [video, setVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [recordingsKey, setRecordingsKey] = useState(0);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const load = () => {
    tutorService.getClasses(true).then((r) => {
      if (r.success) setClasses(r.data);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const join = async (cls) => {
    setActive(cls);
    const r = await tutorService.joinClass(cls._id);
    if (r.success) {
      setVideo(r.data);
      load();
    }
  };

  const handleEndClass = async ({ blob, durationSeconds, scheduleId }) => {
    setUploading(true);
    try {
      await chatService.uploadClassRecording(scheduleId, blob, durationSeconds);
      setRecordingsKey((k) => k + 1);
      load();
    } catch {
      alert("Could not save recording. Please try again.");
      throw new Error("upload failed");
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const scheduleId = video?.scheduleId || active?._id;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Live classes</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Classes created by admin for your batches. Recording starts automatically when you start
        the class. Use &quot;End class&quot; to save the recording for your students.
      </p>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {classes.map((c) => (
            <div
              key={c._id}
              className={`p-4 rounded-xl border ${
                active?._id === c._id ? "border-brand-500 bg-brand-50/50" : "border-brand-100"
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
                <Button type="button" onClick={() => join(c)}>
                  {c.status === "scheduled" ? "Start & join class" : "Join class"}
                </Button>
              </div>
            </div>
          ))}
          {!classes.length && (
            <p className="text-sm text-slate-500">No upcoming classes. Admin schedules them per batch.</p>
          )}
        </div>
        <div className="glass-card min-h-[360px] flex flex-col p-2 relative">
          {uploading && (
            <div className="absolute inset-0 z-10 bg-slate-900/70 flex items-center justify-center rounded-xl text-white text-sm">
              Saving class recording…
            </div>
          )}
          {video?.roomId ? (
            <IndLearnVideoRoom
              roomId={video.roomId || video.roomName}
              displayName={user.name}
              iceServers={video.iceServers}
              title={active?.title}
              className="flex-1 min-h-[320px]"
              scheduleId={scheduleId}
              shouldRecord={Boolean(video.canRecord)}
              onEndClass={handleEndClass}
              uploading={uploading}
              onLeave={() => {
                setActive(null);
                setVideo(null);
                load();
              }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 p-6 text-center text-sm">
              Select a class and join the video room.
            </div>
          )}
        </div>
      </div>

      <ClassRecordingsList
        title="Your batch recordings"
        refreshKey={recordingsKey}
        className="mt-6"
      />
    </div>
  );
};

export default TutorClassesPage;
