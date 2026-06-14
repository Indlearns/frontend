/** Try camera+mic with fallbacks so join still works without hardware. */
export async function acquireLocalMedia() {
  if (!navigator.mediaDevices?.getUserMedia) {
    return { stream: null, warning: "Camera/microphone not supported in this browser." };
  }

  const attempts = [
    { constraints: { video: true, audio: true }, label: null },
    {
      constraints: { video: { facingMode: "user", width: { ideal: 640 } }, audio: true },
      label: null,
    },
    { constraints: { video: false, audio: true }, label: "Joined with audio only (no camera found)." },
    { constraints: { video: true, audio: false }, label: "Joined with camera only (no microphone found)." },
  ];

  let lastError = null;

  for (const { constraints, label } of attempts) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return { stream, warning: label };
    } catch (err) {
      lastError = err;
    }
  }

  const warning =
    lastError?.name === "NotAllowedError"
      ? "Camera/microphone blocked. Allow access in browser settings, or continue without media."
      : lastError?.name === "NotFoundError"
        ? "No camera or microphone found. You can still join to view others."
        : lastError?.name === "NotReadableError"
          ? "Camera or microphone is in use by another app. Close it and tap Retry."
          : "Could not start camera/microphone. You can still join to view others.";

  return { stream: null, warning, error: lastError };
}

export function mediaErrorMessage(err) {
  if (!err) return "Could not start video.";
  if (err.name === "NotAllowedError") return "Camera/microphone permission denied.";
  if (err.name === "NotFoundError") return "No camera or microphone found on this device.";
  if (err.name === "NotReadableError") return "Camera or microphone is already in use.";
  if (err.name === "NotSupportedError") return "Video is not supported in this browser context.";
  return err.message || "Could not start video.";
}
