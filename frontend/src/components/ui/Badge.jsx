const VARIANTS = {
  open:      { bg: "rgba(34,197,94,0.16)",  color: "#22c55e",                label: "OPEN"      },
  closed:    { bg: "var(--color-border)",   color: "var(--color-muted)",     label: "CLOSED"    },
  driver:    { bg: "var(--color-primary-light)", color: "var(--color-primary)", label: "DRIVER" },
  passenger: { bg: "rgba(249,115,22,0.18)", color: "#fb923c",                label: "PASSENGER" },
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
