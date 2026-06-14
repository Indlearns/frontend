import { useEffect, useRef, useState } from "react";
import {
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiPhoneOff,
  FiMessageCircle,
  FiX,
  FiSend,
  FiMaximize2,
  FiMinimize2,
  FiSquare,
} from "react-icons/fi";
import { useIndLearnVideo } from "../../hooks/useIndLearnVideo";

const VideoTile = ({ stream, name, muted = false, handRaised = false, className = "" }) => {
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
        className="w-full h-full object-cover min-h-[100px]"
      />
      {handRaised && (
        <span
          className="absolute top-2 right-2 text-lg bg-amber-500 text-white w-8 h-8 flex items-center justify-center rounded-full shadow-lg animate-pulse"
          title="Hand raised"
        >
          ✋
        </span>
      )}
      <span className="absolute bottom-2 left-2 text-xs bg-black/60 text-white px-2 py-1 rounded-lg truncate max-w-[90%]">
        {name}
      </span>
    </div>
  );
};

/** embedded = in-page panel, minimized = floating PiP, fullscreen = overlay */
const IndLearnVideoRoom = ({
  roomId,
  displayName = "IndLearn User",
  iceServers,
  className = "",
  title = "",
  onLeave,
}) => {
  const [chatText, setChatText] = useState("");
  const [viewMode, setViewMode] = useState("embedded");
  const containerRef = useRef(null);

  const {
    peers,
    localStream,
    localSocketId,
    error,
    mediaWarning,
    mediaRetrying,
    retryMedia,
    micOn,
    camOn,
    joined,
    handRaised,
    isHandRaised,
    chatMessages,
    showChat,
    setShowChat,
    chatEndRef,
    toggleMic,
    toggleCam,
    toggleRaiseHand,
    sendChatMessage,
    leave,
  } = useIndLearnVideo({
    roomId,
    displayName,
    iceServers,
    enabled: Boolean(roomId),
  });

  const handleLeave = () => {
    if (document.fullscreenElement === containerRef.current) {
      document.exitFullscreen?.().catch(() => {});
    }
    leave();
    onLeave?.();
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    sendChatMessage(chatText);
    setChatText("");
  };

  const formatTime = (iso) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const enterBrowserFullscreen = async () => {
    try {
      if (containerRef.current && !document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      }
    } catch {
      setViewMode("fullscreen");
    }
  };

  const exitBrowserFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement && viewMode === "fullscreen") {
        setViewMode("embedded");
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, [viewMode]);

  const setEmbedded = () => {
    exitBrowserFullscreen();
    setViewMode("embedded");
  };

  const setMinimized = () => {
    exitBrowserFullscreen();
    setViewMode("minimized");
  };

  const setFullscreen = () => {
    setViewMode("fullscreen");
    enterBrowserFullscreen();
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

  const shellClass =
    viewMode === "minimized"
      ? "fixed bottom-4 right-4 z-[200] w-80 sm:w-96 shadow-2xl ring-2 ring-brand-500/40"
      : viewMode === "fullscreen"
        ? "fixed inset-0 z-[200] rounded-none"
        : className;

  const minVideoHeight =
    viewMode === "minimized" ? "min-h-[140px]" : viewMode === "fullscreen" ? "min-h-[200px]" : "min-h-[160px]";

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-slate-950 rounded-xl overflow-hidden ${shellClass}`}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-900/90 border-b border-slate-800 shrink-0">
        <p className="text-sm font-semibold text-white truncate flex-1">
          {title || "Video call"}
          {joined && <span className="text-emerald-400 font-normal ml-2">· Live</span>}
        </p>
        <div className="flex items-center gap-1 shrink-0">
          {viewMode !== "embedded" && (
            <button
              type="button"
              onClick={setEmbedded}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white"
              title="Restore to panel"
            >
              <FiSquare size={16} />
            </button>
          )}
          {viewMode !== "minimized" && (
            <button
              type="button"
              onClick={setMinimized}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white"
              title="Minimize (picture-in-picture)"
            >
              <FiMinimize2 size={16} />
            </button>
          )}
          {viewMode !== "fullscreen" && (
            <button
              type="button"
              onClick={setFullscreen}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white"
              title="Full screen"
            >
              <FiMaximize2 size={16} />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-sm p-3 bg-red-950/40 shrink-0 flex items-center justify-between gap-2">
          <span>{error}</span>
          <button
            type="button"
            onClick={retryMedia}
            disabled={mediaRetrying}
            className="text-xs underline shrink-0"
          >
            {mediaRetrying ? "Retrying…" : "Retry"}
          </button>
        </div>
      )}

      {mediaWarning && !error && (
        <div className="text-amber-200 text-sm p-3 bg-amber-950/40 shrink-0 flex items-center justify-between gap-2">
          <span>{mediaWarning}</span>
          <button
            type="button"
            onClick={retryMedia}
            disabled={mediaRetrying}
            className="text-xs underline text-amber-100 shrink-0"
          >
            {mediaRetrying ? "Retrying…" : "Enable camera/mic"}
          </button>
        </div>
      )}

      <div className={`flex flex-1 min-h-0 ${viewMode === "fullscreen" ? "h-[calc(100vh-7rem)]" : ""}`}>
        <div className="flex-1 flex flex-col min-w-0">
          <div
            className={`flex-1 p-2 min-h-0 overflow-y-auto ${
              viewMode === "minimized" ? "max-h-[180px]" : ""
            }`}
          >
            <div
              className={`grid gap-2 ${
                viewMode === "minimized"
                  ? "grid-cols-1"
                  : peers.length === 0
                    ? "grid-cols-1"
                    : peers.length === 1
                      ? "grid-cols-1 sm:grid-cols-2"
                      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {localStream ? (
                <VideoTile
                  stream={localStream}
                  name={`${displayName} (You)`}
                  muted
                  handRaised={handRaised}
                  className={minVideoHeight}
                />
              ) : (
                <div
                  className={`relative bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 text-sm p-4 ${minVideoHeight}`}
                >
                  {joined ? "No camera — you can still see others" : "Connecting…"}
                </div>
              )}
              {peers.map((p) => (
                <VideoTile
                  key={p.socketId}
                  stream={p.stream}
                  name={p.name}
                  handRaised={isHandRaised(p.socketId)}
                  className={minVideoHeight}
                />
              ))}
            </div>

            {joined && peers.length === 0 && viewMode !== "minimized" && (
              <p className="text-center text-slate-500 text-sm mt-4">
                Waiting for others to join…
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-3 p-2 sm:p-3 bg-slate-900/80 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={toggleMic}
              className={`p-2.5 sm:p-3 rounded-full ${micOn ? "bg-slate-700 text-white" : "bg-red-600 text-white"}`}
              title={micOn ? "Mute" : "Unmute"}
            >
              {micOn ? <FiMic /> : <FiMicOff />}
            </button>
            <button
              type="button"
              onClick={toggleCam}
              className={`p-2.5 sm:p-3 rounded-full ${camOn ? "bg-slate-700 text-white" : "bg-red-600 text-white"}`}
              title={camOn ? "Stop camera" : "Start camera"}
            >
              {camOn ? <FiVideo /> : <FiVideoOff />}
            </button>
            {viewMode !== "minimized" && (
              <>
                <button
                  type="button"
                  onClick={toggleRaiseHand}
                  className={`p-2.5 sm:p-3 rounded-full text-lg ${
                    handRaised
                      ? "bg-amber-500 text-white ring-2 ring-amber-300"
                      : "bg-slate-700 text-white"
                  }`}
                  title={handRaised ? "Lower hand" : "Raise hand"}
                >
                  ✋
                </button>
                <button
                  type="button"
                  onClick={() => setShowChat((v) => !v)}
                  className={`p-2.5 sm:p-3 rounded-full relative ${
                    showChat ? "bg-brand-600 text-white" : "bg-slate-700 text-white"
                  }`}
                  title="In-call chat"
                >
                  <FiMessageCircle />
                  {chatMessages.length > 0 && !showChat && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
                  )}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={handleLeave}
              className="p-2.5 sm:p-3 rounded-full bg-red-600 text-white"
              title="Leave call"
            >
              <FiPhoneOff />
            </button>
          </div>
        </div>

        {showChat && viewMode !== "minimized" && (
          <div className="w-full sm:w-72 border-l border-slate-800 flex flex-col bg-slate-900 shrink-0 max-h-[420px] sm:max-h-none">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 shrink-0">
              <span className="text-sm font-semibold text-white">Call chat</span>
              <button
                type="button"
                onClick={() => setShowChat(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <FiX />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[120px]">
              {chatMessages.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">
                  Send a message to everyone in the call.
                </p>
              )}
              {chatMessages.map((m) => {
                const isMe = m.socketId === localSocketId;
                return (
                  <div key={m.id} className={`text-sm ${isMe ? "text-right" : "text-left"}`}>
                    <p className="text-xs text-slate-500 mb-0.5">
                      {isMe ? "You" : m.name}
                      {m.at ? ` · ${formatTime(m.at)}` : ""}
                    </p>
                    <span
                      className={`inline-block px-2.5 py-1.5 rounded-xl max-w-[95%] text-left ${
                        isMe ? "bg-brand-600 text-white" : "bg-slate-800 text-slate-100"
                      }`}
                    >
                      {m.text}
                    </span>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <form
              onSubmit={handleSendChat}
              className="p-2 border-t border-slate-800 flex gap-2 shrink-0"
            >
              <input
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 text-sm px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:ring-1 focus:ring-brand-500"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!chatText.trim()}
                className="p-2 rounded-lg bg-brand-600 text-white disabled:opacity-40"
              >
                <FiSend size={18} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndLearnVideoRoom;
