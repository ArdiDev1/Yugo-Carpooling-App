import { useFeedStore } from "../../store/feed.store";

export default function FeedTabs() {
  const { activeTab, setActiveTab } = useFeedStore();

  const Tab = ({ id, label }) => {
    const active = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        style={{
          flex:            1,
          background:      "none",
          border:          "none",
          cursor:          "pointer",
          padding:         "12px 0",
          fontSize:        14,
          fontWeight:      active ? 700 : 500,
          color:           active ? "#6C47FF" : "#9CA3AF",
          borderBottom:    `2px solid ${active ? "#6C47FF" : "transparent"}`,
          transition:      "all 0.2s",
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div
      style={{
        display:         "flex",
        backgroundColor: "#fff",
        borderBottom:    "1px solid #E5E7EB",
        flexShrink:      0,
      }}
    >
      <Tab id="forYou"    label="For You" />
      <Tab id="following" label="Following" />
    </div>
  );
}
