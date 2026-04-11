import { useNavigate } from "react-router-dom";
import Avatar from "../ui/Avatar";
import { buildRoute } from "../../constants/routes";

function formatRelativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function ChatRoomPreview({ room, otherUser }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(buildRoute.chat(room.id))}
      style={{
        display:         "flex",
        alignItems:      "center",
        gap:             12,
        padding:         "14px 16px",
        backgroundColor: "#fff",
        border:          "none",
        borderBottom:    "1px solid #F3F4F6",
        cursor:          "pointer",
        width:           "100%",
        textAlign:       "left",
      }}
    >
      <Avatar name={otherUser?.name ?? "?"} src={otherUser?.avatarUrl} size="md" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
            {otherUser?.username ?? "Unknown"}
          </span>
          <span style={{ fontSize: 11, color: "#9CA3AF", flexShrink: 0, marginLeft: 8 }}>
            {formatRelativeTime(room.lastMessageAt)}
          </span>
        </div>
        <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {room.postSummary}
        </div>
        <div style={{ fontSize: 13, color: room.unreadCount ? "#111827" : "#9CA3AF", fontWeight: room.unreadCount ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {room.lastMessage}
        </div>
      </div>
      {room.unreadCount > 0 && (
        <div style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: "#6C47FF", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {room.unreadCount}
        </div>
      )}
    </button>
  );
}
