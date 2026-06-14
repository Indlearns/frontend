import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { acquireLocalMedia, mediaErrorMessage } from "../utils/videoMedia";

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:5000";

const DEFAULT_ICE = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export const useIndLearnVideo = ({ roomId, displayName, iceServers, enabled }) => {
  const [peers, setPeers] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [error, setError] = useState("");
  const [mediaWarning, setMediaWarning] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [joined, setJoined] = useState(false);
  const [localSocketId, setLocalSocketId] = useState("");
  const [handRaised, setHandRaised] = useState(false);
  const [raisedHands, setRaisedHands] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [mediaRetrying, setMediaRetrying] = useState(false);

  const socketRef = useRef(null);
  const pcsRef = useRef(new Map());
  const localStreamRef = useRef(null);
  const iceServersRef = useRef(DEFAULT_ICE);
  const chatEndRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    iceServersRef.current = iceServers?.length ? iceServers : DEFAULT_ICE;
  }, [iceServers]);

  useEffect(() => {
    if (showChat) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, showChat]);

  const updatePeers = useCallback((updater) => {
    setPeers((prev) => (typeof updater === "function" ? updater(prev) : updater));
  }, []);

  const setHandForSocket = useCallback((socketId, name, raised) => {
    setRaisedHands((prev) => {
      if (!raised) {
        const next = { ...prev };
        delete next[socketId];
        return next;
      }
      return { ...prev, [socketId]: { name, raised: true } };
    });
  }, []);

  const attachStreamToPeers = useCallback((stream) => {
    pcsRef.current.forEach((pc) => {
      stream.getTracks().forEach((track) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === track.kind);
        if (sender) sender.replaceTrack(track);
        else pc.addTrack(track, stream);
      });
    });
  }, []);

  const removePeer = useCallback(
    (socketId) => {
      const pc = pcsRef.current.get(socketId);
      if (pc) {
        pc.close();
        pcsRef.current.delete(socketId);
      }
      updatePeers((prev) => prev.filter((p) => p.socketId !== socketId));
      setHandForSocket(socketId, "", false);
    },
    [updatePeers, setHandForSocket]
  );

  const createPeerConnection = useCallback(
    (remoteSocketId, remoteName, isInitiator) => {
      if (pcsRef.current.has(remoteSocketId)) return pcsRef.current.get(remoteSocketId);

      const pc = new RTCPeerConnection({ iceServers: iceServersRef.current });
      pcsRef.current.set(remoteSocketId, pc);

      localStreamRef.current?.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });

      pc.ontrack = (event) => {
        const stream = event.streams[0];
        updatePeers((prev) => {
          const exists = prev.find((p) => p.socketId === remoteSocketId);
          if (exists) {
            return prev.map((p) =>
              p.socketId === remoteSocketId ? { ...p, stream, name: remoteName || p.name } : p
            );
          }
          return [...prev, { socketId: remoteSocketId, name: remoteName || "Participant", stream }];
        });
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("video_signal", {
            roomId,
            to: remoteSocketId,
            signal: { type: "ice", candidate: event.candidate },
          });
        }
      };

      pc.onconnectionstatechange = () => {
        if (["failed", "closed", "disconnected"].includes(pc.connectionState)) {
          removePeer(remoteSocketId);
        }
      };

      if (isInitiator) {
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => {
            socketRef.current?.emit("video_signal", {
              roomId,
              to: remoteSocketId,
              signal: { type: "offer", sdp: pc.localDescription },
            });
          })
          .catch((err) => setError(err.message));
      }

      return pc;
    },
    [roomId, removePeer, updatePeers]
  );

  const handleSignal = useCallback(
    async (from, signal, remoteName) => {
      let pc = pcsRef.current.get(from);
      if (!pc) {
        pc = createPeerConnection(from, remoteName || "Participant", false);
      }

      if (signal.type === "offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketRef.current?.emit("video_signal", {
          roomId,
          to: from,
          signal: { type: "answer", sdp: pc.localDescription },
        });
      } else if (signal.type === "answer") {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
      } else if (signal.type === "ice" && signal.candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        } catch {
          /* ignore stale ICE */
        }
      }
    },
    [createPeerConnection, roomId]
  );

  const stopLocalTracks = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
  }, []);

  const applyLocalStream = useCallback(
    (stream, warning = "") => {
      if (!mountedRef.current) {
        stream?.getTracks().forEach((t) => t.stop());
        return;
      }
      stopLocalTracks();
      if (stream) {
        localStreamRef.current = stream;
        setLocalStream(stream);
        setMicOn(stream.getAudioTracks().some((t) => t.enabled));
        setCamOn(stream.getVideoTracks().some((t) => t.enabled));
        attachStreamToPeers(stream);
      } else {
        setMicOn(false);
        setCamOn(false);
      }
      setMediaWarning(warning);
      setError("");
    },
    [attachStreamToPeers, stopLocalTracks]
  );

  const connectSocket = useCallback(() => {
    if (socketRef.current?.connected) return;

    const token = localStorage.getItem("token");
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setLocalSocketId(socket.id);
      socket.emit("join_video_room", { roomId, displayName });
      setJoined(true);
      setError("");
    });

    socket.on("video_room_users", ({ users }) => {
      const hands = {};
      users.forEach((u) => {
        if (u.handRaised) hands[u.socketId] = { name: u.name, raised: true };
        createPeerConnection(u.socketId, u.name, true);
      });
      setRaisedHands(hands);
    });

    socket.on("video_user_joined", ({ user: u }) => {
      createPeerConnection(u.socketId, u.name, false);
    });

    socket.on("video_user_left", ({ socketId }) => removePeer(socketId));

    socket.on("video_signal", ({ from, signal, user: u }) => {
      handleSignal(from, signal, u?.name);
    });

    socket.on("video_hand_update", ({ socketId, name, raised }) => {
      if (socketId === socket.id) return;
      setHandForSocket(socketId, name, raised);
    });

    socket.on("video_chat_history", ({ messages }) => {
      if (Array.isArray(messages)) setChatMessages(messages);
    });

    socket.on("video_chat_message", ({ message }) => {
      if (message) {
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    });

    socket.on("connect_error", () => {
      setError("Could not connect to video server. Check your connection and try again.");
    });
  }, [
    roomId,
    displayName,
    createPeerConnection,
    handleSignal,
    removePeer,
    setHandForSocket,
  ]);

  const retryMedia = useCallback(async () => {
    setMediaRetrying(true);
    setMediaWarning("");
    try {
      const { stream, warning } = await acquireLocalMedia();
      applyLocalStream(stream, warning);
    } catch (err) {
      setError(mediaErrorMessage(err));
    } finally {
      setMediaRetrying(false);
    }
  }, [applyLocalStream]);

  const cleanup = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit("leave_video_room", { roomId });
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    pcsRef.current.forEach((pc) => pc.close());
    pcsRef.current.clear();
    stopLocalTracks();
    setPeers([]);
    setJoined(false);
    setLocalSocketId("");
    setHandRaised(false);
    setRaisedHands({});
    setChatMessages([]);
    setShowChat(false);
    setError("");
    setMediaWarning("");
  }, [roomId, stopLocalTracks]);

  useEffect(() => {
    if (!enabled || !roomId) return undefined;

    mountedRef.current = true;

    const join = async () => {
      setError("");
      setMediaWarning("");

      try {
        const { stream, warning } = await acquireLocalMedia();
        if (!mountedRef.current) {
          stream?.getTracks().forEach((t) => t.stop());
          return;
        }
        if (stream) {
          localStreamRef.current = stream;
          setLocalStream(stream);
          setMicOn(stream.getAudioTracks().some((t) => t.enabled));
          setCamOn(stream.getVideoTracks().some((t) => t.enabled));
        } else {
          setMicOn(false);
          setCamOn(false);
          setMediaWarning(warning || "Joined without camera/microphone.");
        }
      } catch (err) {
        if (!mountedRef.current) return;
        setMediaWarning(mediaErrorMessage(err));
        setMicOn(false);
        setCamOn(false);
      }

      connectSocket();
    };

    join();

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [enabled, roomId, displayName, connectSocket, cleanup]);

  const toggleMic = async () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioTrack = stream.getAudioTracks()[0];
      if (localStreamRef.current) {
        localStreamRef.current.addTrack(audioTrack);
        attachStreamToPeers(localStreamRef.current);
        setLocalStream(localStreamRef.current);
      } else {
        applyLocalStream(new MediaStream([audioTrack]));
      }
      setMicOn(true);
      setMediaWarning("");
    } catch (err) {
      setMediaWarning(mediaErrorMessage(err));
    }
  };

  const toggleCam = async () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCamOn(track.enabled);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoTrack = stream.getVideoTracks()[0];
      if (localStreamRef.current) {
        localStreamRef.current.addTrack(videoTrack);
        attachStreamToPeers(localStreamRef.current);
        setLocalStream(localStreamRef.current);
      } else {
        applyLocalStream(new MediaStream([videoTrack]));
      }
      setCamOn(true);
      setMediaWarning("");
    } catch (err) {
      setMediaWarning(mediaErrorMessage(err));
    }
  };

  const toggleRaiseHand = () => {
    const next = !handRaised;
    setHandRaised(next);
    if (localSocketId) {
      setHandForSocket(localSocketId, displayName, next);
    }
    socketRef.current?.emit("video_raise_hand", { roomId, raised: next });
  };

  const sendChatMessage = (text) => {
    const trimmed = text?.trim();
    if (!trimmed || !socketRef.current) return;
    socketRef.current.emit("video_chat_message", { roomId, text: trimmed });
  };

  const isHandRaised = (socketId) =>
    Boolean(raisedHands[socketId]?.raised) || (socketId === localSocketId && handRaised);

  return {
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
    raisedHands,
    isHandRaised,
    chatMessages,
    showChat,
    setShowChat,
    chatEndRef,
    toggleMic,
    toggleCam,
    toggleRaiseHand,
    sendChatMessage,
    leave: cleanup,
  };
};
