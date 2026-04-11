import api from "./api";

export const authService = {
  signup:         (data)           => api.post("/auth/signup", data),
  login:          (email, password) => api.post("/auth/login", { email, password }),
  verifyEmail:    (code)           => api.post("/auth/verify-email", { code }),
  uploadLicense:  (formData)       => api.post("/auth/verify-license", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  me:             ()               => api.get("/auth/me"),
  logout:         ()               => api.post("/auth/logout"),
};
