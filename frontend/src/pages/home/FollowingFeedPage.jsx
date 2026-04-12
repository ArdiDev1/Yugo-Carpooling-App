<<<<<<< Updated upstream
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/auth.store";
=======
>>>>>>> Stashed changes
import { useFeed } from "../../hooks/useFeed";
import RequestCard from "../../components/feed/RequestCard";
import OfferCard from "../../components/feed/OfferCard";
<<<<<<< Updated upstream
import { SkeletonFeed } from "../../components/ui/Skeleton";
=======
import Spinner from "../../components/ui/Spinner";
>>>>>>> Stashed changes

export default function FollowingFeedPage() {
  const { posts, isLoading } = useFeed("following");

<<<<<<< Updated upstream
  const followingIds = user?.following ?? [];
  const filtered = posts.filter((p) => followingIds.includes(p.authorId));

  if (isLoading) {
    return <SkeletonFeed count={3} />;
  }

  if (!filtered.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{ textAlign: "center", paddingTop: 80, color: "var(--color-muted)", padding: "80px 24px 0" }}
      >
        <div style={{ fontSize: 48, marginBottom: 16, filter: "grayscale(0.3)" }}>&#128101;</div>
        <p style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text)", marginBottom: 6 }}>No posts yet</p>
        <p style={{ fontSize: 13, color: "var(--color-muted)" }}>Follow other riders on their profiles!</p>
      </motion.div>
=======
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
>>>>>>> Stashed changes
    );
  }

  return (
<<<<<<< Updated upstream
    <div style={{ padding: "10px 14px" }}>
      {filtered.map((post, i) => {
        const author = getUserById(post.authorId);
        return post.type === "request"
          ? <RequestCard key={post.id} post={post} author={author} index={i} />
          : <OfferCard   key={post.id} post={post} author={author} index={i} />;
      })}
=======
    <div style={{ padding: "8px 12px" }}>
      {posts.map((post) =>
        post.type === "request"
          ? <RequestCard key={post.id} post={post} author={post.author} />
          : <OfferCard   key={post.id} post={post} author={post.author} />
      )}
>>>>>>> Stashed changes
    </div>
  );
}
