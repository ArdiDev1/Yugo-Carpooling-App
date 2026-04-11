import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import PageHeader from "../../components/layout/PageHeader";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAuthStore } from "../../store/auth.store";
import { authService } from "../../services/auth.service";
import { MOCK_CURRENT_USER } from "../../mocks/users";
import { ROUTES } from "../../constants/routes";

const USE_MOCK = true;

export default function LoginPage() {
  const navigate   = useNavigate();
  const setUser    = useAuthStore((s) => s.setUser);
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      if (USE_MOCK) {
        // Mock login — use first mock user
        setUser(MOCK_CURRENT_USER, "mock-token-123");
        navigate(ROUTES.HOME);
        return;
      }
      const res = await authService.login(data.email, data.password);
      setUser(res.data.user, res.data.token);
      navigate(ROUTES.HOME);
    } catch (e) {
      setError(e.response?.data?.message ?? "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
