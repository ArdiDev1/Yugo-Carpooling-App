import Avatar from "../ui/Avatar";

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function ChatBubble({ message, isOwnMessage = false, senderName = "", showAvatar = false }) {
  return (
    <div
      style={{
        display:       "flex",
        flexDirection: isOwnMessage ? "row-reverse" : "row",
        alignItems:    "flex-end",
        gap:           6,
        marginBottom:  6,
        padding:       "0 12px",
      }}
    >
      {!isOwnMessage && (
        <div style={{ flexShrink: 0, width: 28 }}>
          {showAvatar && <Avatar name={senderName} size="sm" />}
        </div>
      )}
      <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: isOwnMessage ? "flex-end" : "flex-start", gap: 2 }}>
        <div
          style={{
            backgroundColor: isOwnMessage ? "#07104e" : "#d1d5db",
            color:           isOwnMessage ? "#f8f7f2" : "#111827",
            padding:         "8px 12px",
            borderRadius:    isOwnMessage ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
            fontSize:        14,
            lineHeight:      1.5,
            wordBreak:       "break-word",
          }}
        >
          {message.text}
        </div>
        <span style={{ fontSize: 10, color: "#9CA3AF" }}>{formatTime(message.sentAt)}</span>
      </div>
    </div>
  );
}
