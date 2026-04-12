import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import PageHeader from "../../components/layout/PageHeader";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAuthStore } from "../../store/auth.store";
import { authService } from "../../services/auth.service";
import { ROUTES } from "../../constants/routes";

export default function LoginPage() {
  const navigate   = useNavigate();
  const setUser    = useAuthStore((s) => s.setUser);
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [accounts, setAccounts] = useState(null); // dual-account picker

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(data.email, data.password);

      // If user has both driver + passenger accounts
      if (res.data.accounts) {
        setAccounts(res.data.accounts);
        setLoading(false);
        return;
      }

      setUser(res.data.user, res.data.token);
      navigate(ROUTES.HOME);
    } catch (e) {
      setError(e.response?.data?.detail ?? "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const pickAccount = (account) => {
    setUser(account.user, account.token);
    navigate(ROUTES.HOME);
  };

  // Dual-account picker screen
  if (accounts) {
    return (
      <div style={{ height: "100dvh", display: "flex", flexDirection: "column", backgroundColor: "#F7F7F8" }}>
        <PageHeader title="Choose Account" showBack onBack={() => setAccounts(null)} />
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
          <p style={{ fontSize: 15, color: "#6B7280", marginBottom: 20, lineHeight: 1.5 }}>
            You have two accounts with this email. Which one would you like to use?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {accounts.map((acc) => (
              <button
                key={acc.user.role}
                onClick={() => pickAccount(acc)}
                style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "18px 20px", borderRadius: 12,
                  border: "2px solid #E5E7EB", backgroundColor: "#fff",
                  cursor: "pointer", textAlign: "left",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "#6C47FF"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "#E5E7EB"}
              >
                <span style={{ fontSize: 36 }}>{acc.user.role === "driver" ? "🚗" : "🙋"}</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
                    {acc.user.role === "driver" ? "Driver" : "Passenger"}
                  </div>
                  <div style={{ fontSize: 13, color: "#6B7280" }}>
                    {acc.user.username} — {acc.user.school || "No school set"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", backgroundColor: "#F7F7F8" }}>
      <PageHeader title="Log In" showBack onBack={() => navigate(ROUTES.LANDING)} />

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input
            label="School Email"
            name="email"
            type="email"
            placeholder="you@school.edu"
            register={register}
            error={errors.email?.message}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            register={register}
            error={errors.password?.message}
          />

          {error && <p style={{ fontSize: 13, color: "#EF4444", textAlign: "center" }}>{error}</p>}

          <Button type="submit" fullWidth loading={loading} style={{ marginTop: 8 }}>
            Log In
          </Button>

          <button
            type="button"
            onClick={() => navigate(ROUTES.SIGNUP)}
            style={{ background: "none", border: "none", fontSize: 14, color: "#6C47FF", cursor: "pointer", fontWeight: 600 }}
          >
            Don't have an account? Sign up
          </button>
        </form>
      </div>
    </div>
  );
}
