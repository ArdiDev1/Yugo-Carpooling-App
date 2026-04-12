import { motion } from "framer-motion";
import { useFeedStore } from "../../store/feed.store";

const TABS = [
  { id: "forYou", label: "For You" },
  { id: "following", label: "Feed" },
];

export default function FeedTabs() {
  const { activeTab, setActiveTab } = useFeedStore();

  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "#07104e",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        flexShrink: 0,
      }}
    >
      {TABS.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "13px 0 11px",
              fontSize: 14,
              fontWeight: active ? 700 : 500,
              color: "#f8f7f2",
              opacity: active ? 1 : 0.55,
              position: "relative",
              transition: "opacity 0.2s ease",
              letterSpacing: "-0.01em",
            }}
          >
            {tab.label}
            {active && (
              <motion.div
                layoutId="feedTabIndicator"
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "20%",
                  right: "20%",
                  height: 2.5,
                  borderRadius: 2,
                  backgroundColor: "#f8f7f2",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
