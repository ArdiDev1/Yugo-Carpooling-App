import axios from "axios";

const api = axios.create({
  baseURL: `http://${window.location.hostname}:8000/api/v1`,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("carpool-auth");
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      if (state?.token) config.headers.Authorization = `Bearer ${state.token}`;
    } catch (_) {
      // malformed storage — ignore
    }
  }
  return config;
});

// On 401, clear auth and redirect to landing
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("carpool-auth");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default api;
