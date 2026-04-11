import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "../store/auth.store";
import { useChatStore } from "../store/chat.store";

export function useSocket(roomId) {
  const socketRef  = useRef(null);
  const token      = useAuthStore((state) => state.token);
  const addMessage = useChatStore((state) => state.addMessage);

  useEffect(() => {
    if (!roomId || !token) return;

    socketRef.current = io("http://localhost:8000", {
      auth:       { token },
      transports: ["websocket"],
    });

    socketRef.current.emit("join_room", { roomId });

    socketRef.current.on("new_message", (message) => {
      addMessage(roomId, message);
    });

    return () => {
      socketRef.current?.emit("leave_room", { roomId });
      socketRef.current?.disconnect();
    };
  }, [roomId, token, addMessage]);

  const sendMessage = (text) => {
    socketRef.current?.emit("send_message", { roomId, text });
  };

  return { sendMessage };
}
