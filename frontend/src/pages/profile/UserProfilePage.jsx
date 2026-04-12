import { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { getUserById, MOCK_USERS } from "../../mocks/users";
import { getPostsByUser } from "../../mocks/posts";
import ProfileHeader from "../../components/profile/ProfileHeader";
import VehicleCard from "../../components/profile/VehicleCard";
import PaymentMethods from "../../components/profile/PaymentMethods";
import RequestCard from "../../components/feed/RequestCard";
import OfferCard from "../../components/feed/OfferCard";
import PageHeader from "../../components/layout/PageHeader";

export default function UserProfilePage() {
  const { userId }   = useParams();
  const currentUser  = useAuthStore((s) => s.user);
  const profile      = getUserById(userId);
  const [following, setFollowing] = useState(
    currentUser?.following?.includes(userId) ?? false
  );
  const [copied, setCopied] = useState(false);

  const isMutual = following && (profile?.following?.includes(currentUser?.id) ?? false);

  const handleGetNumber = useCallback(() => {
    if (!profile?.phone) return;
    navigator.clipboard.writeText(profile.phone).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [profile?.phone]);

  if (!profile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <PageHeader title="Profile" showBack />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>
          User not found
        </div>
      </div>
    );
  }

  const posts = getPostsByUser(userId);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#F7F7F8" }}>
      <PageHeader title={profile.username} showBack />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <ProfileHeader
          user={profile}
          isOwnProfile={false}
          isFollowing={following}
          onFollow={() => setFollowing((v) => !v)}
          isMutualFollow={isMutual}
          onGetNumber={handleGetNumber}
          copied={copied}
        />

        {profile.role === "driver" && (
          <VehicleCard vehicle={profile.vehicle} isOwnProfile={false} />
        )}

        <PaymentMethods methods={profile.paymentMethods ?? []} isOwnProfile={false} />

        {posts.length > 0 && (
          <div style={{ padding: "12px 12px 0" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 8px 4px" }}>Posts</h3>
            {posts.map((post) =>
              post.type === "request"
                ? <RequestCard key={post.id} post={post} author={profile} />
                : <OfferCard   key={post.id} post={post} author={profile} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
