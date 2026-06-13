const JITSI_DOMAIN = import.meta.env.VITE_JITSI_DOMAIN || "meet.jit.si";

const JitsiRoom = ({ roomName, displayName = "IndLearn User", className = "" }) => {
  if (!roomName) {
    return (
      <div className={`flex items-center justify-center bg-slate-900 text-slate-400 ${className}`}>
        No video room configured
      </div>
    );
  }

  const name = encodeURIComponent(displayName);
  const src = `https://${JITSI_DOMAIN}/${roomName}#userInfo.displayName="${name}"&config.prejoinPageEnabled=false`;

  return (
    <iframe
      title="Jitsi Meet"
      src={src}
      allow="camera; microphone; fullscreen; display-capture; autoplay"
      className={`w-full h-full border-0 rounded-xl ${className}`}
    />
  );
};

export default JitsiRoom;
