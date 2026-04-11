import { useFeedStore } from "../../store/feed.store";
import FeedTabs from "../../components/feed/FeedTabs";
import ForYouPage from "./ForYouPage";
import FollowingFeedPage from "./FollowingFeedPage";

export default function HomePage() {
  const activeTab = useFeedStore((s) => s.activeTab);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* App name header */}
      <div style={{
        padding:         "14px 16px 10px",
        backgroundColor: "#fff",
        borderBottom:    "none",
        flexShrink:      0,
      }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: "#6C47FF", letterSpacing: "-0.5px" }}>
          🚗 Yugo
        </span>
      </div>

      <FeedTabs />

      {/* Scrollable feed */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {activeTab === "forYou"    && <ForYouPage />}
        {activeTab === "following" && <FollowingFeedPage />}
      </div>
    </div>
  );
}
