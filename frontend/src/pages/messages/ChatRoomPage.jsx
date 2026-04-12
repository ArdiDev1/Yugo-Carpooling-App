import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useChatStore } from "../../store/chat.store";
import { getUserById } from "../../mocks/users";
import { MOCK_MESSAGES, MOCK_ROOMS } from "../../mocks/messages";
import ChatBubble from "../../components/messages/ChatBubble";
import GasBotMessage from "../../components/messages/GasBotMessage";
import PageHeader from "../../components/layout/PageHeader";

const USE_MOCK = true;

export default function ChatRoomPage() {
  const { roomId }  = useParams();
  const user        = useAuthStore((s) => s.user);
  const { messages, setMessages, addMessage, markRoomRead } = useChatStore();
  const [text, setText]     = useState("");
  const [copied, setCopied] = useState(false);
  const bottomRef           = useRef(null);

  const handleCopyPhone = () => {
    if (!otherUser?.phone) return;
    navigator.clipboard.writeText(otherUser.phone).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const room     = MOCK_ROOMS.find((r) => r.id === roomId);
  const otherId  = room?.participants.find((id) => id !== user?.id);
  const otherUser = getUserById(otherId ?? "");

  useEffect(() => {
    if (USE_MOCK && MOCK_MESSAGES[roomId]) {
      setMessages(roomId, MOCK_MESSAGES[roomId]);
    }
    markRoomRead(roomId);
  }, [roomId, setMessages, markRoomRead]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages[roomId]?.length]);

  const roomMessages = messages[roomId] ?? [];

  const handleSend = () => {
    if (!text.trim()) return;
    const msg = {
      id:        `m-${Date.now()}`,
      roomId,
      senderId:  user?.id ?? "u1",
      text:      text.trim(),
      sentAt:    new Date().toISOString(),
      isGasBot:  false,
    };
    addMessage(roomId, msg);
    setText("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Track first message in each sender-run for avatar display
  let prevSender = null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#F7F7F8" }}>
      <PageHeader
        title={otherUser?.username ?? "Chat"}
        showBack
        rightAction={otherUser?.phone ? (
          <button
            onClick={handleCopyPhone}
            title={copied ? "Copied!" : "Copy phone number"}
            style={{
              background:     copied ? "#16A34A" : "rgba(255,255,255,0.12)",
              border:         "none",
              borderRadius:   "50%",
              width:          32,
              height:         32,
              cursor:         "pointer",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              transition:     "background 0.2s",
              flexShrink:     0,
            }}
          >
            {copied ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f8f7f2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f8f7f2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6 6l.94-.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 16z" />
              </svg>
            )}
          </button>
        ) : null}
      />

      {/* Ride summary chip */}
      {room?.postSummary && (
        <div style={{ padding: "6px 16px", backgroundColor: "#EDE8FF" }}>
          <span style={{ fontSize: 12, color: "#6C47FF", fontWeight: 600 }}>🚗 {room.postSummary}</span>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", paddingTop: 8, paddingBottom: 8 }}>
        {roomMessages.map((msg) => {
          if (msg.isGasBot) {
            prevSender = "gasbot";
            return <GasBotMessage key={msg.id} gasData={msg.gasData} />;
          }
          const isOwn      = msg.senderId === user?.id;
          const showAvatar = !isOwn && msg.senderId !== prevSender;
          prevSender = msg.senderId;
          const sender     = getUserById(msg.senderId);
          return (
            <ChatBubble
              key={msg.id}
              message={msg}
              isOwnMessage={isOwn}
              senderName={sender?.name ?? ""}
              showAvatar={showAvatar}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        display:         "flex",
        alignItems:      "center",
        gap:             8,
        padding:         "10px 12px",
        backgroundColor: "#fff",
        borderTop:       "1px solid #E5E7EB",
        paddingBottom:   "calc(10px + env(safe-area-inset-bottom))",
        flexShrink:      0,
      }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message..."
          style={{
            flex:            1,
            border:          "1px solid #E5E7EB",
            borderRadius:    20,
            padding:         "8px 14px",
            fontSize:        14,
            outline:         "none",
            backgroundColor: "#F7F7F8",
          }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          style={{
            width:           36,
            height:          36,
            borderRadius:    "50%",
            backgroundColor: text.trim() ? "#6C47FF" : "#E5E7EB",
            border:          "none",
            cursor:          text.trim() ? "pointer" : "default",
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            flexShrink:      0,
            transition:      "background-color 0.2s",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
