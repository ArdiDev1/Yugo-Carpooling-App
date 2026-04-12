import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { ROUTES } from "../../constants/routes";
import { authService } from "../../services/auth.service";

export default function EmailVerificationPage() {
  const navigate       = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.verifyEmail(code);
      navigate(ROUTES.HOME);
    } catch {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", backgroundColor: "#F7F7F8" }}>
      <PageHeader title="Verify Email" showBack />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 24px" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📧</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", textAlign: "center", margin: "0 0 8px" }}>
          Check your email
        </h2>
        <p style={{ fontSize: 14, color: "#6B7280", textAlign: "center", marginBottom: 24, lineHeight: 1.6, maxWidth: 280 }}>
          We sent a verification code to your school email address.
        </p>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
          <Input
            label="Verification Code"
            name="code"
            placeholder="Enter 4-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            error={error}
          />
          <Button fullWidth loading={loading} onClick={handleVerify}>Verify Email</Button>
          <button
            style={{ background: "none", border: "none", fontSize: 13, color: "#6C47FF", cursor: "pointer", fontWeight: 600 }}
          >
            Resend code
          </button>
        </div>
      </div>
    </div>
  );
}
