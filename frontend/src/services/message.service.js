import api from "./api";

export const messageService = {
  getRooms:     ()                          => api.get("/messages/rooms"),
  getMessages:  (roomId, page = 0)          => api.get(`/messages/rooms/${roomId}?page=${page}`),
  send:         (roomId, text)              => api.post(`/messages/rooms/${roomId}`, { text }),
  createRoom:   (postId, passengerId) => api.post("/messages/rooms", {
    post_id:      postId,
    passenger_id: passengerId,
  }),
};
