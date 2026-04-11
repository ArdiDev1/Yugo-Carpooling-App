import api from "./api";

export const userService = {
  getProfile:    (userId) => api.get(`/users/${userId}`),
  updateProfile: (data)   => api.patch("/users/me", data),
  deleteAccount: ()       => api.delete("/users/me"),
  follow:        (userId) => api.post(`/users/${userId}/follow`),
  unfollow:      (userId) => api.delete(`/users/${userId}/follow`),
  rate:          (userId, rating) => api.post(`/users/${userId}/rate`, { rating }),
};
