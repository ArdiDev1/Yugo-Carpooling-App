import { motion } from "framer-motion";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import PostActions from "./PostActions";

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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 3, paddingBottom: 3 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "var(--color-primary)", flexShrink: 0 }} />
        <div style={{ flex: 1, width: 2, background: "linear-gradient(to bottom, var(--color-primary), var(--color-secondary))", borderRadius: 1, margin: "3px 0" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "var(--color-secondary)", flexShrink: 0 }} />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 6, minHeight: 48 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--color-muted)", fontWeight: 500, marginBottom: 1 }}>Pickup</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", lineHeight: 1.3 }}>{from}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--color-muted)", fontWeight: 500, marginBottom: 1 }}>Dropoff</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", lineHeight: 1.3 }}>{to}</div>
        </div>
      </div>
    </div>
  );
}

export default function OfferCard({ post, author, index = 0 }) {
  if (!post || !author) return null;

  const seatsLeft = (post.seatsTotal ?? 0) - (post.seatsTaken ?? 0);
  const pct = ((post.seatsTaken ?? 0) / (post.seatsTotal || 1)) * 100;

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
        borderLeft: "3px solid var(--color-primary)",
        cursor: "pointer",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={author.name} src={author.avatarUrl} size="sm" showBadge />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.01em" }}>
              {author.username}
            </div>
            <div style={{ fontSize: 11, color: "var(--color-muted)", fontWeight: 500 }}>
              {author.school}
            </div>
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

      {/* Time & Date */}
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

      {/* Seats */}
      {post.seatsTotal != null && (
        <div style={{ marginBottom: 12, backgroundColor: "var(--color-background)", borderRadius: 10, padding: "10px 12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "var(--color-muted)", fontWeight: 500 }}>
              Seats available
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: seatsLeft > 0 ? "#16A34A" : "#EF4444" }}>
              {seatsLeft} / {post.seatsTotal}
            </span>
          </div>

          <div style={{ height: 5, backgroundColor: "var(--color-border)", borderRadius: 999, overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              style={{
                height: "100%",
                background: pct === 100 ? "#EF4444" : "linear-gradient(90deg, #7966fc, #fa6bae)",
                borderRadius: 999,
              }}
            />
          </div>
        </div>
      )}

      {/* Tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {post.prefersWomen && <Pill bg="#FFF0F6" color="#DB2777">Women preferred</Pill>}
        <Pill bg={post.flexible ? "#ECFDF5" : "#FEF9C3"} color={post.flexible ? "#065F46" : "#92400E"}>
          {post.flexible ? "Flexible time" : "Exact time"}
        </Pill>
        {post.noPaymentNeeded
          ? <Pill bg="#ECFDF5" color="#065F46">No payment</Pill>
          : <Pill bg="#FFF7ED" color="#C2410C">Gas split</Pill>
        }
        {post.storageCapacity && post.storageCapacity !== "none" && (
          <Pill>{post.storageCapacity === "full" ? "Full trunk" : "Half trunk"}</Pill>
        )}
      </div>

      {/* ✅ FIXED: wrapped PostActions in div */}
      <div style={{ marginTop: 12 }}>
        <PostActions
          postId={post.id}
          likes={post.likes ?? 0}
          comments={post.comments ?? 0}
          isLikedByMe={post.isLikedByMe ?? false}
        />
      </div>

    </motion.div>
  );
}