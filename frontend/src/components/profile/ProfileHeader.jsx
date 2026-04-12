import Avatar from "../ui/Avatar";
import StarRating from "../ui/StarRating";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { UserPen } from "lucide-react";

export default function ProfileHeader({
  user,
  isOwnProfile = false,
  onEdit,
  onFollow,
  isFollowing = false,
  isMutualFollow = false,
  onGetNumber,
  copied = false,
}) {
  if (!user) return null;

  return (
    <div style={{ backgroundColor: "#fff", marginBottom: 8 }}>

      {/* Banner */}
      <div style={{ height: 110, background: "linear-gradient(135deg, #6C47FF 0%, #a78bfa 100%)" }} />

      {/* Body */}
      <div style={{ padding: "0 20px 22px", textAlign: "center" }}>

        {/* Avatar — centered, ringed, overlapping banner */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: -44, marginBottom: 14 }}>
          <div style={{
            borderRadius: "50%",
            padding:       4,
            backgroundColor: "#fff",
            boxShadow:     "0 4px 20px rgba(0,0,0,0.12)",
            lineHeight:    0,
          }}>
            <Avatar src={user.avatarUrl} name={user.name} size="lg" />
          </div>
        </div>

        {/* Name */}
        <div style={{ fontSize: 20, fontWeight: 800, color: "#111827", letterSpacing: "-0.3px", marginBottom: 3 }}>
          {user.name}
        </div>

        {/* Username · pronouns */}
        <div style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 500, marginBottom: 2 }}>
          @{user.username}{user.pronouns ? ` · ${user.pronouns}` : ""}
        </div>

        {/* School */}
        {user.school && (
          <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 10 }}>
            {user.school}
          </div>
        )}

        {/* Rating */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 10 }}>
          <StarRating value={user.rating} size={13} />
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>
            {user.rating} ({user.ratingCount} rides)
          </span>
          <Badge variant={user.role} />
        </div>

        {/* Bio */}
        {user.bio && (
          <p style={{
            fontSize: 13, color: "#374151", lineHeight: 1.6,
            marginBottom: 12, maxWidth: 280, margin: "0 auto 12px",
          }}>
            {user.bio}
          </p>
        )}

        {/* Location */}
        {user.location && (
          <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 12 }}>
            📍 {user.location}
          </div>
        )}

        {/* Followers / Following */}
        <div style={{ display: "flex", justifyContent: "center", gap: 28, marginBottom: 18 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>
              {user.followers?.length ?? 0}
            </div>
            <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500, marginTop: 1 }}>followers</div>
          </div>
          <div style={{ width: 1, backgroundColor: "#F3F4F6" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>
              {user.following?.length ?? 0}
            </div>
            <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500, marginTop: 1 }}>following</div>
          </div>
        </div>

        {/* Action buttons */}
        {isOwnProfile ? (
          <Button variant="ghost" size="sm" onClick={onEdit} style={{ margin: "0 auto" }}>
            <UserPen size={15} />
            <span style={{ marginLeft: 6 }}>Edit profile</span>
          </Button>
        ) : (
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Button
              variant={isFollowing ? "ghost" : "primary"}
              size="sm"
              onClick={onFollow}
              style={{ minWidth: 100 }}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>

            {isMutualFollow && (
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
                  padding:         "6px 14px",
                  fontSize:        12,
                  fontWeight:      600,
                  cursor:          "pointer",
                  transition:      "background 0.2s",
                  whiteSpace:      "nowrap",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f8f7f2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6 6l.94-.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 16z" />
                </svg>
                {copied ? "Copied!" : "Get number"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
