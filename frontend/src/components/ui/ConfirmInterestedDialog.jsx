import { createPortal } from "react-dom";
import questioningIcon from "../../assets/questioning_icon.png";

export default function ConfirmInterestedDialog({ isOpen, onClose, onConfirm, date, time }) {
  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
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

      {/* Dialog */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          position:        "fixed",
          top:             "50%",
          left:            "50%",
          transform:       "translate(-50%, -50%)",
          backgroundColor: "#fff",
          borderRadius:    20,
          padding:         "28px 24px 20px",
          zIndex:          2001,
          width:           "min(320px, 88vw)",
          boxShadow:       "0 24px 64px rgba(0,0,0,0.22)",
          textAlign:       "center",
          animation:       "popIn 0.22s cubic-bezier(0.175,0.885,0.32,1.275)",
        }}
      >
        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes popIn  { from { opacity: 0; transform: translate(-50%,-48%) scale(0.92); } to { opacity: 1; transform: translate(-50%,-50%) scale(1); } }
        `}</style>

        {/* Icon */}
        <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
          <img src={questioningIcon} alt="" style={{ width: 53, height: 53, objectFit: "contain" }} />
        </div>

        <div style={{ fontSize: 17, fontWeight: 800, color: "#111827", marginBottom: 8, letterSpacing: "-0.3px" }}>
          Can you make it?
        </div>

        <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 22, lineHeight: 1.6 }}>
          {date && <div style={{ fontWeight: 600, color: "#374151" }}>{date}</div>}
          {time && <div>{time}</div>}
          <div style={{ marginTop: 6, fontSize: 12 }}>Confirm that you're interested and available for this ride.</div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex:         1,
              padding:      "11px 0",
              borderRadius: 12,
              border:       "1.5px solid #E5E7EB",
              background:   "#fff",
              color:        "#374151",
              fontSize:     14,
              fontWeight:   600,
              cursor:       "pointer",
              transition:   "background 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#F9FAFB"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
          >
            Not now
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex:         1,
              padding:      "11px 0",
              borderRadius: 12,
              border:       "none",
              background:   "linear-gradient(135deg, #fa6bae, #7966fc)",
              color:        "#fff",
              fontSize:     14,
              fontWeight:   700,
              cursor:       "pointer",
              boxShadow:    "0 4px 14px rgba(121,102,252,0.35)",
              transition:   "opacity 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            I'm in!
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
