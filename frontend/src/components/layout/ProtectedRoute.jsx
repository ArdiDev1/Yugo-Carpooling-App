import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { ROUTES } from "../../constants/routes";

export default function ProtectedRoute({ children }) {
  const user       = useAuthStore((state) => state.user);
  const hydrated   = useAuthStore.persist?.hasHydrated?.() ?? true;

  // While Zustand is rehydrating from localStorage, show nothing
  if (!hydrated) return null;

  if (!user) return <Navigate to={ROUTES.LANDING} replace />;

  return children;
}
