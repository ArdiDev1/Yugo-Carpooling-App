import { useState } from "react";

function HeartIcon({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#EF4444" : "none"} stroke={filled ? "#EF4444" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function PostActions({ postId, likes = 0, comments = 0, onComment }) {
  const [liked, setLiked]       = useState(false);
  const [likeCount, setCount]   = useState(likes);

  const handleLike = () => {
    setLiked((v) => !v);
    setCount((c) => (liked ? c - 1 : c + 1));
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, paddingTop: 8 }}>
      <button
        onClick={handleLike}
        style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0 }}
      >
        <HeartIcon filled={liked} />
        <span style={{ fontSize: 13, color: liked ? "#EF4444" : "#9CA3AF" }}>{likeCount}</span>
      </button>

      <button
        onClick={onComment}
        style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0 }}
      >
        <CommentIcon />
        <span style={{ fontSize: 13, color: "#9CA3AF" }}>{comments}</span>
      </button>
    </div>
  );
}
