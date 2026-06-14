import { useEffect, useState } from "react";
import { chatService } from "../../services/chatService";
import IndLearnVideoRoom from "../video/IndLearnVideoRoom";
import Button from "../common/Button";

const LiveClassesPanel = ({ title = "Live classes", subtitle }) => {
  const [classes, setClasses] = useState([]);
  const [active, setActive] = useState(null);
  const [video, setVideo] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    chatService.getLiveClasses().then((r) => {
      if (r.success) setClasses(r.data);
    });
  }, []);

  const joinClass = async (schedule) => {
    setActive(schedule);
    const r = await chatService.joinLiveClass(schedule._id);
    if (r.success) setVideo(r.data);
  };

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
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          <h2 className="font-bold">Upcoming sessions</h2>
          {classes.map((c) => (
            <div
              key={c._id}
              className={`p-4 rounded-xl border transition-colors ${
                active?._id === c._id
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
              <Button type="button" className="mt-3" onClick={() => joinClass(c)}>
                {joinLabel(c.status)}
              </Button>
            </div>
          ))}
          {!classes.length && (
            <p className="text-sm text-slate-500">No upcoming classes scheduled.</p>
          )}
        </div>
        <div className="glass-card p-2 min-h-[360px] flex flex-col">
          {video?.roomId ? (
            <>
              <p className="p-3 font-semibold text-sm">{active?.title}</p>
              <IndLearnVideoRoom
                roomId={video.roomId || video.roomName}
                displayName={user.name}
                iceServers={video.iceServers}
                className="flex-1 min-h-[320px]"
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 p-6 text-center">
              Select a class and click Join video class.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveClassesPanel;
