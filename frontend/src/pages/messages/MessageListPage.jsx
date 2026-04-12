import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/auth.store";
import { messageService } from "../../services/message.service";
import ChatRoomPreview from "../../components/messages/ChatRoomPreview";
import PageHeader from "../../components/layout/PageHeader";
import messageIcon from "../../assets/message_icon.png";

function normalizeRoom(doc) {
  return {
    id:            doc.id,
    participants:  doc.participants ?? [],
    postSummary:   doc.post_summary ?? "",
    lastMessage:   doc.last_message ?? "",
    lastMessageAt: doc.last_message_at ?? doc.created_at ?? new Date().toISOString(),
    unreadCount:   doc.unread_counts
      ? Object.values(doc.unread_counts).reduce((a, b) => a + b, 0)
      : 0,
    names:         doc.names ?? {},
    driverId:      doc.driver_id,
    passengerId:   doc.passenger_id,
  };
}

export default function MessageListPage() {
  const user = useAuthStore((s) => s.user);
  const [rooms, setRooms]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    messageService.getRooms()
      .then((res) => setRooms((res.data ?? []).map(normalizeRoom)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#F7F7F8" }}>
      <PageHeader title="Messages" showBack={false} />

      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", fontSize: 14 }}>
          Loading…
        </div>
      ) : rooms.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", color: "#9CA3AF" }}>
          <img src={messageIcon} alt="messages" style={{ width: 48, height: 48, marginBottom: 12, objectFit: "contain", display: "block" }} />
          <p style={{ fontSize: 15, textAlign: "center" }}>No conversations yet.</p>
          <p style={{ fontSize: 13, textAlign: "center", marginTop: 4 }}>Match with a ride to start chatting!</p>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {rooms.map((room) => {
            const otherId   = room.participants.find((id) => id !== user?.id);
            const otherName = room.names?.[otherId] ?? "Unknown";
            const otherUser = { id: otherId, name: otherName, username: otherName };
            return <ChatRoomPreview key={room.id} room={room} otherUser={otherUser} />;
          })}
        </div>
      )}
    </div>
  );
}
