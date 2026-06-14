import { useEffect, useState, useRef, useMemo } from "react";
import { io } from "socket.io-client";
import { chatService } from "../../services/chatService";
import Button from "../common/Button";
import IndLearnVideoRoom from "../video/IndLearnVideoRoom";
import { ROLE_LABELS } from "../../utils/constants";

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const TABS = [
  { id: "batches", label: "Batches" },
  { id: "superadmin", label: "Super Admins" },
  { id: "admin", label: "Admins" },
  { id: "tutor", label: "Tutors" },
  { id: "student", label: "Students" },
];

const AdminChatPanel = () => {
  const [directory, setDirectory] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeTab, setActiveTab] = useState("batches");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [groupTitle, setGroupTitle] = useState("");
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [videoRoom, setVideoRoom] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const socketRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const loadConversations = async () => {
    const r = await chatService.getConversations();
    if (r.success) setConversations(r.data);
  };

  const loadDirectory = async () => {
    const r = await chatService.getStaffDirectory();
    if (r.success) setDirectory(r.data);
  };

  const openConversation = async (convId) => {
    setLoading(true);
    setError("");
    await chatService.joinConversation(convId);
    const r = await chatService.getMessages(convId);
    if (r.success) setMessages(r.data);
    setActiveId(convId);
    setShowVideo(false);

    const vr = await chatService.getVideoConfig(convId);
    if (vr.success) setVideoRoom(vr.data);

    if (socketRef.current) socketRef.current.disconnect();
    const token = localStorage.getItem("token");
    socketRef.current = io(SOCKET_URL, { auth: { token } });
    socketRef.current.emit("join_conversation", convId);
    socketRef.current.on("new_message", (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });
    setLoading(false);
  };

  useEffect(() => {
    loadConversations();
    loadDirectory();
    return () => socketRef.current?.disconnect();
  }, []);

  const toggleSelect = (userId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setGroupTitle("");
  };

  const filterUsers = (list) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  };

  const tabUsers = useMemo(() => {
    if (!directory || activeTab === "batches") return [];
    return filterUsers(directory.users[activeTab] || []);
  }, [directory, activeTab, search]);

  const filteredBatches = useMemo(() => {
    if (!directory?.batches) return [];
    if (!search.trim()) return directory.batches;
    const q = search.toLowerCase();
    return directory.batches.filter(
      (b) =>
        b.name?.toLowerCase().includes(q) ||
        b.course?.title?.toLowerCase().includes(q)
    );
  }, [directory, search]);

  const startSelectedChat = async () => {
    const ids = [...selectedIds];
    if (!ids.length) {
      setError("Select at least one person.");
      return;
    }
    setError("");
    setStarting(true);
    try {
      if (ids.length === 1) {
        const r = await chatService.startDoubtChat(ids[0]);
        if (r.success) {
          clearSelection();
          await loadConversations();
          await openConversation(r.data._id);
        }
      } else {
        const r = await chatService.startGroupChat(ids, groupTitle || undefined);
        if (r.success) {
          clearSelection();
          await loadConversations();
          await openConversation(r.data._id);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not start conversation.");
    } finally {
      setStarting(false);
    }
  };

  const openBatchChat = async (batchId) => {
    setError("");
    setStarting(true);
    try {
      const r = await chatService.openBatchConversation(batchId);
      if (r.success) {
        clearSelection();
        await loadConversations();
        await openConversation(r.data._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not open batch chat.");
    } finally {
      setStarting(false);
    }
  };

  const selectBatchMembers = (batch, includeTutor, studentIds) => {
    const next = new Set(selectedIds);
    if (includeTutor && batch.tutor?._id) next.add(batch.tutor._id);
    studentIds.forEach((id) => next.add(id));
    setSelectedIds(next);
  };

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeId) return;
    await chatService.sendMessage(activeId, text);
    socketRef.current?.emit("send_message", {
      conversationId: activeId,
      content: text,
    });
    setText("");
  };

  const activeConv = conversations.find((c) => c._id === activeId);
  const isOwn = (m) => String(m.sender?._id) === String(user._id);
  const selectedCount = selectedIds.size;

  const renderUserRow = (u) => (
    <label
      key={u._id}
      className="flex items-center gap-2 p-2 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/30 cursor-pointer"
    >
      <input
        type="checkbox"
        checked={selectedIds.has(u._id)}
        onChange={() => toggleSelect(u._id)}
        className="rounded border-brand-300"
      />
      <span className="text-sm flex-1 min-w-0">
        <span className="font-medium block truncate">{u.name}</span>
        <span className="text-xs text-slate-500 truncate">{u.email}</span>
      </span>
    </label>
  );

  return (
    <div className="grid xl:grid-cols-4 lg:grid-cols-3 gap-4 h-[calc(100vh-200px)] min-h-[520px]">
      {/* Inbox */}
      <div className="glass-card p-3 overflow-y-auto flex flex-col min-h-0">
        <h2 className="font-bold text-sm mb-2">Your chats</h2>
        {conversations.map((c) => (
          <button
            key={c._id}
            type="button"
            onClick={() => openConversation(c._id)}
            className={`w-full text-left p-2.5 rounded-xl mb-1.5 text-sm transition-colors ${
              activeId === c._id
                ? "bg-brand-500 text-white"
                : "hover:bg-brand-50 dark:hover:bg-brand-950/30"
            }`}
          >
            <p className="font-medium truncate">{c.title}</p>
            <p className="text-xs opacity-80 capitalize">{c.type?.replace("_", " ")}</p>
          </button>
        ))}
        {!conversations.length && (
          <p className="text-xs text-slate-500">No conversations yet.</p>
        )}
      </div>

      {/* Start conversation */}
      <div className="glass-card p-3 flex flex-col min-h-0 overflow-hidden">
        <h2 className="font-bold text-sm mb-2">Start conversation</h2>
        <input
          type="search"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field text-sm mb-2"
        />

        <div className="flex flex-wrap gap-1 mb-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-2 py-1 rounded-lg text-xs font-medium ${
                activeTab === t.id
                  ? "bg-brand-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 border-t border-brand-100 dark:border-brand-800 pt-2">
          {activeTab === "batches" &&
            filteredBatches.map((b) => (
              <div
                key={b._id}
                className="mb-3 p-2 rounded-xl border border-brand-100 dark:border-brand-800"
              >
                <p className="font-medium text-sm">{b.name}</p>
                <p className="text-xs text-slate-500 mb-2">
                  {b.course?.title || "Course"} · {b.students?.length || 0} students
                </p>
                <Button
                  type="button"
                  className="w-full text-xs py-1.5 mb-2"
                  disabled={starting}
                  onClick={() => openBatchChat(b._id)}
                >
                  Open batch chat
                </Button>
                {b.tutor && (
                  <label className="flex items-center gap-2 text-xs p-1">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(b.tutor._id)}
                      onChange={() => toggleSelect(b.tutor._id)}
                    />
                    Tutor: {b.tutor.name}
                  </label>
                )}
                {b.students?.map((s) => (
                  <label key={s._id} className="flex items-center gap-2 text-xs p-1">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(s._id)}
                      onChange={() => toggleSelect(s._id)}
                    />
                    {s.name}
                  </label>
                ))}
                {(b.tutor || b.students?.length > 0) && (
                  <button
                    type="button"
                    className="text-xs text-brand-600 mt-1 hover:underline"
                    onClick={() =>
                      selectBatchMembers(
                        b,
                        true,
                        (b.students || []).map((s) => s._id)
                      )
                    }
                  >
                    Select all in batch
                  </button>
                )}
              </div>
            ))}

          {activeTab !== "batches" && tabUsers.map(renderUserRow)}

          {activeTab === "batches" && !filteredBatches.length && (
            <p className="text-xs text-slate-500">No batches found.</p>
          )}
          {activeTab !== "batches" && !tabUsers.length && (
            <p className="text-xs text-slate-500">No {TABS.find((t) => t.id === activeTab)?.label} found.</p>
          )}
        </div>

        {selectedCount > 0 && (
          <div className="mt-2 pt-2 border-t border-brand-100 space-y-2 shrink-0">
            <p className="text-xs text-slate-600">
              {selectedCount} selected
              {selectedCount > 1 && " — group chat"}
            </p>
            {selectedCount > 1 && (
              <input
                placeholder="Group title (optional)"
                value={groupTitle}
                onChange={(e) => setGroupTitle(e.target.value)}
                className="input-field text-sm"
              />
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                className="flex-1 text-sm"
                disabled={starting}
                onClick={startSelectedChat}
              >
                {starting
                  ? "Starting..."
                  : selectedCount === 1
                    ? "Start 1-on-1"
                    : "Start group chat"}
              </Button>
              <button
                type="button"
                onClick={clearSelection}
                className="text-xs text-slate-500 px-2"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      </div>

      {/* Messages */}
      <div className="xl:col-span-2 lg:col-span-1 glass-card flex flex-col min-h-0">
        {activeId ? (
          <>
            <div className="p-3 border-b border-brand-100 flex items-center justify-between gap-2 shrink-0">
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{activeConv?.title}</p>
                <p className="text-xs text-slate-500 capitalize">
                  {activeConv?.type?.replace("_", " ")}
                  {activeConv?.participants?.length
                    ? ` · ${activeConv.participants.length} members`
                    : ""}
                </p>
              </div>
              {videoRoom?.roomId && (
                <Button type="button" onClick={() => setShowVideo((v) => !v)}>
                  {showVideo ? "Hide video" : "Video call"}
                </Button>
              )}
            </div>
            {showVideo && videoRoom?.roomId && (
              <div className="h-72 shrink-0 p-2">
                <IndLearnVideoRoom
                  roomId={videoRoom.roomId || videoRoom.roomName}
                  displayName={user.name}
                  iceServers={videoRoom.iceServers}
                  className="h-full"
                  onLeave={() => setShowVideo(false)}
                />
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
              {loading && <p className="text-sm text-slate-500">Loading...</p>}
              {messages.map((m) => (
                <div
                  key={m._id}
                  className={`max-w-[85%] p-2.5 rounded-xl text-sm ${
                    isOwn(m)
                      ? "ml-auto bg-brand-500 text-white"
                      : "bg-slate-100 dark:bg-slate-800"
                  }`}
                >
                  <p className="text-xs font-semibold opacity-80 mb-0.5">
                    {m.sender?.name} ({ROLE_LABELS[m.sender?.role] || m.sender?.role})
                  </p>
                  <p>{m.content}</p>
                </div>
              ))}
            </div>
            <form
              onSubmit={send}
              className="p-3 border-t border-brand-100 flex gap-2 shrink-0"
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                className="input-field flex-1 text-sm"
              />
              <Button type="submit">Send</Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm p-6 text-center">
            Select a chat from the list, open a batch chat, or pick people and start a new
            conversation.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatPanel;
