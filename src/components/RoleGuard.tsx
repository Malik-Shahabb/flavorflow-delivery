import { Navigate } from "react-router-dom";
import { useAuth, ActiveRole } from "@/context/AuthContext";

interface RoleGuardProps {
  children: React.ReactNode;
  /** Roles that are BLOCKED from accessing this route */
  blockedRoles?: ActiveRole[];
  /** Where to redirect blocked users */
  redirectTo?: string;
}

const roleRedirects: Record<string, string> = {
  owner: "/owner-dashboard",
  delivery: "/delivery-dashboard",
};

const RoleGuard = ({ children, blockedRoles = [], redirectTo }: RoleGuardProps) => {
  const { activeRole } = useAuth();

  if (activeRole && blockedRoles.includes(activeRole)) {
    const target = redirectTo || roleRedirects[activeRole] || "/";
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
