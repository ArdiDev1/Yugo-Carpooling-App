import { createPortal } from "react-dom";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel  = "Confirm",
  cancelLabel   = "Cancel",
  destructive   = false,
}) {
  if (!isOpen) return null;

  return createPortal(
    <>
      <div
        onClick={onClose}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          position:        "fixed",
          inset:           0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex:          2000,
          animation:       "fadeIn 0.18s ease",
        }}
      />

      <div
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          position:        "fixed",
          top:             "50%",
          left:            "50%",
          transform:       "translate(-50%, -50%)",
          backgroundColor: "var(--color-surface)",
          border:          "1px solid var(--color-border)",
          borderRadius:    20,
          padding:         "26px 24px 20px",
          zIndex:          2001,
          width:           "min(320px, 88vw)",
          boxShadow:       "0 24px 64px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04)",
          textAlign:       "center",
          animation:       "popIn 0.22s cubic-bezier(0.175,0.885,0.32,1.275)",
        }}
      >
        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes popIn  { from { opacity: 0; transform: translate(-50%,-48%) scale(0.92); } to { opacity: 1; transform: translate(-50%,-50%) scale(1); } }
        `}</style>

        <div style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text)", marginBottom: 8, letterSpacing: "-0.3px" }}>
          {title}
        </div>

        {body && (
          <div style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 22, lineHeight: 1.6 }}>
            {body}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex:         1,
              padding:      "11px 0",
              borderRadius: 12,
              border:       "1.5px solid var(--color-border)",
              background:   "var(--color-background)",
              color:        "var(--color-text)",
              fontSize:     14,
              fontWeight:   600,
              cursor:       "pointer",
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex:         1,
              padding:      "11px 0",
              borderRadius: 12,
              border:       "none",
              background:   destructive
                ? "linear-gradient(135deg, #ef4444, #dc2626)"
                : "linear-gradient(135deg, #fa6bae, #7966fc)",
              color:        "#fff",
              fontSize:     14,
              fontWeight:   700,
              cursor:       "pointer",
              boxShadow:    destructive
                ? "0 4px 14px rgba(239,68,68,0.35)"
                : "0 4px 14px rgba(121,102,252,0.35)",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
