// ─────────────────────────────────────────────────────────────────────────────
// Modal — iOS-style bottom sheet with a dimmed backdrop.
//
// POSITIONING REQUIREMENT (important!):
//   This component uses `position: absolute` for both the backdrop and the
//   slide-up sheet. For them to cover the full screen, Modal must be rendered
//   as a child of a `position: relative` container that fills the screen —
//   specifically AppLayout's outer div (NOT inside the scroll container).
//
//   If you nest Modal inside an `overflow: auto` div, the browser clips it and
//   it will never appear. In App.jsx, the /create route passes CreatePage as
//   the `overlay` prop of AppLayout so it renders in the right place.
//
// ANIMATION:
//   Sheet slides up from the bottom via CSS transform.
//   Backdrop fades in/out via opacity.
//   Both transitions run in parallel (0.25–0.3s).
//
// USAGE:
//   <Modal isOpen={bool} onClose={fn} title="My Title">
//     {/* content inside the sheet */}
//   </Modal>
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from "react";

export default function Modal({ isOpen, onClose, title, children, showHandle = true }) {
  // Close on Escape key — good accessibility practice
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position:        "absolute",
          inset:           0,
          backgroundColor: "rgba(0,0,0,0.45)",
          zIndex:          100,
          opacity:         isOpen ? 1 : 0,
          pointerEvents:   isOpen ? "auto" : "none",
          transition:      "opacity 0.25s",
        }}
      />
      {/* Sheet */}
      <div
        style={{
          position:        "absolute",
          bottom:          0,
          left:            0,
          right:           0,
          backgroundColor: "#fff",
          borderRadius:    "20px 20px 0 0",
          zIndex:          101,
          transform:       isOpen ? "translateY(0)" : "translateY(100%)",
          transition:      "transform 0.3s cubic-bezier(0.32,0.72,0,1)",
          paddingBottom:   "env(safe-area-inset-bottom)",
          maxHeight:       "90%",
          display:         "flex",
          flexDirection:   "column",
        }}
      >
        {showHandle && (
          <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
            <div style={{ width: 40, height: 4, borderRadius: 999, backgroundColor: "#D1D5DB" }} />
          </div>
        )}
        {title && (
          <div
            style={{
              padding:       "12px 20px",
              fontSize:      17,
              fontWeight:    700,
              borderBottom:  "1px solid #F3F4F6",
              color:         "#111827",
            }}
          >
            {title}
          </div>
        )}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {children}
        </div>
      </div>
    </>
  );
}
