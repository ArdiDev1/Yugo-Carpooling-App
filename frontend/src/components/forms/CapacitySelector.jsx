export default function CapacitySelector({ value = 1, onChange, min = 1, max = 3, label }) {
  const decrement = () => onChange?.(Math.max(min, value - 1));
  const increment = () => onChange?.(Math.min(max, value + 1));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{label}</span>}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          style={{
            width:           36,
            height:          36,
            borderRadius:    "50%",
            border:          "1.5px solid #E5E7EB",
            backgroundColor: "#fff",
            fontSize:        20,
            lineHeight:      1,
            cursor:          value <= min ? "not-allowed" : "pointer",
            opacity:         value <= min ? 0.4 : 1,
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            color:           "#374151",
          }}
        >
          −
        </button>
        <span style={{ fontSize: 24, fontWeight: 700, color: "#111827", minWidth: 32, textAlign: "center" }}>
          {value}
        </span>
        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          style={{
            width:           36,
            height:          36,
            borderRadius:    "50%",
            border:          "1.5px solid #E5E7EB",
            backgroundColor: value >= max ? "#F3F4F6" : "#6C47FF",
            fontSize:        20,
            lineHeight:      1,
            cursor:          value >= max ? "not-allowed" : "pointer",
            opacity:         value >= max ? 0.4 : 1,
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            color:           value >= max ? "#9CA3AF" : "#fff",
          }}
        >
          +
        </button>
        <span style={{ fontSize: 13, color: "#9CA3AF" }}>passengers (max {max})</span>
      </div>
    </div>
  );
}
