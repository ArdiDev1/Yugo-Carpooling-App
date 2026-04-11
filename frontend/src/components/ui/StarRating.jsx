import { useState } from "react";

function Star({ filled, half, size = 16 }) {
  if (half) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="halfGrad">
            <stop offset="50%" stopColor="#FBBF24" />
            <stop offset="50%" stopColor="#E5E7EB" />
          </linearGradient>
        </defs>
        <polygon
          points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
          fill="url(#halfGrad)"
          stroke="#FBBF24"
          strokeWidth="1"
        />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#FBBF24" : "#E5E7EB"}>
      <polygon
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        stroke={filled ? "#FBBF24" : "#D1D5DB"}
        strokeWidth="1"
      />
    </svg>
  );
}

export default function StarRating({
  value       = 0,
  max         = 5,
  interactive = false,
  onChange,
  size        = 16,
}) {
  const [hover, setHover] = useState(null);
  const display = hover ?? value;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {Array.from({ length: max }).map((_, i) => {
        const pos = i + 1;
        const filled = pos <= Math.floor(display);
        const half   = !filled && pos - 0.5 <= display;
        return (
          <span
            key={i}
            onClick={() => interactive && onChange?.(pos)}
            onMouseEnter={() => interactive && setHover(pos)}
            onMouseLeave={() => interactive && setHover(null)}
            style={{ cursor: interactive ? "pointer" : "default" }}
          >
            <Star filled={filled} half={half} size={size} />
          </span>
        );
      })}
    </div>
  );
}
