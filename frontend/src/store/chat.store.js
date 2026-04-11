import { create } from "zustand";

export const useChatStore = create((set) => ({
  rooms:        [],
  activeRoomId: null,
  messages:     {},     // { [roomId]: Message[] }

  setRooms:     (rooms)            => set({ rooms }),
  setActiveRoom:(roomId)           => set({ activeRoomId: roomId }),
  setMessages:  (roomId, msgs)     => set((state) => ({
    messages: { ...state.messages, [roomId]: msgs },
  })),
  addMessage:   (roomId, message)  => set((state) => ({
    messages: {
      ...state.messages,
      [roomId]: [...(state.messages[roomId] ?? []), message],
    },
  })),
  markRoomRead: (roomId) => set((state) => ({
    rooms: state.rooms.map((r) =>
      r.id === roomId ? { ...r, unreadCount: 0 } : r
    ),
  })),
}));
