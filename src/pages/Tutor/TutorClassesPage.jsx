import { useEffect, useState } from "react";
import { tutorService } from "../../services/tutorService";
import JitsiRoom from "../../components/video/JitsiRoom";
import Button from "../../components/common/Button";

const TutorClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [active, setActive] = useState(null);
  const [video, setVideo] = useState(null);
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
    if (r.success) setVideo(r.data);
  };

  const markDone = async (id) => {
    await tutorService.updateClassStatus(id, "completed");
    load();
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Live classes</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Classes created by admin for your batches. Join the Jitsi room when it is time to teach.
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
                  Join Jitsi room
                </Button>
                {c.status === "live" && (
                  <Button type="button" variant="outline" onClick={() => markDone(c._id)}>
                    Mark completed
                  </Button>
                )}
              </div>
            </div>
          ))}
          {!classes.length && (
            <p className="text-sm text-slate-500">No upcoming classes. Admin schedules them per batch.</p>
          )}
        </div>
        <div className="glass-card min-h-[360px] flex flex-col p-2">
          {video?.roomName ? (
            <>
              <p className="p-3 font-semibold text-sm">{active?.title}</p>
              <JitsiRoom roomName={video.roomName} displayName={user.name} className="flex-1 min-h-[320px]" />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 p-6 text-center text-sm">
              Select a class and join the video room.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorClassesPage;
