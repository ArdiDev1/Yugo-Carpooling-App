import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import PageHeader from "../../components/layout/PageHeader";
import { ROUTES } from "../../constants/routes";
import { useThemeStore } from "../../store/theme.store";

function SettingsRow({ icon, label, onClick, danger = false, rightLabel, rightElement }) {
  return (
    <button
      onClick={onClick}
      style={{
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "space-between",
        padding:         "16px 20px",
        backgroundColor: "var(--color-surface)",
        border:          "none",
        borderBottom:    "1px solid var(--color-border)",
        cursor:          onClick ? "pointer" : "default",
        width:           "100%",
        textAlign:       "left",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontSize: 15, color: danger ? "#EF4444" : "var(--color-text)", fontWeight: 500 }}>{label}</span>
      </div>
      {rightElement ?? <span style={{ fontSize: 13, color: "var(--color-muted)" }}>{rightLabel ?? "›"}</span>}
    </button>
  );
}

const THEME_OPTIONS = [
  { value: "light",  label: "Light",  emoji: "☀️" },
  { value: "dark",   label: "Dark",   emoji: "🌙" },
  { value: "system", label: "System", emoji: "⚙️" },
];

function ThemeSelector() {
  const { preference, setPreference } = useThemeStore();

  return (
    <div style={{ display: "flex", gap: 6, padding: "0 20px 14px" }}>
      {THEME_OPTIONS.map(({ value, label, emoji }) => {
        const active = preference === value;
        return (
          <button
            key={value}
            onClick={() => setPreference(value)}
            style={{
              flex:          1,
              padding:       "8px 4px",
              borderRadius:  8,
              border:        `2px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
              background:    active ? "var(--color-primary-light)" : "var(--color-surface)",
              cursor:        "pointer",
              display:       "flex",
              flexDirection: "column",
              alignItems:    "center",
              gap:           3,
            }}
          >
            <span style={{ fontSize: 18 }}>{emoji}</span>
            <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? "var(--color-primary)" : "var(--color-muted)" }}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function SettingsPage() {
  const navigate  = useNavigate();
  const { logout, user } = useAuth();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "var(--color-background)" }}>
      <PageHeader title="Settings" showBack />

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Account section */}
        <div style={{ padding: "16px 16px 4px" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Account</span>
        </div>
        <SettingsRow icon="✏️"  label="Edit Profile"    onClick={() => navigate(ROUTES.EDIT_PROFILE)} />
        <SettingsRow icon="🔒"  label="Change Password" onClick={() => {}} />
        <SettingsRow icon="🏫"  label="School"          rightLabel={user?.school ?? ""} onClick={() => {}} />

        {/* Preferences */}
        <div style={{ padding: "16px 16px 4px" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Preferences</span>
        </div>
        <SettingsRow icon="🔔"  label="Notifications" onClick={() => {}} />
        <SettingsRow icon="🔒"  label="Privacy"       onClick={() => {}} />

        {/* Appearance */}
        <div style={{ padding: "16px 16px 8px" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Appearance</span>
        </div>
        <div style={{ backgroundColor: "var(--color-surface)", borderBottom: "1px solid var(--color-border)", padding: "14px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 20 }}>🎨</span>
            <span style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text)" }}>Theme</span>
          </div>
          <ThemeSelector />
        </div>

        {/* Danger zone */}
        <div style={{ padding: "16px 16px 4px" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Account Actions</span>
        </div>
        <SettingsRow icon="🚪"  label="Log Out"        onClick={logout} />
        <SettingsRow icon="🗑️"  label="Delete Account" onClick={() => navigate(ROUTES.DELETE_ACCOUNT)} danger />

        <div style={{ padding: "20px 16px", textAlign: "center" }}>
          <span style={{ fontSize: 12, color: "var(--color-muted)" }}>Yugo v1.0.0</span>
        </div>
      </div>
    </div>
  );
}
