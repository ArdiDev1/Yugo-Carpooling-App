import { create } from "zustand";
import { persist } from "zustand/middleware";

// Detect system preference
function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Apply the resolved theme to <html data-theme="...">
function applyTheme(preference) {
  const resolved = preference === "system" ? getSystemTheme() : preference;
  document.documentElement.setAttribute("data-theme", resolved);
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      // "light" | "dark" | "system"
      preference: "system",

      setPreference(preference) {
        set({ preference });
        applyTheme(preference);
      },

      // Call once on app mount to apply persisted preference
      init() {
        applyTheme(get().preference);

        // Keep "system" mode in sync if OS theme changes
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        mq.addEventListener("change", () => {
          if (get().preference === "system") applyTheme("system");
        });
      },
    }),
    { name: "yugo-theme" }
  )
);
