import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import PageHeader from "../../components/layout/PageHeader";
import { ROUTES } from "../../constants/routes";

function SettingsRow({ icon, label, onClick, danger = false, rightLabel }) {
  return (
    <button
      onClick={onClick}
      style={{
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "space-between",
        padding:         "16px 20px",
        backgroundColor: "#fff",
        border:          "none",
        borderBottom:    "1px solid #F3F4F6",
        cursor:          "pointer",
        width:           "100%",
        textAlign:       "left",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontSize: 15, color: danger ? "#EF4444" : "#111827", fontWeight: 500 }}>{label}</span>
      </div>
      <span style={{ fontSize: 13, color: "#9CA3AF" }}>{rightLabel ?? "›"}</span>
    </button>
  );
}

export default function SettingsPage() {
  const navigate  = useNavigate();
  const { logout, user } = useAuth();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#F7F7F8" }}>
      <PageHeader title="Settings" showBack />

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Account section */}
        <div style={{ padding: "16px 16px 4px" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase" }}>Account</span>
        </div>
        <SettingsRow icon="✏️"  label="Edit Profile"  onClick={() => navigate(ROUTES.EDIT_PROFILE)} />
        <SettingsRow icon="🔒"  label="Change Password" onClick={() => {}} />
        <SettingsRow icon="🏫"  label="School"        rightLabel={user?.school ?? ""} onClick={() => {}} />

        {/* Preferences */}
        <div style={{ padding: "16px 16px 4px" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase" }}>Preferences</span>
        </div>
        <SettingsRow icon="🔔"  label="Notifications" onClick={() => {}} />
        <SettingsRow icon="🔒"  label="Privacy"       onClick={() => {}} />

        {/* Danger zone */}
        <div style={{ padding: "16px 16px 4px" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase" }}>Account Actions</span>
        </div>
        <SettingsRow icon="🚪"  label="Log Out"       onClick={logout} />
        <SettingsRow icon="🗑️"  label="Delete Account" onClick={() => navigate(ROUTES.DELETE_ACCOUNT)} danger />

        <div style={{ padding: "20px 16px", textAlign: "center" }}>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>Yugo v1.0.0</span>
        </div>
      </div>
    </div>
  );
}
