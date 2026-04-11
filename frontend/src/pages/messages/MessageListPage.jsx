import { useEffect } from "react";
import { useAuthStore } from "../../store/auth.store";
import { useChatStore } from "../../store/chat.store";
import { getUserById } from "../../mocks/users";
import { MOCK_ROOMS } from "../../mocks/messages";
import ChatRoomPreview from "../../components/messages/ChatRoomPreview";
import PageHeader from "../../components/layout/PageHeader";

const USE_MOCK = true;

export default function MessageListPage() {
  const user     = useAuthStore((s) => s.user);
  const { rooms, setRooms } = useChatStore();

  useEffect(() => {
    if (USE_MOCK) {
      setRooms(MOCK_ROOMS);
    } else {
      // TODO: fetch rooms from messageService and setRooms
    }
  }, [setRooms]);

  const userRooms = rooms.filter((r) => r.participants.includes(user?.id));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#F7F7F8" }}>
      <PageHeader title="Messages" showBack={false} />

      {userRooms.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", color: "#9CA3AF" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
          <p style={{ fontSize: 15, textAlign: "center" }}>No conversations yet.</p>
          <p style={{ fontSize: 13, textAlign: "center", marginTop: 4 }}>Match with a ride to start chatting!</p>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {userRooms.map((room) => {
            const otherId  = room.participants.find((id) => id !== user?.id);
            const otherUser = getUserById(otherId ?? "");
            return <ChatRoomPreview key={room.id} room={room} otherUser={otherUser} />;
          })}
        </div>
      )}
    </div>
  );
}
