import api from "./api";

export const postService = {
  getFeed:       (page = 0) => api.get(`/posts/feed?page=${page}`),
  getFollowing:  (page = 0) => api.get(`/posts/following?page=${page}`),
  getById:       (id)       => api.get(`/posts/${id}`),
  getByUser:     (userId)   => api.get(`/posts/by/${userId}`),
  create:        (data)     => api.post("/posts", data),
  update:        (id, data) => api.patch(`/posts/${id}`, data),
  close:         (id)       => api.patch(`/posts/${id}`, { status: "closed" }),
  delete:        (id)       => api.delete(`/posts/${id}`),
  like:          (id)       => api.post(`/posts/${id}/like`),
  unlike:        (id)       => api.delete(`/posts/${id}/like`),
  estimateGas:   (origin, destination, passengers = 1) =>
    api.get(`/posts/estimate-gas`, { params: { origin, destination, passengers } }),
};
