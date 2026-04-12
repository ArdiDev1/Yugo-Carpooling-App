import Spinner from "./Spinner";

const VARIANTS = {
  primary:   { bg: "#7966fc", color: "#fff",     border: "none",                    isGradient: false },
  gradient:  { bg: "linear-gradient(135deg, #f08a4b 0%, #e24182 100%)", color: "#fff", border: "none", isGradient: true },
  secondary: { bg: "#f0eeff", color: "#7966fc",  border: "none",                    isGradient: false },
  ghost:     { bg: "transparent", color: "#8b859e", border: "1px solid #ece9f0",    isGradient: false },
  danger:    { bg: "#FEE2E2", color: "#EF4444",  border: "none",                    isGradient: false },
};

const SIZES = {
  sm: { padding: "6px 12px",  fontSize: 13 },
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
        display:          "inline-flex",
        alignItems:       "center",
        justifyContent:   "center",
        gap:              8,
        background:       v.bg,
        color:            v.color,
        border:           v.border,
        borderRadius:     8,
        fontWeight:       600,
        cursor:           disabled || loading ? "not-allowed" : "pointer",
        opacity:          disabled ? 0.5 : 1,
        width:            fullWidth ? "100%" : "auto",
        fontFamily:       "inherit",
        ...s,
        ...style,
      }}
    >
      {loading && <Spinner size="sm" color={v.color} />}
      {children}
    </button>
  );
}
