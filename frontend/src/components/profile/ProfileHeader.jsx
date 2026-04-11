import Avatar from "../ui/Avatar";
import StarRating from "../ui/StarRating";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

export default function ProfileHeader({ user, isOwnProfile = false, onEdit, onFollow, isFollowing = false }) {
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
          {isOwnProfile ? (
            <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>
          ) : (
            <Button
              variant={isFollowing ? "ghost" : "primary"}
              size="sm"
              onClick={onFollow}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          )}
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
