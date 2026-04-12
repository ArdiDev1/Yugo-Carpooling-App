import { useNavigate } from "react-router-dom";

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f8f7f2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export default function PageHeader({ title, showBack = true, onBack, rightAction }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <div
      style={{
        display:         "flex",
        alignItems:      "center",
        padding:         "0 16px",
        height:          52,
        backgroundColor: "#07104e",
        borderBottom:    "1px solid rgba(255,255,255,0.08)",
        flexShrink:      0,
      }}
    >
      {showBack ? (
        <button
          onClick={handleBack}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 6px 6px 0", display: "flex" }}
        >
          <BackIcon />
        </button>
      ) : (
        <div style={{ width: 28 }} />
      )}

      <span
        style={{
          flex:         1,
          textAlign:    "center",
          fontSize:     17,
          fontWeight:   700,
          color:        "#f8f7f2",
          overflow:     "hidden",
          textOverflow: "ellipsis",
          whiteSpace:   "nowrap",
        }}
      >
        {title}
      </span>

      <div style={{ width: 28, display: "flex", justifyContent: "flex-end" }}>
        {rightAction ?? null}
      </div>
    </div>
  );
}
