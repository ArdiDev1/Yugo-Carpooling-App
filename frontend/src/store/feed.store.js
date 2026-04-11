import { create } from "zustand";

export const useFeedStore = create((set) => ({
  activeTab: "forYou",   // "forYou" | "following"

  filter: {
    postType:     "all", // "all" | "request" | "offer"
    fromLocation: "",
    toLocation:   "",
    date:         null,
  },

  setActiveTab: (tab)   => set({ activeTab: tab }),
  setFilter:    (patch) => set((state) => ({ filter: { ...state.filter, ...patch } })),
  resetFilter:  ()      => set({
    filter: { postType: "all", fromLocation: "", toLocation: "", date: null },
  }),
}));
