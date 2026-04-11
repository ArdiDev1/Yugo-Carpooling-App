import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { ROUTES } from "../../constants/routes";

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", backgroundColor: "#fff", overflow: "hidden" }}>
      {/* Top gradient area */}
      <div style={{
        flex: 1,
        background: "linear-gradient(160deg, #6C47FF 0%, #a78bfa 60%, #F7F7F8 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px 24px",
      }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🚗</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", textAlign: "center", margin: 0, lineHeight: 1.2 }}>
          Yugo
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", textAlign: "center", marginTop: 10, lineHeight: 1.6, maxWidth: 280 }}>
          Ride together with students from your college. Safe, affordable, and social.
        </p>
      </div>

      {/* Bottom actions */}
      <div style={{ padding: "28px 24px", backgroundColor: "#fff", display: "flex", flexDirection: "column", gap: 12 }}>
        <Button variant="primary" size="lg" fullWidth onClick={() => navigate(ROUTES.SIGNUP)}>
          Get Started
        </Button>
        <Button variant="ghost" size="lg" fullWidth onClick={() => navigate(ROUTES.LOGIN)}>
          I already have an account
        </Button>
        <p style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", marginTop: 4, lineHeight: 1.6 }}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
