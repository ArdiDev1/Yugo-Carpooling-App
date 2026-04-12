import { useState } from "react";
import { motion } from "framer-motion";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import RouteMap from "../map/RouteMap";
import { LUGGAGE_OPTIONS } from "../../constants/categories";
import ConfirmInterestedDialog from "../ui/ConfirmInterestedDialog";

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


export default function RequestCard({ post, author, index = 0, onDelete }) {
  if (!post || !author) return null;
  const luggage = LUGGAGE_OPTIONS.find((o) => o.value === post.luggage);

  const [showDialog, setShowDialog] = useState(false);
  const [interested, setInterested]  = useState(false);

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

      {/* Route Map */}
      <div style={{ marginBottom: 12 }}>
        <RouteMap fromLocation={post.fromLocation} toLocation={post.toLocation} />
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

      {/* Tags + Interested button */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8, marginTop: 4 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, flex: 1 }}>
          {post.prefersWomen && <Pill bg="#FFF0F6" color="#DB2777">Women preferred</Pill>}
          <Pill bg={post.flexible ? "#ECFDF5" : "#FEF9C3"} color={post.flexible ? "#065F46" : "#92400E"}>
            {post.flexible ? "Flexible time" : "Exact time"}
          </Pill>
          {luggage && <Pill>{luggage.emoji} {luggage.label}</Pill>}
        </div>

        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); if (!interested) setShowDialog(true); }}
          style={{
            flexShrink: 0,
            padding: "6px 14px",
            borderRadius: 999,
            border: interested ? "1.5px solid #16A34A" : "1.5px solid var(--color-border)",
            backgroundColor: interested ? "#DCFCE7" : "transparent",
            color: interested ? "#15803D" : "var(--color-muted)",
            fontSize: 12,
            fontWeight: 700,
            cursor: interested ? "default" : "pointer",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}
        >
          {interested ? "✓ Interested" : "Interested"}
        </button>
      </div>

      <ConfirmInterestedDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={() => { setInterested(true); setShowDialog(false); }}
        date={formatDate(post.date)}
        time={post.flexible ? (post.flexibleWindow ?? "Flexible") : formatTime(post.time)}
      />

      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}
          style={{
            width: "100%", marginTop: 10, padding: "10px 0",
            borderRadius: 10, border: "1.5px solid #FCA5A5",
            backgroundColor: "#FEF2F2", color: "#DC2626",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}
        >
          Cancel Request
        </button>
      )}
    </motion.div>
  );
}
