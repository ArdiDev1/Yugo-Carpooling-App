import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import PostActions from "./PostActions";
import { LUGGAGE_OPTIONS } from "../../constants/categories";

function Pill({ children, color = "#6B7280", bg = "#F3F4F6" }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, backgroundColor: bg, color, fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 999 }}>
      {children}
    </span>
  );
}

function LocationRow({ icon, text }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 13, color: "#374151" }}>
      <span style={{ color: "#9CA3AF", flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <span style={{ lineHeight: 1.4 }}>{text}</span>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function formatTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${((h % 12) || 12)}:${String(m).padStart(2, "0")} ${suffix}`;
}

export default function RequestCard({ post, author }) {
  if (!post || !author) return null;
  const luggage = LUGGAGE_OPTIONS.find((o) => o.value === post.luggage);

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius:    12,
        padding:         "14px 16px",
        marginBottom:    8,
        boxShadow:       "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar name={author.name} src={author.avatarUrl} size="sm" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{author.username}</div>
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>{author.school}</div>
          </div>
        </div>
        <Badge variant={post.status === "open" ? "open" : "closed"} />
      </div>

      {/* Content */}
      {post.content && (
        <p style={{ fontSize: 14, color: "#374151", marginBottom: 10, lineHeight: 1.5 }}>
          {post.content}
        </p>
      )}

      {/* Location + Time */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 }}>
        <LocationRow icon="📍" text={`From: ${post.fromLocation}`} />
        <LocationRow icon="🏁" text={`To: ${post.toLocation}`} />
        <LocationRow icon="🕐" text={post.flexible ? `Flexible: ${post.flexibleWindow ?? "Anytime"}` : formatTime(post.time)} />
        <LocationRow icon="📅" text={formatDate(post.date)} />
      </div>

      {/* Tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
        {post.prefersWomen && <Pill bg="#FFF0F6" color="#DB2777">👩 Women preferred</Pill>}
        <Pill bg={post.flexible ? "#ECFDF5" : "#FEF9C3"} color={post.flexible ? "#065F46" : "#92400E"}>
          {post.flexible ? "Flexible time" : "Exact time"}
        </Pill>
        {luggage && <Pill>{luggage.emoji} {luggage.label}</Pill>}
      </div>

      <PostActions postId={post.id} likes={post.likes} comments={post.comments} />
    </div>
  );
}
