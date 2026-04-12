import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../store/auth.store";
import { useAuth } from "../../hooks/useAuth";
import { postService } from "../../services/post.service";
import ProfileHeader from "../../components/profile/ProfileHeader";
import VehicleCard from "../../components/profile/VehicleCard";
import PaymentMethods from "../../components/profile/PaymentMethods";
import RequestCard from "../../components/feed/RequestCard";
import OfferCard from "../../components/feed/OfferCard";
import PageHeader from "../../components/layout/PageHeader";
import { ROUTES } from "../../constants/routes";

export default function MyProfilePage() {
  const navigate             = useNavigate();
  const user                 = useAuthStore((s) => s.user);
  const { isDriver, logout } = useAuth();

  const { data: myPosts = [] } = useQuery({
    queryKey: ["userPosts", user?.id],
    queryFn:  () => postService.getByUser(user.id).then((r) => r.data),
    enabled:  !!user?.id,
  });

  if (!user) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#F7F7F8" }}>
      <PageHeader
        title="My Profile"
        showBack={false}
        rightAction={
          <button onClick={() => navigate(ROUTES.SETTINGS)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20 }}>
            ⚙️
          </button>
        }
      />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <ProfileHeader
          user={user}
          isOwnProfile
          onEdit={() => navigate(ROUTES.EDIT_PROFILE)}
        />

        {isDriver && (
          <VehicleCard vehicle={user.vehicle} isOwnProfile onEdit={() => navigate(ROUTES.EDIT_PROFILE)} />
        )}

        <PaymentMethods methods={user.paymentMethods ?? []} isOwnProfile />

        {myPosts.length > 0 && (
          <div style={{ padding: "12px 12px 0" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 8px 4px" }}>My Posts</h3>
            {myPosts.map((post) =>
              post.type === "request"
                ? <RequestCard key={post.id} post={post} author={user} />
                : <OfferCard   key={post.id} post={post} author={user} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
