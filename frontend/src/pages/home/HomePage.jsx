import { AnimatePresence, motion } from "framer-motion";
import { useFeedStore } from "../../store/feed.store";
import FeedTabs from "../../components/feed/FeedTabs";
import ForYouPage from "./ForYouPage";
import FollowingFeedPage from "./FollowingFeedPage";
import yugoLogo from "../../assets/Just_Yugo_transparent.png";

export default function HomePage() {
  const activeTab = useFeedStore((s) => s.activeTab);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "var(--color-background)" }}>
      {/* App name header */}
      <div style={{
        padding: "12px 18px",
        backgroundColor: "#07104e",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
      }}>
        <img src={yugoLogo} alt="Yugo" style={{ height: 28 }} />
      </div>

      <FeedTabs />

      {/* Scrollable feed with animated tab switch */}
      <div style={{ flex: 1, overflowY: "auto", backgroundColor: "var(--color-background)" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === "forYou" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === "forYou" ? 20 : -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {activeTab === "forYou" && <ForYouPage />}
            {activeTab === "following" && <FollowingFeedPage />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
