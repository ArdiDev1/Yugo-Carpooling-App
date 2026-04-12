const VARIANTS = {
  open:      { bg: "#DCFCE7", color: "#16A34A", label: "OPEN" },
  closed:    { bg: "var(--color-border)", color: "var(--color-muted)", label: "CLOSED" },
  driver:    { bg: "var(--color-primary-light)", color: "var(--color-primary)", label: "DRIVER" },
  passenger: { bg: "#FFF7ED", color: "#EA580C", label: "PASSENGER" },
};

export default function Badge({ variant = "open", label }) {
  const v = VARIANTS[variant] ?? VARIANTS.open;
  return (
    <span
      style={{
        backgroundColor: v.bg,
        color:           v.color,
        fontSize:        11,
        fontWeight:      700,
        letterSpacing:   "0.05em",
        padding:         "2px 8px",
        borderRadius:    999,
        display:         "inline-block",
        textTransform:   "uppercase",
      }}
    >
      {label ?? v.label}
    </span>
  );
}
