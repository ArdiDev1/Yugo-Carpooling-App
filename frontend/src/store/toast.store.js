import { create } from "zustand";

let _nextId = 0;
const DISMISS_MS = 3000;

export const useToastStore = create((set) => ({
  toasts: [],

  show: (message, type = "success") => {
    const id = ++_nextId;
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, DISMISS_MS);
  },

  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
