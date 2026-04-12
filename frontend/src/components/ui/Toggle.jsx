export default function Toggle({ checked = false, onChange, label, disabled = false }) {
  return (
    <label
      style={{
        display:    "flex",
        alignItems: "center",
        gap:        8,
        cursor:     disabled ? "not-allowed" : "pointer",
        opacity:    disabled ? 0.5 : 1,
        userSelect: "none",
      }}
    >
      {/* Hidden native checkbox for accessibility */}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
      />
      {/* Visual pill */}
      <div
        style={{
          width:           44,
          height:          24,
          borderRadius:    999,
          backgroundColor: checked ? "var(--color-primary)" : "var(--color-border)",
          position:        "relative",
          transition:      "background-color 0.2s",
          flexShrink:      0,
        }}
      >
        <div
          style={{
            position:        "absolute",
            top:             2,
            left:            checked ? 22 : 2,
            width:           20,
            height:          20,
            borderRadius:    "50%",
            backgroundColor: "var(--color-surface)",
            boxShadow:       "0 1px 3px rgba(0,0,0,0.2)",
            transition:      "left 0.2s",
          }}
        />
      </div>
      {label && (
        <span style={{ fontSize: 14, color: "var(--color-text)" }}>{label}</span>
      )}
    </label>
  );
}
