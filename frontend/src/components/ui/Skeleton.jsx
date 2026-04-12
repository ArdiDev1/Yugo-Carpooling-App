export default function Skeleton({ width = "100%", height = 16, radius = 8, style }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: "linear-gradient(90deg, var(--color-border) 25%, var(--color-background) 50%, var(--color-border) 75%)",
        backgroundSize: "800px 100%",
        animation: "shimmer 1.5s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div
      style={{
        backgroundColor: "var(--color-surface)",
        borderRadius: 14,
        padding: "16px 18px",
        marginBottom: 10,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <Skeleton width={36} height={36} radius="50%" />
        <div style={{ flex: 1 }}>
          <Skeleton width={100} height={13} style={{ marginBottom: 6 }} />
          <Skeleton width={70} height={10} />
        </div>
        <Skeleton width={52} height={22} radius={999} />
      </div>

      {/* Content line */}
      <Skeleton width="90%" height={14} style={{ marginBottom: 14 }} />

      {/* Route indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <Skeleton width={10} height={56} radius={5} />
        <div style={{ flex: 1 }}>
          <Skeleton width="70%" height={13} style={{ marginBottom: 10 }} />
          <Skeleton width="60%" height={13} />
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: "flex", gap: 6 }}>
        <Skeleton width={80} height={24} radius={999} />
        <Skeleton width={90} height={24} radius={999} />
        <Skeleton width={70} height={24} radius={999} />
      </div>
    </div>
  );
}

export function SkeletonFeed({ count = 3 }) {
  return (
    <div style={{ padding: "10px 14px" }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
