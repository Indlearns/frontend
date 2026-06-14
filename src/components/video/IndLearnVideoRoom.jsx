import { useEffect, useRef } from "react";
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff } from "react-icons/fi";
import { useIndLearnVideo } from "../../hooks/useIndLearnVideo";

const VideoTile = ({ stream, name, muted = false, className = "" }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`relative bg-slate-900 rounded-xl overflow-hidden ${className}`}>
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={muted}
        className="w-full h-full object-cover min-h-[140px]"
      />
      <span className="absolute bottom-2 left-2 text-xs bg-black/60 text-white px-2 py-1 rounded-lg">
        {name}
      </span>
    </div>
  );
};

const IndLearnVideoRoom = ({
  roomId,
  displayName = "IndLearn User",
  iceServers,
  className = "",
  onLeave,
}) => {
  const { peers, localStream, error, micOn, camOn, joined, toggleMic, toggleCam, leave } =
    useIndLearnVideo({
      roomId,
      displayName,
      iceServers,
      enabled: Boolean(roomId),
    });

  const handleLeave = () => {
    leave();
    onLeave?.();
  };

  if (!roomId) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-900 text-slate-400 rounded-xl ${className}`}
      >
        No video room configured
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-slate-950 rounded-xl overflow-hidden ${className}`}>
      {error && (
        <p className="text-red-400 text-sm p-3 bg-red-950/40 shrink-0">{error}</p>
      )}

      <div className="flex-1 p-2 min-h-0 overflow-y-auto">
        <div
          className={`grid gap-2 ${
            peers.length === 0
              ? "grid-cols-1"
              : peers.length === 1
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {localStream && (
            <VideoTile stream={localStream} name={`${displayName} (You)`} muted className="min-h-[160px]" />
          )}
          {peers.map((p) => (
            <VideoTile key={p.socketId} stream={p.stream} name={p.name} className="min-h-[160px]" />
          ))}
        </div>

        {joined && peers.length === 0 && (
          <p className="text-center text-slate-500 text-sm mt-4">
            Waiting for others to join…
          </p>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 p-3 bg-slate-900/80 shrink-0">
        <button
          type="button"
          onClick={toggleMic}
          className={`p-3 rounded-full ${micOn ? "bg-slate-700 text-white" : "bg-red-600 text-white"}`}
          title={micOn ? "Mute" : "Unmute"}
        >
          {micOn ? <FiMic /> : <FiMicOff />}
        </button>
        <button
          type="button"
          onClick={toggleCam}
          className={`p-3 rounded-full ${camOn ? "bg-slate-700 text-white" : "bg-red-600 text-white"}`}
          title={camOn ? "Stop camera" : "Start camera"}
        >
          {camOn ? <FiVideo /> : <FiVideoOff />}
        </button>
        <button
          type="button"
          onClick={handleLeave}
          className="p-3 rounded-full bg-red-600 text-white"
          title="Leave call"
        >
          <FiPhoneOff />
        </button>
      </div>
    </div>
  );
};

export default IndLearnVideoRoom;
