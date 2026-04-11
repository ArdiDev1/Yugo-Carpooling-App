import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import PageHeader from "../../components/layout/PageHeader";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { ROUTES } from "../../constants/routes";

const CONFIRM_WORD = "DELETE";

export default function DeleteAccountPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);

  const confirmed = input === CONFIRM_WORD;

  const handleDelete = async () => {
    if (!confirmed) return;
    setLoading(true);
    try {
      // TODO: await userService.deleteAccount()
      logout();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#F7F7F8" }}>
      <PageHeader title="Delete Account" showBack />
      <div style={{ flex: 1, padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ backgroundColor: "#FEE2E2", borderRadius: 12, padding: "16px", border: "1px solid #FECACA" }}>
          <p style={{ fontSize: 14, color: "#991B1B", fontWeight: 700, marginBottom: 6 }}>⚠️ This action is permanent</p>
          <p style={{ fontSize: 13, color: "#B91C1C", lineHeight: 1.6, margin: 0 }}>
            Deleting your account will remove all your posts, messages, and profile information. This cannot be undone.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ fontSize: 14, color: "#374151", margin: 0 }}>
            Type <strong>DELETE</strong> to confirm:
          </p>
          <Input
            name="confirm"
            placeholder="Type DELETE here"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <Button
          variant="danger"
          fullWidth
          size="lg"
          disabled={!confirmed}
          loading={loading}
          onClick={handleDelete}
        >
          Delete My Account
        </Button>

        <Button variant="ghost" fullWidth onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
