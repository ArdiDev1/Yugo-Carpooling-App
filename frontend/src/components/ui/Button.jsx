import Spinner from "./Spinner";

const VARIANTS = {
  primary:   { bg: "#6C47FF", color: "#fff",     border: "none" },
  secondary: { bg: "#EDE8FF", color: "#6C47FF",  border: "none" },
  ghost:     { bg: "transparent", color: "#6B7280", border: "1px solid #E5E7EB" },
  danger:    { bg: "#FEE2E2", color: "#EF4444",  border: "none" },
};

const SIZES = {
  sm: { padding: "6px 12px", fontSize: 13 },
  md: { padding: "10px 18px", fontSize: 15 },
  lg: { padding: "14px 24px", fontSize: 16 },
};

export default function Button({
  variant  = "primary",
  size     = "md",
  fullWidth = false,
  disabled  = false,
  loading   = false,
  onClick,
  type     = "button",
  children,
  style,
}) {
  const v = VARIANTS[variant] ?? VARIANTS.primary;
  const s = SIZES[size] ?? SIZES.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display:         "inline-flex",
        alignItems:      "center",
        justifyContent:  "center",
        gap:             8,
        backgroundColor: v.bg,
        color:           v.color,
        border:          v.border,
        borderRadius:    8,
        fontWeight:      600,
        cursor:          disabled || loading ? "not-allowed" : "pointer",
        opacity:         disabled ? 0.5 : 1,
        width:           fullWidth ? "100%" : "auto",
        ...s,
        ...style,
      }}
    >
      {loading && <Spinner size="sm" color={v.color} />}
      {children}
    </button>
  );
}
