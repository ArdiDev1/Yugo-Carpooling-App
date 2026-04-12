import api from "./api";

export const authService = {
  login:         (email, password) => api.post("/auth/login", { email, password }),
  me:            ()                => api.get("/auth/me"),
  logout:        ()                => api.post("/auth/logout"),
  uploadLicense: (formData)        => api.post("/auth/verify-license", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),

  registerPassenger: (data) => api.post("/auth/passenger/register", data),
  registerDriver:    (data) => api.post("/auth/driver/register",    data),
};
