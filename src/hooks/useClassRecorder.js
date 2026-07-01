import { useCallback, useEffect, useRef, useState } from "react";

const pickMimeType = () => {
  const types = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) || "video/webm";
};

/**
 * Records the live class video grid (canvas composite + mixed audio).
 * Used by tutor/admin — auto-starts when enabled and media is ready.
 */
export const useClassRecorder = ({ enabled, containerRef, localStream, peers }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const drawIntervalRef = useRef(null);
  const timerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const startedAtRef = useRef(0);

  const cleanup = useCallback(() => {
    if (drawIntervalRef.current) {
      clearInterval(drawIntervalRef.current);
      drawIntervalRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recorderRef.current?.state === "recording") {
      try {
        recorderRef.current.stop();
      } catch {
        /* ignore */
      }
    }
    recorderRef.current = null;
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!enabled || !containerRef?.current || recorderRef.current) return false;
    if (!localStream && !peers?.length) return false;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext("2d");

      const drawFrame = () => {
        const videos = containerRef.current?.querySelectorAll("video") || [];
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const count = videos.length || 1;
        const cols = Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / cols);
        const cellW = canvas.width / cols;
        const cellH = canvas.height / rows;
        videos.forEach((video, i) => {
          if (video.readyState < 2) return;
          const col = i % cols;
          const row = Math.floor(i / cols);
          ctx.drawImage(video, col * cellW, row * cellH, cellW, cellH);
        });
      };

      drawFrame();
      drawIntervalRef.current = setInterval(drawFrame, 250);
      const canvasStream = canvas.captureStream(8);

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const dest = audioCtx.createMediaStreamDestination();

      const addAudio = (stream) => {
        if (!stream) return;
        stream.getAudioTracks().forEach((track) => {
          try {
            const src = audioCtx.createMediaStreamSource(new MediaStream([track]));
            src.connect(dest);
          } catch {
            /* ignore duplicate */
          }
        });
      };

      addAudio(localStream);
      (peers || []).forEach((p) => addAudio(p.stream));

      const tracks = [
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks(),
      ];
      const combined = new MediaStream(tracks);
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(combined, {
        mimeType,
        videoBitsPerSecond: 1_500_000,
      });

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data?.size) chunksRef.current.push(e.data);
      };

      recorder.start(2000);
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }, 1000);
      return true;
    } catch {
      cleanup();
      return false;
    }
  }, [enabled, containerRef, localStream, peers, cleanup]);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      if (!recorderRef.current || recorderRef.current.state === "inactive") {
        cleanup();
        setIsRecording(false);
        resolve({ blob: null, durationSeconds: 0 });
        return;
      }

      const durationSeconds = Math.floor((Date.now() - startedAtRef.current) / 1000);

      recorderRef.current.onstop = () => {
        const mime = recorderRef.current?.mimeType || "video/webm";
        const blob =
          chunksRef.current.length > 0
            ? new Blob(chunksRef.current, { type: mime })
            : null;
        cleanup();
        setIsRecording(false);
        setRecordingSeconds(0);
        resolve({ blob, durationSeconds });
      };

      try {
        recorderRef.current.stop();
      } catch {
        cleanup();
        setIsRecording(false);
        resolve({ blob: null, durationSeconds });
      }
    });
  }, [cleanup]);

  useEffect(() => () => cleanup(), [cleanup]);

  return {
    isRecording,
    recordingSeconds,
    startRecording,
    stopRecording,
  };
};
