import { motion } from "framer-motion";
import { useFeed } from "../../hooks/useFeed";
import RequestCard from "../../components/feed/RequestCard";
import OfferCard from "../../components/feed/OfferCard";
import FeedFilterBar, { applyFilters } from "../../components/feed/FeedFilterBar";
import { SkeletonFeed } from "../../components/ui/Skeleton";
import pplIcon from "../../assets/ppl_icon.png";

export default function FollowingFeedPage({ activeFilters, filtersOpen, setFiltersOpen, toggleFilter, filterCount, clearFilters }) {
  const { posts: rawPosts, isLoading } = useFeed("following");
  const posts = applyFilters(rawPosts, activeFilters);

  if (isLoading) return <SkeletonFeed count={4} />;

  return (
    <div style={{ padding: "10px 14px" }}>
      <FeedFilterBar
        showing={posts.length}
        total={rawPosts.length}
        activeFilters={activeFilters}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        toggleFilter={toggleFilter}
        filterCount={filterCount}
        clearFilters={clearFilters}
      />

      {posts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{ textAlign: "center", paddingTop: 60, color: "var(--color-muted)", padding: "60px 24px 0" }}
        >
          <img src={pplIcon} alt="no posts" style={{ width: 48, height: 48, display: "block", margin: "0 auto 16px", objectFit: "contain" }} />
          <p style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text)", marginBottom: 6 }}>
            {filterCount > 0 ? "No matches found" : "No posts yet"}
          </p>
          <p style={{ fontSize: 13, color: "var(--color-muted)" }}>
            {filterCount > 0 ? "Try adjusting your filters." : "Follow other riders on their profiles!"}
          </p>
        </motion.div>
      ) : (
        posts.map((post, i) => {
          const author = post.author ?? { name: "Unknown", username: "user", school: "" };
          return post.type === "request"
            ? <RequestCard key={post.id} post={post} author={author} index={i} />
            : <OfferCard   key={post.id} post={post} author={author} index={i} />;
        })
      )}
    </div>
  );
}
