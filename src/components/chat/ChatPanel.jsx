import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { chatService } from "../../services/chatService";
import Button from "../common/Button";
import IndLearnVideoRoom from "../video/IndLearnVideoRoom";

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const ChatPanel = ({ title = "Messages", subtitle, showNewChat = true }) => {
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [videoRoom, setVideoRoom] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const loadConversations = async () => {
    const r = await chatService.getConversations();
    if (r.success) setConversations(r.data);
  };

  const loadContacts = async () => {
    const r = await chatService.getContacts();
    if (r.success) setContacts(r.data);
  };

  const loadMessages = async (id) => {
    setLoading(true);
    await chatService.joinConversation(id);
    const r = await chatService.getMessages(id);
    if (r.success) setMessages(r.data);
    setActiveId(id);
    setShowVideo(false);

    const vr = await chatService.getVideoConfig(id);
    if (vr.success) setVideoRoom(vr.data);

    if (socketRef.current) socketRef.current.disconnect();
    const token = localStorage.getItem("token");
    socketRef.current = io(SOCKET_URL, { auth: { token } });
    socketRef.current.emit("join_conversation", id);
    socketRef.current.on("new_message", (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });
    setLoading(false);
  };

  const startChat = async (targetUserId) => {
    const r = await chatService.startDoubtChat(targetUserId);
    if (r.success) {
      await loadConversations();
      await loadMessages(r.data._id);
      setShowContacts(false);
    }
  };

  useEffect(() => {
    loadConversations();
    if (showNewChat) loadContacts();
    return () => socketRef.current?.disconnect();
  }, [showNewChat]);

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

  return (
    <div>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>}
          {subtitle && <p className="text-slate-600 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-220px)] min-h-[420px]">
        <div className="glass-card p-4 overflow-y-auto flex flex-col">
          {showNewChat && (
            <Button
              type="button"
              className="mb-3 w-full"
              onClick={() => setShowContacts((v) => !v)}
            >
              {showContacts ? "Hide contacts" : "New chat"}
            </Button>
          )}
          {showContacts && (
            <div className="mb-4 max-h-40 overflow-y-auto border-b border-brand-100 pb-3">
              {contacts.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => startChat(c._id)}
                  className="w-full text-left p-2 rounded-lg text-sm hover:bg-brand-50 dark:hover:bg-brand-950/30"
                >
                  {c.name} <span className="text-xs text-slate-500">({c.role})</span>
                </button>
              ))}
              {!contacts.length && (
                <p className="text-xs text-slate-500">No contacts available.</p>
              )}
            </div>
          )}
          <h2 className="font-bold mb-3">Chats</h2>
          {conversations.map((c) => (
            <button
              key={c._id}
              type="button"
              onClick={() => loadMessages(c._id)}
              className={`w-full text-left p-3 rounded-xl mb-2 transition-colors ${
                activeId === c._id
                  ? "bg-brand-500 text-white"
                  : "hover:bg-brand-50 dark:hover:bg-brand-950/30"
              }`}
            >
              <p className="font-medium text-sm">{c.title}</p>
              <p className="text-xs opacity-80 capitalize">{c.type?.replace("_", " ")}</p>
            </button>
          ))}
          {!conversations.length && (
            <p className="text-sm text-slate-500">No chats yet. Start a new conversation.</p>
          )}
        </div>

        <div className="lg:col-span-2 glass-card flex flex-col min-h-0">
          {activeId ? (
            <>
              <div className="p-3 border-b border-brand-100 flex items-center justify-between gap-2">
                <p className="font-semibold text-sm truncate">{activeConv?.title}</p>
                {videoRoom?.roomId && (
                  <Button type="button" onClick={() => setShowVideo((v) => !v)}>
                    {showVideo ? "Hide video" : "Video call"}
                  </Button>
                )}
              </div>
              {showVideo && videoRoom?.roomId && (
                <div className="h-72 md:h-96 shrink-0 p-2">
                  <IndLearnVideoRoom
                    roomId={videoRoom.roomId || videoRoom.roomName}
                    displayName={user.name}
                    iceServers={videoRoom.iceServers}
                    className="h-full"
                    onLeave={() => setShowVideo(false)}
                  />
                </div>
              )}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                {loading && <p className="text-sm text-slate-500">Loading...</p>}
                {messages.map((m) => (
                  <div
                    key={m._id}
                    className={`max-w-[85%] p-3 rounded-xl text-sm ${
                      isOwn(m)
                        ? "ml-auto bg-brand-500 text-white"
                        : "bg-slate-100 dark:bg-slate-800"
                    }`}
                  >
                    <p className="text-xs font-semibold opacity-80 mb-1">
                      {m.sender?.name} ({m.sender?.role})
                    </p>
                    <p>{m.content}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={send} className="p-4 border-t border-brand-100 flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="input-field flex-1"
                />
                <Button type="submit">Send</Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Select a conversation or start a new chat
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
