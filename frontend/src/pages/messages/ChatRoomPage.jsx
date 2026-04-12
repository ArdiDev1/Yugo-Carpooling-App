import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { messageService } from "../../services/message.service";
import ChatBubble from "../../components/messages/ChatBubble";
import GasBotMessage from "../../components/messages/GasBotMessage";
import PageHeader from "../../components/layout/PageHeader";

function normalizeMessage(doc) {
  return {
    id:       doc.id,
    roomId:   doc.room_id,
    senderId: doc.sender_id,
    text:     doc.text,
    isGasBot: doc.is_gasbot ?? false,
    gasData:  doc.gas_data ?? null,
    sentAt:   doc.sent_at,
  };
}

export default function ChatRoomPage() {
  const { roomId }  = useParams();
  const user        = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState([]);
  const [room, setRoom]         = useState(null);
  const [text, setText]         = useState("");
  const [sending, setSending]   = useState(false);
  const [copied, setCopied]     = useState(false);
  const bottomRef               = useRef(null);

  const loadMessages = useCallback(() => {
    messageService.getMessages(roomId)
      .then((res) => setMessages((res.data ?? []).map(normalizeMessage)))
      .catch(() => {});
  }, [roomId]);

  // Load room info from rooms list
  useEffect(() => {
    messageService.getRooms()
      .then((res) => {
        const found = (res.data ?? []).find((r) => r.id === roomId);
        if (found) setRoom(found);
      })
      .catch(() => {});
  }, [roomId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  const otherId   = room?.participants?.find((id) => id !== user?.id);
  const otherName = room?.names?.[otherId] ?? "Chat";

  const handleCopyPhone = () => {
    const phone = room?.phone;
    if (!phone) return;
    navigator.clipboard.writeText(phone).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const optimistic = {
      id:       `opt-${Date.now()}`,
      roomId,
      senderId: user?.id,
      text:     text.trim(),
      isGasBot: false,
      gasData:  null,
      sentAt:   new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setText("");
    setSending(true);
    try {
      await messageService.send(roomId, optimistic.text);
      // Refresh to get server-side message with real id
      loadMessages();
    } catch {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setText(optimistic.text);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  let prevSender = null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#F7F7F8" }}>
      <PageHeader
        title={otherName}
        showBack
        rightAction={room?.phone ? (
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
      {room?.post_summary && (
        <div style={{ padding: "6px 16px", backgroundColor: "#EDE8FF" }}>
          <span style={{ fontSize: 12, color: "#6C47FF", fontWeight: 600 }}>🚗 {room.post_summary}</span>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", paddingTop: 8, paddingBottom: 8 }}>
        {messages.map((msg) => {
          if (msg.isGasBot) {
            prevSender = "gasbot";
            return (
              <div key={msg.id} style={{ margin: "10px 12px", padding: "12px 14px", backgroundColor: "#EDE8FF", borderRadius: 12, border: "1.5px solid #6C47FF" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>🤖</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#6C47FF" }}>GasBot</span>
                </div>
                <div style={{ fontSize: 13, color: "#4C1D95", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {msg.text}
                </div>
              </div>
            );
          }
          // Driver is always on the right, passenger always on the left —
          // fixed regardless of which account is viewing the chat.
          const isDriverMsg  = msg.senderId === room?.driver_id;
          const showAvatar   = !isDriverMsg && msg.senderId !== prevSender;
          prevSender = msg.senderId;
          const senderName = room?.names?.[msg.senderId] ?? "";
          return (
            <ChatBubble
              key={msg.id}
              message={msg}
              isOwnMessage={isDriverMsg}
              senderName={senderName}
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
          disabled={!text.trim() || sending}
          style={{
            width:           36,
            height:          36,
            borderRadius:    "50%",
            backgroundColor: text.trim() && !sending ? "#6C47FF" : "#E5E7EB",
            border:          "none",
            cursor:          text.trim() && !sending ? "pointer" : "default",
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
