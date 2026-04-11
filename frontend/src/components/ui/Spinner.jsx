export default function Spinner({ size = "md", color = "#6C47FF" }) {
  const dim = size === "sm" ? 16 : 24;
  return (
    <div
      style={{
        width:  dim,
        height: dim,
        border: `2px solid #E5E7EB`,
        borderTopColor: color,
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        display: "inline-block",
      }}
    />
  );
}
