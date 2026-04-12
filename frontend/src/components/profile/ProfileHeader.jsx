import Avatar from "../ui/Avatar";
import StarRating from "../ui/StarRating";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { UserPen } from "lucide-react";

export default function ProfileHeader({ user, isOwnProfile = false, onEdit, onFollow, isFollowing = false, isMutualFollow = false, onGetNumber, copied = false }) {
  if (!user) return null;
  return (
    <div style={{ backgroundColor: "#fff", marginBottom: 8 }}>
      {/* Banner */}
      <div style={{ height: 80, background: "linear-gradient(135deg, #6C47FF 0%, #a78bfa 100%)" }} />

      {/* Avatar + name */}
      <div style={{ padding: "0 16px 16px", position: "relative" }}>
        <div style={{ marginTop: -32, marginBottom: 10 }}>
          <Avatar src={user.avatarUrl} name={user.name} size="lg" />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>{user.name}</div>
            <div style={{ fontSize: 13, color: "#6B7280" }}>@{user.username} · {user.pronouns}</div>
            <div style={{ fontSize: 13, color: "#6B7280" }}>{user.school}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            {isOwnProfile ? (
              <Button variant="ghost" size="sm" onClick={onEdit}><UserPen size={16} /></Button>
            ) : (
              <Button
                variant={isFollowing ? "ghost" : "primary"}
                size="sm"
                onClick={onFollow}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}
            {!isOwnProfile && isMutualFollow && (
              <button
                onClick={onGetNumber}
                style={{
                  display:         "flex",
                  alignItems:      "center",
                  gap:             5,
                  background:      copied ? "#16A34A" : "#07104e",
                  color:           "#f8f7f2",
                  border:          "none",
                  borderRadius:    20,
                  padding:         "5px 12px",
                  fontSize:        12,
                  fontWeight:      600,
                  cursor:          "pointer",
                  transition:      "background 0.2s",
                  whiteSpace:      "nowrap",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f8f7f2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6 6l.94-.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 16z" />
                </svg>
                {copied ? "Copied!" : "Get number"}
              </button>
            )}
          </div>
        </div>

        {/* Rating */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
          <StarRating value={user.rating} size={14} />
          <span style={{ fontSize: 13, color: "#6B7280" }}>{user.rating} ({user.ratingCount} rides)</span>
          <Badge variant={user.role} />
        </div>

        {/* Location */}
        {user.location && (
          <div style={{ fontSize: 13, color: "#9CA3AF", marginTop: 6 }}>📍 {user.location}</div>
        )}

        {/* Bio */}
        {user.bio && (
          <p style={{ fontSize: 14, color: "#374151", marginTop: 8, lineHeight: 1.5 }}>{user.bio}</p>
        )}

        {/* Followers */}
        <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
          <span style={{ fontSize: 13, color: "#6B7280" }}>
            <strong style={{ color: "#111827" }}>{user.followers?.length ?? 0}</strong> followers
          </span>
          <span style={{ fontSize: 13, color: "#6B7280" }}>
            <strong style={{ color: "#111827" }}>{user.following?.length ?? 0}</strong> following
          </span>
        </div>
      </div>
    </div>
  );
}
