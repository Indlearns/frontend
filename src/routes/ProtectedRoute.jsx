import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  ROLES,
  SUPERADMIN_LOGIN_PATH,
  ADMIN_LOGIN_PATH,
  PARTNER_LOGIN_PATH,
} from "../utils/constants";

const LOGIN_PATHS = {
  [ROLES.SUPERADMIN]: SUPERADMIN_LOGIN_PATH,
  [ROLES.ADMIN]: ADMIN_LOGIN_PATH,
  [ROLES.TUTOR]: "/login",
  [ROLES.STUDENT]: "/login",
  [ROLES.PARTNER]: PARTNER_LOGIN_PATH,
};

const STAFF_ROLES = [ROLES.SUPERADMIN, ROLES.ADMIN];

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading, logout } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;

  const isStaffRoute = allowedRoles.some((r) => STAFF_ROLES.includes(r));
  const loginPath = !isAuthenticated
    ? isStaffRoute
      ? ADMIN_LOGIN_PATH
      : LOGIN_PATHS[allowedRoles[0]] || "/login"
    : user?.role === ROLES.SUPERADMIN
      ? SUPERADMIN_LOGIN_PATH
      : user?.role === ROLES.ADMIN
        ? ADMIN_LOGIN_PATH
        : LOGIN_PATHS[allowedRoles[0]] || "/login";

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    logout();
    return (
      <Navigate
        to={loginPath}
        replace
        state={{
          error: `You are "${user?.role}". Use the correct login page.`,
        }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;
