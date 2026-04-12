import { useState } from "react";
import { Pencil } from "lucide-react";
import { PAYMENT_METHODS } from "../../constants/categories";

function EditPaymentSheet({ selected, onClose, onSave }) {
  const [draft, setDraft] = useState(new Set(selected));

  const toggle = (value) => {
    setDraft((prev) => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position:        "fixed",
          inset:           0,
          backgroundColor: "rgba(0,0,0,0.45)",
          zIndex:          1000,
          animation:       "pmFadeIn 0.18s ease",
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position:        "fixed",
          bottom:          0,
          left:            "50%",
          transform:       "translateX(-50%)",
          width:           "min(390px, 100vw)",
          backgroundColor: "#fff",
          borderRadius:    "20px 20px 0 0",
          zIndex:          1001,
          padding:         "20px 20px 36px",
          animation:       "pmSlideUp 0.25s cubic-bezier(0.32,0.72,0,1)",
          paddingBottom:   "calc(36px + env(safe-area-inset-bottom))",
        }}
      >
        <style>{`
          @keyframes pmFadeIn   { from { opacity: 0; } to { opacity: 1; } }
          @keyframes pmSlideUp  { from { transform: translateX(-50%) translateY(100%); } to { transform: translateX(-50%) translateY(0); } }
        `}</style>

        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, backgroundColor: "#D1D5DB" }} />
        </div>

        <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 16 }}>
          Payment Methods
        </div>

        {/* Options grid */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
          {PAYMENT_METHODS.map(({ value, label }) => {
            const active = draft.has(value);
            return (
              <button
                key={value}
                onClick={() => toggle(value)}
                style={{
                  padding:         "9px 18px",
                  borderRadius:    999,
                  border:          `2px solid ${active ? "#6C47FF" : "#E5E7EB"}`,
                  backgroundColor: active ? "#EDE8FF" : "#F9FAFB",
                  color:           active ? "#6C47FF" : "#6B7280",
                  fontSize:        14,
                  fontWeight:      active ? 700 : 500,
                  cursor:          "pointer",
                  transition:      "all 0.15s",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Save */}
        <button
          onClick={() => onSave([...draft])}
          style={{
            width:           "100%",
            padding:         "13px 0",
            borderRadius:    12,
            border:          "none",
            background:      "linear-gradient(135deg, #7966fc, #fa6bae)",
            color:           "#fff",
            fontSize:        15,
            fontWeight:      700,
            cursor:          "pointer",
            boxShadow:       "0 4px 14px rgba(121,102,252,0.3)",
          }}
        >
          Save
        </button>
      </div>
    </>
  );
}

export default function PaymentMethods({ methods = [], isOwnProfile = false }) {
  const [showEdit, setShowEdit]   = useState(false);
  const [selected, setSelected]   = useState(methods);

  if (!selected.length && !isOwnProfile) return null;

  const handleSave = (updated) => {
    setSelected(updated);
    setShowEdit(false);
  };

  return (
    <>
      <div style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>💳 Payment</div>
          {isOwnProfile && (
            <button
              onClick={() => setShowEdit(true)}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "#9CA3AF", padding: 4 }}
            >
              <Pencil size={15} />
            </button>
          )}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {selected.length === 0 && isOwnProfile && (
            <span style={{ fontSize: 13, color: "#9CA3AF" }}>No payment methods added</span>
          )}
          {selected.map((m) => {
            const opt = PAYMENT_METHODS.find((p) => p.value === m);
            return (
              <span
                key={m}
                style={{
                  backgroundColor: "#EDE8FF",
                  color:           "#6C47FF",
                  fontSize:        13,
                  fontWeight:      600,
                  padding:         "5px 12px",
                  borderRadius:    999,
                }}
              >
                {opt?.label ?? m}
              </span>
            );
          })}
        </div>
      </div>

      {showEdit && (
        <EditPaymentSheet
          selected={selected}
          onClose={() => setShowEdit(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
