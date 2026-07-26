import { createContext, useCallback, useContext, useState } from "react";
import { Link } from "react-router-dom";
import IndLearnVideoRoom from "../components/video/IndLearnVideoRoom";
import { chatService } from "../services/chatService";
import { tutorService } from "../services/tutorService";

const LiveClassSessionContext = createContext(null);

export const LiveClassSessionProvider = ({ children, joinMode = "chat", classesPath = "" }) => {
  const [session, setSession] = useState(null);
  const [joiningId, setJoiningId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const clearSession = useCallback(() => {
    setSession(null);
    setJoinError("");
    setCollapsed(false);
  }, []);

  const joinClass = useCallback(
    async (schedule) => {
      if (!schedule?._id) return;
      setJoiningId(schedule._id);
      setJoinError("");
      try {
        const r =
          joinMode === "tutor"
            ? await tutorService.joinClass(schedule._id)
            : await chatService.joinLiveClass(schedule._id);

        if (!r.success) {
          setJoinError(r.message || "Could not join class.");
          return;
        }

        setSession({
          scheduleId: schedule._id,
          title: schedule.title,
          video: r.data,
        });
        setCollapsed(false);
      } catch (err) {
        setJoinError(err.response?.data?.message || "Could not join class.");
      } finally {
        setJoiningId(null);
      }
    },
    [joinMode]
  );

  const handleEndClass = useCallback(
    async ({ blob, durationSeconds, scheduleId }) => {
      setUploading(true);
      try {
        await chatService.uploadClassRecording(scheduleId, blob, durationSeconds);
        clearSession();
      } catch {
        alert("Could not save recording. Please try again.");
        throw new Error("upload failed");
      } finally {
        setUploading(false);
      }
    },
    [clearSession]
  );

  const video = session?.video;
  const scheduleId = video?.scheduleId || session?.scheduleId;

  const value = {
    session,
    joiningId,
    joinError,
    uploading,
    joinClass,
    clearSession,
    isInClass: Boolean(video?.roomId),
    activeScheduleId: session?.scheduleId || null,
  };

  return (
    <LiveClassSessionContext.Provider value={value}>
      {children}

      {video?.roomId && (
        <>
          {uploading && (
            <div className="fixed inset-0 z-[300] bg-slate-900/70 flex items-center justify-center text-white text-sm">
              Saving class recording…
            </div>
          )}

          <div
            className={`fixed z-[250] shadow-2xl rounded-xl ring-2 ring-brand-500/50 overflow-hidden bg-slate-950 ${
              collapsed
                ? "bottom-4 right-4 w-auto"
                : "bottom-4 right-4 left-4 sm:left-auto sm:w-[min(100vw-2rem,28rem)] lg:w-[min(100vw-2rem,36rem)]"
            }`}
          >
            <div className="bg-slate-900 text-white text-xs px-3 py-2 flex items-center gap-2 border-b border-slate-800">
              <span className="flex-1 truncate font-medium">
                <span className="text-emerald-400">● Live</span> {session.title}
              </span>
              {classesPath && (
                <Link to={classesPath} className="text-brand-300 hover:text-white underline shrink-0">
                  Classes
                </Link>
              )}
              <button
                type="button"
                onClick={() => setCollapsed((v) => !v)}
                className="text-slate-300 hover:text-white shrink-0 px-1"
              >
                {collapsed ? "Expand" : "Minimize"}
              </button>
            </div>

            {!collapsed && (
              <IndLearnVideoRoom
                roomId={video.roomId || video.roomName}
                displayName={user.name}
                iceServers={video.iceServers}
                title={session.title}
                className="min-h-[220px] max-h-[min(70vh,420px)]"
                scheduleId={scheduleId}
                shouldRecord={Boolean(video.canRecord)}
                onEndClass={video.canRecord ? handleEndClass : undefined}
                uploading={uploading}
                onLeave={clearSession}
              />
            )}
          </div>
        </>
      )}
    </LiveClassSessionContext.Provider>
  );
};

export const useLiveClassSession = () => {
  const ctx = useContext(LiveClassSessionContext);
  if (!ctx) {
    throw new Error("useLiveClassSession must be used within LiveClassSessionProvider");
  }
  return ctx;
};

/** Placeholder on Live Classes page while call runs in persistent dock */
export const LiveClassSessionPlaceholder = ({ className = "" }) => {
  const { isInClass, session } = useLiveClassSession();

  if (!isInClass) {
    return (
      <div
        className={`flex items-center justify-center text-slate-500 p-6 text-center text-sm ${className}`}
      >
        Select a class and click Start & join class.
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-6 gap-3 ${className}`}
    >
      <p className="text-emerald-600 dark:text-emerald-400 font-semibold">Class in progress</p>
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs">
        Your live session for <strong>{session?.title}</strong> is active in the floating panel.
        You can browse other sections — the call stays connected.
      </p>
      <p className="text-xs text-slate-500">Use Minimize on the panel to save screen space.</p>
    </div>
  );
};

export default LiveClassSessionContext;
