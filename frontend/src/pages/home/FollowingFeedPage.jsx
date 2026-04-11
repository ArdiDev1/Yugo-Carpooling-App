import { useAuthStore } from "../../store/auth.store";
import { useFeed } from "../../hooks/useFeed";
import { getUserById } from "../../mocks/users";
import RequestCard from "../../components/feed/RequestCard";
import OfferCard from "../../components/feed/OfferCard";

export default function FollowingFeedPage() {
  const user = useAuthStore((s) => s.user);
  const { posts, isLoading } = useFeed("following");

  const followingIds = user?.following ?? [];
  const filtered     = posts.filter((p) => followingIds.includes(p.authorId));

  if (!filtered.length) {
    return (
      <div style={{ textAlign: "center", paddingTop: 60, color: "#9CA3AF", padding: "60px 24px 0" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
        <p style={{ fontSize: 15 }}>No posts from people you follow yet.</p>
        <p style={{ fontSize: 13, marginTop: 6 }}>Follow other riders on their profiles!</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "8px 12px" }}>
      {filtered.map((post) => {
        const author = getUserById(post.authorId);
        return post.type === "request"
          ? <RequestCard key={post.id} post={post} author={author} />
          : <OfferCard   key={post.id} post={post} author={author} />;
      })}
    </div>
  );
}
