import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";

export const FILTERS = [
  { key: "prefersWomen",    label: "Women preferred" },
  { key: "noPaymentNeeded", label: "No payment"      },
  { key: "flexible",        label: "Flexible time"   },
];

export function applyFilters(posts, activeFilters) {
  if (!activeFilters || activeFilters.size === 0) return posts;
  return posts.filter((post) => {
    if (activeFilters.has("prefersWomen")    && !post.prefersWomen)    return false;
    if (activeFilters.has("noPaymentNeeded") && !post.noPaymentNeeded) return false;
    if (activeFilters.has("flexible")        && !post.flexible)        return false;
    return true;
  });
}

export default function FeedFilterBar({
  showing, total,
  activeFilters, filtersOpen, setFiltersOpen, toggleFilter, filterCount, clearFilters,
}) {
  const noMatches = filterCount > 0 && showing === 0;

  return (
    <div style={{
      display:        "flex",
      alignItems:     "center",
      justifyContent: "space-between",
      marginBottom:   10,
      position:       "relative",
    }}>
      {/* Count text */}
      <span style={{
        fontSize:   12,
        fontWeight: 500,
        color:      noMatches ? "#EF4444" : "var(--color-muted)",
      }}>
        {noMatches
          ? "No matches found"
          : filterCount > 0
            ? `Showing ${showing} of ${total}`
            : `${total} post${total !== 1 ? "s" : ""}`}
      </span>

      {/* Filter button */}
      <button
        onClick={() => setFiltersOpen((v) => !v)}
        style={{
          display:         "flex",
          alignItems:      "center",
          gap:             5,
          backgroundColor: filtersOpen || filterCount > 0 ? "#EEF2FF" : "transparent",
          border:          `1.5px solid ${filtersOpen || filterCount > 0 ? "#C7D2FE" : "var(--color-border)"}`,
          borderRadius:    20,
          padding:         "4px 10px",
          cursor:          "pointer",
          transition:      "all 0.15s",
          position:        "relative",
        }}
      >
        <SlidersHorizontal size={12} color={filtersOpen || filterCount > 0 ? "#4F46E5" : "var(--color-muted)"} />
        <span style={{
          fontSize:   11,
          fontWeight: 600,
          color:      filtersOpen || filterCount > 0 ? "#4F46E5" : "var(--color-muted)",
        }}>
          Filter
        </span>

        {/* Active count badge */}
        {filterCount > 0 && (
          <span style={{
            position:        "absolute",
            top:             -5,
            right:           -5,
            width:           15,
            height:          15,
            borderRadius:    "50%",
            backgroundColor: "rgba(240,138,75,0.82)",
            color:           "#fff",
            fontSize:        8,
            fontWeight:      800,
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
          }}>
            {filterCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
              position:        "absolute",
              top:             "calc(100% + 6px)",
              right:           0,
              backgroundColor: "#fff",
              borderRadius:    14,
              padding:         "10px 4px",
              boxShadow:       "0 8px 28px rgba(0,0,0,0.15)",
              minWidth:        190,
              zIndex:          50,
            }}
          >
            <div style={{
              fontSize: 10, fontWeight: 700, color: "#9CA3AF",
              letterSpacing: "0.06em", textTransform: "uppercase",
              padding: "2px 14px 6px",
            }}>
              Show only
            </div>

            {FILTERS.map(({ key, label }) => {
              const checked = activeFilters.has(key);
              return (
                <label
                  key={key}
                  style={{
                    display:         "flex",
                    alignItems:      "center",
                    gap:             10,
                    padding:         "8px 14px",
                    cursor:          "pointer",
                    borderRadius:    8,
                    margin:          "0 4px",
                    backgroundColor: checked ? "#F5F3FF" : "transparent",
                    transition:      "background 0.12s",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleFilter(key)}
                    style={{ display: "none" }}
                  />
                  <div style={{
                    width:           17,
                    height:          17,
                    borderRadius:    5,
                    border:          checked ? "none" : "1.5px solid #D1D5DB",
                    backgroundColor: checked ? "#7966fc" : "#fff",
                    flexShrink:      0,
                    display:         "flex",
                    alignItems:      "center",
                    justifyContent:  "center",
                    transition:      "all 0.12s",
                  }}>
                    {checked && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={{
                    fontSize:   13,
                    fontWeight: checked ? 600 : 400,
                    color:      checked ? "#4B3FBF" : "#374151",
                  }}>
                    {label}
                  </span>
                </label>
              );
            })}

            {filterCount > 0 && (
              <button
                onClick={clearFilters}
                style={{
                  display:         "block",
                  width:           "calc(100% - 8px)",
                  margin:          "6px 4px 2px",
                  padding:         "7px 0",
                  borderRadius:    8,
                  border:          "none",
                  backgroundColor: "#F3F4F6",
                  color:           "#6B7280",
                  fontSize:        12,
                  fontWeight:      600,
                  cursor:          "pointer",
                }}
              >
                Clear filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
