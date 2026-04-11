import { LUGGAGE_OPTIONS } from "../../constants/categories";

export default function LuggageSelector({ value, onChange, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{label}</span>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {LUGGAGE_OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange?.(opt.value)}
              style={{
                display:         "flex",
                alignItems:      "center",
                gap:             4,
                padding:         "7px 12px",
                borderRadius:    999,
                border:          `1.5px solid ${active ? "#6C47FF" : "#E5E7EB"}`,
                backgroundColor: active ? "#EDE8FF" : "#fff",
                color:           active ? "#6C47FF" : "#6B7280",
                fontSize:        13,
                fontWeight:      active ? 700 : 500,
                cursor:          "pointer",
                transition:      "all 0.15s",
              }}
            >
              {opt.emoji} {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
