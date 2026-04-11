import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { authService } from "../services/auth.service";
import { ROUTES } from "../constants/routes";

export function useAuth() {
  const { user, role, token, setUser, clearAuth, updateUser } = useAuthStore();
  const navigate = useNavigate();

  const login = async (email, password) => {
    const { data } = await authService.login(email, password);
    setUser(data.user, data.token);
    navigate(ROUTES.HOME);
  };

  const logout = () => {
    clearAuth();
    navigate(ROUTES.LANDING);
  };

  return {
    user,
    role,
    token,
    isDriver:    role === "driver",
    isPassenger: role === "passenger",
    isLoggedIn:  !!user,
    login,
    logout,
    updateUser,
  };
}
