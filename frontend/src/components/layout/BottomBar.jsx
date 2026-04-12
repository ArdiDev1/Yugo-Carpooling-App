import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { useChatStore } from "../../store/chat.store";

const CREAM = "#f8f7f2";

function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={CREAM} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={CREAM} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
      <polyline points="9 21 9 12 15 12 15 21" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={CREAM} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5"  y1="12" x2="19" y2="12" />
    </svg>
  );
}

export default function BottomBar() {
  const navigate     = useNavigate();
  const { pathname } = useLocation();
  const rooms        = useChatStore((state) => state.rooms);
  const unread       = rooms.reduce((sum, r) => sum + (r.unreadCount ?? 0), 0);

  const isActive  = (path) => pathname.startsWith(path);
  const showFab   = !pathname.startsWith(ROUTES.MESSAGES) &&
                    !pathname.startsWith(ROUTES.CREATE) &&
                    !pathname.startsWith(ROUTES.EDIT_PROFILE) &&
                    !pathname.startsWith(ROUTES.SETTINGS);

  const barHeight = "calc(60px + env(safe-area-inset-bottom))";

  const navBtn = (onClick, icon, label, active) => (
    <button
      onClick={onClick}
      style={{
        flex:           1,
        background:     "none",
        border:         "none",
        cursor:         "pointer",
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        gap:            3,
        padding:        "8px 0",
        opacity:        active ? 1 : 0.7,
        transition:     "opacity 0.15s",
      }}
    >
      {icon}
      <span style={{ fontSize: 10, color: CREAM, fontWeight: active ? 700 : 500 }}>
        {label}
      </span>
    </button>
  );

  return (
    <>
      {/* Floating plus button — gradient, just above the bar */}
      {showFab && <button
        onClick={() => navigate(ROUTES.CREATE)}
        style={{
          position:        "absolute",
          bottom:          `calc(60px + env(safe-area-inset-bottom) + 14px)`,
          right:            16,
          width:           46,
          height:          46,
          borderRadius:    "50%",
          background:      "linear-gradient(135deg, #f08a4b 0%, #e24182 100%)",
          border:          "none",
          cursor:          "pointer",
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          boxShadow:       "0 4px 16px rgba(226,65,130,0.4)",
          zIndex:          52,
        }}
      >
        <PlusIcon />
      </button>}

      {/* Bottom nav bar */}
      <nav
        style={{
          position:        "absolute",
          bottom:          0,
          left:            0,
          right:           0,
          height:          barHeight,
          paddingBottom:   "env(safe-area-inset-bottom)",
          backgroundColor: "#07104e",
          borderTop:       "1px solid rgba(255,255,255,0.08)",
          display:         "flex",
          alignItems:      "center",
          zIndex:          50,
        }}
      >
        {navBtn(
          () => navigate(ROUTES.MESSAGES),
          <div style={{ position: "relative" }}>
            <ChatIcon />
            {unread > 0 && (
              <div style={{
                position: "absolute", top: -4, right: -6,
                backgroundColor: "#fa6bae", borderRadius: 999,
                minWidth: 16, height: 16, fontSize: 10, fontWeight: 700,
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 3px",
              }}>
                {unread}
              </div>
            )}
          </div>,
          "Messages",
          isActive(ROUTES.MESSAGES)
        )}

        {navBtn(
          () => navigate(ROUTES.HOME),
          <HomeIcon />,
          "Home",
          isActive(ROUTES.HOME)
        )}

        {navBtn(
          () => navigate(ROUTES.MY_PROFILE),
          <ProfileIcon />,
          "Profile",
          isActive(ROUTES.MY_PROFILE)
        )}
      </nav>
    </>
  );
}
