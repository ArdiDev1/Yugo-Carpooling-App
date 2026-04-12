import { useFeedStore } from "../../store/feed.store";

export default function FeedTabs() {
  const { activeTab, setActiveTab } = useFeedStore();

  const Tab = ({ id, label }) => {
    const active = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        style={{
          flex:         1,
          background:   "none",
          border:       "none",
          cursor:       "pointer",
          padding:      "12px 0",
          fontSize:     14,
          fontWeight:   active ? 700 : 500,
          color:        "#f8f7f2",
          opacity:      active ? 1 : 0.7,
          borderBottom: `2px solid ${active ? "#f8f7f2" : "transparent"}`,
          transition:   "opacity 0.15s",
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
        backgroundColor: "#07104e",
        borderBottom:    "1px solid rgba(255,255,255,0.08)",
        flexShrink:      0,
      }}
    >
      <Tab id="forYou"    label="For You" />
      <Tab id="following" label="Following" />
    </div>
  );
}
