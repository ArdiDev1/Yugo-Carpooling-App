import { useFeed } from "../../hooks/useFeed";
import RequestCard from "../../components/feed/RequestCard";
import OfferCard from "../../components/feed/OfferCard";
import Spinner from "../../components/ui/Spinner";

export default function FollowingFeedPage() {
  const { posts, isLoading } = useFeed("following");

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 40 }}>
        <Spinner />
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px 0", color: "#9CA3AF" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
        <p style={{ fontSize: 15 }}>No posts from people you follow yet.</p>
        <p style={{ fontSize: 13, marginTop: 6 }}>Follow other riders on their profiles!</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "8px 12px" }}>
      {posts.map((post) =>
        post.type === "request"
          ? <RequestCard key={post.id} post={post} author={post.author} />
          : <OfferCard   key={post.id} post={post} author={post.author} />
      )}
    </div>
  );
}