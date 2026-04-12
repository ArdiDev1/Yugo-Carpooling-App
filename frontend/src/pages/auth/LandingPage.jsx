import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { ROUTES } from "../../constants/routes";
import yugoLogo from "../../assets/Yugo_w_slogan_transparent.png";

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", backgroundColor: "#07104e", overflow: "hidden" }}>
      {/* Top hero area */}
      <div style={{
        flex: 1,
        backgroundColor: "#07104e",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px 24px",
      }}>
        <img
          src={yugoLogo}
          alt="Yugo — Ride together"
          style={{ width: 220, maxWidth: "80%" }}
        />
      </div>

      {/* Bottom actions */}
      <div style={{ padding: "28px 24px", backgroundColor: "#07104e", display: "flex", flexDirection: "column", gap: 12 }}>
        <Button variant="gradient" size="lg" fullWidth onClick={() => navigate(ROUTES.SIGNUP)}>
          Get Started
        </Button>
        <Button variant="ghost" size="lg" fullWidth onClick={() => navigate(ROUTES.LOGIN)}>
          I already have an account
        </Button>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", textAlign: "center", marginTop: 4, lineHeight: 1.6 }}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
