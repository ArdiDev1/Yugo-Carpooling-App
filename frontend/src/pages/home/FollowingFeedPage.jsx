import { motion } from "framer-motion";
import { useAuthStore } from "../../store/auth.store";
import { useFeed } from "../../hooks/useFeed";
import { getUserById } from "../../mocks/users";
import RequestCard from "../../components/feed/RequestCard";
import OfferCard from "../../components/feed/OfferCard";
import { SkeletonFeed } from "../../components/ui/Skeleton";
import pplIcon from "../../assets/ppl_icon.png";

export default function FollowingFeedPage() {
  const user = useAuthStore((s) => s.user);
  const { posts, isLoading } = useFeed("following");

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
        <img src={pplIcon} alt="no posts" style={{ width: 48, height: 48, display: "block", margin: "0 auto 16px", objectFit: "contain" }} />
        <p style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text)", marginBottom: 6 }}>No posts yet</p>
        <p style={{ fontSize: 13, color: "var(--color-muted)" }}>Follow other riders on their profiles!</p>
      </motion.div>
    );
  }

  return (
    <div style={{ padding: "10px 14px" }}>
      {filtered.map((post, i) => {
        const author = getUserById(post.authorId);
        return post.type === "request"
          ? <RequestCard key={post.id} post={post} author={author} index={i} />
          : <OfferCard   key={post.id} post={post} author={author} index={i} />;
      })}
    </div>
  );
}
