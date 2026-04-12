import { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../store/auth.store";
import { userService } from "../../services/user.service";
import { postService } from "../../services/post.service";
import { useToastStore } from "../../store/toast.store";
import ProfileHeader from "../../components/profile/ProfileHeader";
import VehicleCard from "../../components/profile/VehicleCard";
import PaymentMethods from "../../components/profile/PaymentMethods";
import RequestCard from "../../components/feed/RequestCard";
import OfferCard from "../../components/feed/OfferCard";
import PageHeader from "../../components/layout/PageHeader";
import Spinner from "../../components/ui/Spinner";

export default function UserProfilePage() {
  const { userId }    = useParams();
  const currentUser   = useAuthStore((s) => s.user);
  const updateUser    = useAuthStore((s) => s.updateUser);

  const queryClient = useQueryClient();
  const showToast   = useToastStore((s) => s.show);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn:  () => userService.getProfile(userId).then((r) => r.data),
    enabled:  !!userId,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["userPosts", userId],
    queryFn:  () => postService.getByUser(userId).then((r) => r.data),
    enabled:  !!userId,
  });

  const [following, setFollowing] = useState(
    currentUser?.following?.includes(userId) ?? false
  );
  const [copied, setCopied] = useState(false);

  const isMutual = following && (profile?.following?.includes(currentUser?.id) ?? false);

  const handleFollow = useCallback(async () => {
    const newFollowing = !following;
    setFollowing(newFollowing);
    try {
      if (newFollowing) {
        await userService.follow(userId);
        updateUser({ following: [...(currentUser?.following ?? []), userId] });
        showToast(`Following @${profile?.username ?? userId}`);
      } else {
        await userService.unfollow(userId);
        updateUser({ following: (currentUser?.following ?? []).filter((id) => id !== userId) });
        showToast(`Unfollowed @${profile?.username ?? userId}`);
      }
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    } catch {
      setFollowing(!newFollowing);
    }
  }, [following, userId, currentUser, updateUser]);

  const handleGetNumber = useCallback(() => {
    if (!profile?.phone) return;
    navigator.clipboard.writeText(profile.phone).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [profile?.phone]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <PageHeader title="Profile" showBack />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Spinner />
        </div>
      </div>
    );
  }

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

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#F7F7F8" }}>
      <PageHeader title={profile.username} showBack />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <ProfileHeader
          user={profile}
          isOwnProfile={false}
          isFollowing={following}
          onFollow={handleFollow}
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
