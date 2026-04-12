import { motion } from "framer-motion";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import PostActions from "./PostActions";
import { LUGGAGE_OPTIONS } from "../../constants/categories";

function Pill({ children, color = "var(--color-muted)", bg = "var(--color-border)" }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      backgroundColor: bg, color, fontSize: 11, fontWeight: 600,
      padding: "4px 10px", borderRadius: 999, letterSpacing: "0.01em",
    }}>
      {children}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${((h % 12) || 12)}:${String(m).padStart(2, "0")} ${suffix}`;
}

function RouteIndicator({ from, to }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
      {/* Dot-line-dot */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 3, paddingBottom: 3 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "var(--color-primary)", flexShrink: 0 }} />
        <div style={{ flex: 1, width: 2, background: "linear-gradient(to bottom, var(--color-primary), var(--color-secondary))", borderRadius: 1, margin: "3px 0" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "var(--color-secondary)", flexShrink: 0 }} />
      </div>
      {/* Labels */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 6, minHeight: 48 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--color-muted)", fontWeight: 500, marginBottom: 1 }}>From</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", lineHeight: 1.3 }}>{from}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--color-muted)", fontWeight: 500, marginBottom: 1 }}>To</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", lineHeight: 1.3 }}>{to}</div>
        </div>
      </div>
    </div>
  );
}

export default function RequestCard({ post, author, index = 0 }) {
  if (!post || !author) return null;
  const luggage = LUGGAGE_OPTIONS.find((o) => o.value === post.luggage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileTap={{ scale: 0.98 }}
      style={{
        backgroundColor: "var(--color-surface)",
        borderRadius: 14,
        padding: "16px 18px",
        marginBottom: 10,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
        cursor: "pointer",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={author.name} src={author.avatarUrl} size="sm" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.01em" }}>{author.username}</div>
            <div style={{ fontSize: 11, color: "var(--color-muted)", fontWeight: 500 }}>{author.school}</div>
          </div>
        </div>
        <Badge variant={post.status === "open" ? "open" : "closed"} />
      </div>

      {/* Content */}
      {post.content && (
        <p style={{ fontSize: 14, color: "var(--color-text)", marginBottom: 12, lineHeight: 1.55, opacity: 0.9 }}>
          {post.content}
        </p>
      )}

      {/* Route */}
      <div style={{ marginBottom: 12 }}>
        <RouteIndicator from={post.fromLocation} to={post.toLocation} />
      </div>

      {/* Time & Date row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          backgroundColor: "var(--color-background)", borderRadius: 8,
          padding: "6px 10px", fontSize: 12, fontWeight: 600,
          color: "var(--color-text)",
        }}>
          <span style={{ opacity: 0.6 }}>&#128338;</span>
          {post.flexible ? (post.flexibleWindow ?? "Flexible") : formatTime(post.time)}
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          backgroundColor: "var(--color-background)", borderRadius: 8,
          padding: "6px 10px", fontSize: 12, fontWeight: 600,
          color: "var(--color-text)",
        }}>
          <span style={{ opacity: 0.6 }}>&#128197;</span>
          {formatDate(post.date)}
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {post.prefersWomen && <Pill bg="#FFF0F6" color="#DB2777">Women preferred</Pill>}
        <Pill bg={post.flexible ? "#ECFDF5" : "#FEF9C3"} color={post.flexible ? "#065F46" : "#92400E"}>
          {post.flexible ? "Flexible time" : "Exact time"}
        </Pill>
        {luggage && <Pill>{luggage.emoji} {luggage.label}</Pill>}
      </div>

      <PostActions
        postId={post.id}
        likes={post.likes ?? 0}
        comments={post.comments ?? 0}
        isLikedByMe={post.isLikedByMe ?? false}
      />
    </motion.div>
  );
}
