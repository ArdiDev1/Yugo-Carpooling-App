import { useFeed } from "../../hooks/useFeed";
import RequestCard from "../../components/feed/RequestCard";
import OfferCard from "../../components/feed/OfferCard";
import { SkeletonFeed } from "../../components/ui/Skeleton";
import pplIcon from "../../assets/ppl_icon.png";

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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{ textAlign: "center", paddingTop: 80, color: "var(--color-muted)", padding: "80px 24px 0" }}
      >
        <img src={pplIcon} alt="no posts" style={{ width: 48, height: 48, display: "block", margin: "0 auto 16px", objectFit: "contain" }} />
        <p style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text)", marginBottom: 6 }}>No posts yet</p>
        <p style={{ fontSize: 13, color: "var(--color-muted)" }}>Follow other riders on their profiles!</p>
      </motion.div>
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