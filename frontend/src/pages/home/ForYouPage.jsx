import { motion } from "framer-motion";
import { useFeed } from "../../hooks/useFeed";
import RequestCard from "../../components/feed/RequestCard";
import OfferCard from "../../components/feed/OfferCard";
import { SkeletonFeed } from "../../components/ui/Skeleton";
import taxiIcon from "../../assets/taxi_icon.png";

export default function ForYouPage() {
  const { posts, isLoading } = useFeed("forYou");

  if (isLoading) {
    return <SkeletonFeed count={4} />;
  }

  if (!posts.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{ textAlign: "center", paddingTop: 80, color: "var(--color-muted)" }}
      >
        <img src={taxiIcon} alt="no rides" style={{ width: 48, height: 48, display: "block", margin: "0 auto 16px", objectFit: "contain" }} />
        <p style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text)", marginBottom: 6 }}>No rides yet</p>
        <p style={{ fontSize: 13, color: "var(--color-muted)" }}>Be the first to post a ride!</p>
      </motion.div>
    );
  }

  return (
    <div style={{ padding: "10px 14px" }}>
      {posts.map((post, i) => {
        const author = post.author ?? { name: "Unknown", username: "user", school: "" };
        return post.type === "request"
          ? <RequestCard key={post.id} post={post} author={author} index={i} />
          : <OfferCard   key={post.id} post={post} author={author} index={i} />;
      })}
    </div>
  );
}
