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
        padding:         "10px 16px",
        backgroundColor: "#07104e",
        flexShrink:      0,
        display:         "flex",
        alignItems:      "center",
      }}>
        <img src={yugoLogo} alt="Yugo" style={{ height:30, margin: 10
         }} />
      </div>

      <FeedTabs />

      {/* Scrollable feed */}
      <div style={{ flex: 1, overflowY: "auto", backgroundColor: "var(--color-background)" }}>
        {activeTab === "forYou"    && <ForYouPage />}
        {activeTab === "following" && <FollowingFeedPage />}
      </div>
    </div>
  );
}
