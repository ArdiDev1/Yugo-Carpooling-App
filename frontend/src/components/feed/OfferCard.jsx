import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Avatar from "../ui/Avatar";
import RouteMap from "../map/RouteMap";
import ConfirmInterestedDialog from "../ui/ConfirmInterestedDialog";
import { messageService } from "../../services/message.service";
import { useAuthStore } from "../../store/auth.store";
import { buildRoute } from "../../constants/routes";

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


export default function OfferCard({ post, author, index = 0, onDelete }) {
  if (!post || !author) return null;

  const navigate   = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const [showDialog, setShowDialog] = useState(false);
  const [interested, setInterested]  = useState(false);
  const [joining,   setJoining]      = useState(false);

  const handleConfirmInterest = async () => {
    setJoining(true);
    try {
      const res = await messageService.createRoom(post.id, currentUser.id);
      setInterested(true);
      setShowDialog(false);
      setTimeout(() => navigate(buildRoute.chat(res.data.id)), 600);
    } catch {
      setInterested(true);
      setShowDialog(false);
    } finally {
      setJoining(false);
    }
  };

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
        <div
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
          onClick={(e) => { e.stopPropagation(); navigate(buildRoute.userProfile(author.id)); }}
        >
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
      </div>

      {/* Content */}
      {post.content && (
        <p style={{ fontSize: 14, color: "var(--color-text)", marginBottom: 12, lineHeight: 1.55, opacity: 0.9 }}>
          {post.content}
        </p>
      )}

      {/* Route Map */}
      <div style={{ marginBottom: 12 }}>
        <RouteMap fromLocation={post.fromLocation} toLocation={post.toLocation} fromLabel="Pickup" toLabel="Dropoff" />
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

      {/* Gas Cost Estimate */}
      {post.gasCost && !post.noPaymentNeeded && (
        <div style={{
          marginBottom: 12,
          backgroundColor: "#FFF7ED",
          borderRadius: 10,
          padding: "10px 12px",
          border: "1px solid #FED7AA",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#C2410C" }}>&#9981; Gas Split</span>
            <span style={{ fontSize: 11, color: "#9CA3AF" }}>
              {post.gasCost.distanceMiles} mi
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{
              flex: 1, textAlign: "center", backgroundColor: "#fff",
              borderRadius: 8, padding: "8px 6px",
              border: "1px solid #FED7AA",
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#EA580C" }}>
                ${post.gasCost.costPerPassenger.toFixed(2)}
              </div>
              <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, marginTop: 2 }}>per person</div>
            </div>
            <div style={{
              flex: 1, textAlign: "center", backgroundColor: "#fff",
              borderRadius: 8, padding: "8px 6px",
              border: "1px solid #FED7AA",
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#16A34A" }}>
                ${post.gasCost.driverCost.toFixed(2)}
              </div>
              <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, marginTop: 2 }}>driver pays</div>
            </div>
          </div>
          <div style={{ fontSize: 10, color: "#9CA3AF", textAlign: "center", marginTop: 6 }}>
            Total ${post.gasCost.totalGasCost.toFixed(2)} · {post.gasCost.numPassengers} passenger{post.gasCost.numPassengers > 1 ? "s" : ""} · 60/40 split
          </div>
        </div>
      )}

      {/* Tags + Interested button */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8, marginTop: 4 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, flex: 1 }}>
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

        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); if (!interested && !joining) setShowDialog(true); }}
          disabled={joining}
          style={{
            flexShrink: 0,
            padding: "6px 14px",
            borderRadius: 999,
            border: interested ? "1.5px solid #16A34A" : "1.5px solid var(--color-border)",
            backgroundColor: interested ? "#DCFCE7" : joining ? "#F3F4F6" : "transparent",
            color: interested ? "#15803D" : joining ? "#9CA3AF" : "var(--color-muted)",
            fontSize: 12,
            fontWeight: 700,
            cursor: (interested || joining) ? "default" : "pointer",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}
        >
          {interested ? "✓ Interested" : joining ? "..." : "Interested"}
        </button>
      </div>

      <ConfirmInterestedDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={handleConfirmInterest}
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
          Cancel Ride
        </button>
      )}

    </motion.div>
  );
}
