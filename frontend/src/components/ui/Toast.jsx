import { useToastStore } from "../../store/toast.store";

const STYLES = {
  success: { bg: "#065F46", color: "#fff",     icon: "✓" },
  error:   { bg: "#991B1B", color: "#fff",     icon: "✕" },
  info:    { bg: "#1e3a8a", color: "#fff",     icon: "ℹ" },
};

export default function Toast() {
  const { toasts, dismiss } = useToastStore();
  if (!toasts.length) return null;

  return (
    <div
      style={{
        position:      "absolute",
        top:           12,
        left:          12,
        right:         12,
        zIndex:        9999,
        display:       "flex",
        flexDirection: "column",
        gap:           8,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => {
        const s = STYLES[t.type] ?? STYLES.success;
        return (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            style={{
              background:    s.bg,
              color:         s.color,
              borderRadius:  10,
              padding:       "11px 14px",
              fontSize:      13,
              fontWeight:    600,
              lineHeight:    1.4,
              display:       "flex",
              alignItems:    "center",
              gap:           9,
              boxShadow:     "0 4px 16px rgba(0,0,0,0.18)",
              pointerEvents: "auto",
              cursor:        "pointer",
              animation:     "toast-slide-down 0.22s ease",
            }}
          >
            <span
              style={{
                width:          20,
                height:         20,
                borderRadius:   "50%",
                background:     "rgba(255,255,255,0.25)",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                fontSize:       12,
                fontWeight:     800,
                flexShrink:     0,
              }}
            >
              {s.icon}
            </span>
            {t.message}
          </div>
        );
      })}
    </div>
  );
}
