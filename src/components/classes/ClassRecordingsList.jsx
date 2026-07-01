import { useCallback, useEffect, useState } from "react";
import { FiPlay, FiTrash2, FiX } from "react-icons/fi";
import { chatService } from "../../services/chatService";
import Button from "../common/Button";

const formatDuration = (seconds) => {
  const s = Number(seconds) || 0;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
};

const formatDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const ClassRecordingsList = ({
  batchId,
  title = "Class recordings",
  canDelete = false,
  refreshKey = 0,
  className = "",
}) => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    chatService
      .listClassRecordings(batchId)
      .then((r) => {
        if (r.success) setRecordings(r.data || []);
      })
      .finally(() => setLoading(false));
  }, [batchId]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const closePlayer = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl("");
    setPlaying(null);
  };

  const handlePlay = async (rec) => {
    closePlayer();
    try {
      const url = await chatService.fetchRecordingBlobUrl(rec._id);
      setVideoUrl(url);
      setPlaying(rec);
    } catch {
      alert("Could not play recording. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this recording permanently?")) return;
    setDeletingId(id);
    try {
      await chatService.deleteClassRecording(id);
      if (playing?._id === id) closePlayer();
      load();
    } catch {
      alert("Could not delete recording.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={`glass-card p-4 ${className}`}>
      <h2 className="font-bold text-lg mb-3">{title}</h2>

      {playing && videoUrl && (
        <div className="mb-4 rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-800 text-white text-sm">
            <span className="truncate font-medium">{playing.title}</span>
            <button
              type="button"
              onClick={closePlayer}
              className="p-1 rounded hover:bg-slate-700"
              title="Close player"
            >
              <FiX />
            </button>
          </div>
          <video src={videoUrl} controls autoPlay className="w-full max-h-[360px] bg-black" />
        </div>
      )}

      {loading && <p className="text-sm text-slate-500">Loading recordings…</p>}

      {!loading && !recordings.length && (
        <p className="text-sm text-slate-500">No recordings yet for this batch.</p>
      )}

      <ul className="space-y-2">
        {recordings.map((rec) => (
          <li
            key={rec._id}
            className="flex items-center gap-3 p-3 rounded-xl border border-brand-100 dark:border-slate-700"
          >
            <button
              type="button"
              onClick={() => handlePlay(rec)}
              className="shrink-0 p-2.5 rounded-full bg-brand-600 text-white hover:bg-brand-700"
              title="Play"
            >
              <FiPlay size={16} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{rec.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {rec.batch?.name && <span>{rec.batch.name} · </span>}
                {formatDate(rec.classDate || rec.schedule?.date)}
                {rec.durationSeconds ? ` · ${formatDuration(rec.durationSeconds)}` : ""}
                {rec.recordedBy?.name ? ` · by ${rec.recordedBy.name}` : ""}
              </p>
            </div>
            {canDelete && (
              <Button
                type="button"
                variant="outline"
                className="shrink-0 text-red-600 border-red-200 hover:bg-red-50"
                disabled={deletingId === rec._id}
                onClick={() => handleDelete(rec._id)}
              >
                <FiTrash2 size={16} />
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClassRecordingsList;
