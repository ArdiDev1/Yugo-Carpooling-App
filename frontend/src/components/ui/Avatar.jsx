const SIZES = { sm: 32, md: 40, lg: 64 };

const BG_COLORS = [
  "#6C47FF", "#FF6B6B", "#22C55E", "#F59E0B",
  "#3B82F6", "#EC4899", "#14B8A6", "#8B5CF6",
];

function getInitials(name = "") {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getBgColor(name = "") {
  let sum = 0;
  for (const ch of name) sum += ch.charCodeAt(0);
  return BG_COLORS[sum % BG_COLORS.length];
}

export default function Avatar({ src, name = "", size = "md", showBadge = false }) {
  const dim = SIZES[size] ?? SIZES.md;
  return (
    <div style={{ position: "relative", display: "inline-block", flexShrink: 0 }}>
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: dim, height: dim, borderRadius: "50%", objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            width:           dim,
            height:          dim,
            borderRadius:    "50%",
            backgroundColor: getBgColor(name),
            color:           "#fff",
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            fontSize:        dim * 0.38,
            fontWeight:      700,
          }}
        >
          {getInitials(name)}
        </div>
      )}
      {showBadge && (
        <div
          style={{
            position:        "absolute",
            bottom:          0,
            right:           0,
            width:           12,
            height:          12,
            borderRadius:    "50%",
            backgroundColor: "#6C47FF",
            border:          "2px solid #fff",
          }}
        />
      )}
    </div>
  );
}
