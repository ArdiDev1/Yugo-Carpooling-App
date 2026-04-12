import api from "./api";

export const mapService = {
  getConfig: (lat = 43.7022, lng = -72.2896, zoom = 13) =>
    api.get(`/map/config?lat=${lat}&lng=${lng}&zoom=${zoom}`),

  geocode: (address) => api.post("/map/geocode", { address }),
};
