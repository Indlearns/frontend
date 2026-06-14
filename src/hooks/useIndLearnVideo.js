import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

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
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [joined, setJoined] = useState(false);

  const socketRef = useRef(null);
  const pcsRef = useRef(new Map());
  const localStreamRef = useRef(null);
  const iceServersRef = useRef(DEFAULT_ICE);

  useEffect(() => {
    iceServersRef.current = iceServers?.length ? iceServers : DEFAULT_ICE;
  }, [iceServers]);

  const updatePeers = useCallback((updater) => {
    setPeers((prev) => (typeof updater === "function" ? updater(prev) : updater));
  }, []);

  const removePeer = useCallback(
    (socketId) => {
      const pc = pcsRef.current.get(socketId);
      if (pc) {
        pc.close();
        pcsRef.current.delete(socketId);
      }
      updatePeers((prev) => prev.filter((p) => p.socketId !== socketId));
    },
    [updatePeers]
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

  const cleanup = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit("leave_video_room", { roomId });
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    pcsRef.current.forEach((pc) => pc.close());
    pcsRef.current.clear();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    setPeers([]);
    setJoined(false);
  }, [roomId]);

  useEffect(() => {
    if (!enabled || !roomId) return undefined;

    let mounted = true;

    const join = async () => {
      try {
        setError("");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;
        setLocalStream(stream);

        const token = localStorage.getItem("token");
        const socket = io(SOCKET_URL, { auth: { token } });
        socketRef.current = socket;

        socket.on("connect", () => {
          socket.emit("join_video_room", { roomId, displayName });
          setJoined(true);
        });

        socket.on("video_room_users", ({ users }) => {
          users.forEach((u) => createPeerConnection(u.socketId, u.name, true));
        });

        socket.on("video_user_joined", ({ user: u }) => {
          createPeerConnection(u.socketId, u.name, false);
        });

        socket.on("video_user_left", ({ socketId }) => removePeer(socketId));

        socket.on("video_signal", ({ from, signal, user: u }) => {
          handleSignal(from, signal, u?.name);
        });

        socket.on("connect_error", () => setError("Could not connect to video server."));
      } catch (err) {
        setError(
          err.name === "NotAllowedError"
            ? "Camera/microphone permission denied."
            : "Could not start video."
        );
      }
    };

    join();

    return () => {
      mounted = false;
      cleanup();
    };
  }, [enabled, roomId, displayName, createPeerConnection, handleSignal, removePeer, cleanup]);

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  };

  const toggleCam = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCamOn(track.enabled);
    }
  };

  return { peers, localStream, error, micOn, camOn, joined, toggleMic, toggleCam, leave: cleanup };
};
