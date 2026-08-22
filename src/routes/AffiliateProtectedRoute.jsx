import { Navigate } from "react-router-dom";
import { useAffiliateAuth } from "../contexts/AffiliateAuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { AFFILIATE_LOGIN_PATH } from "../utils/constants";

const AffiliateProtectedRoute = ({ children }) => {
  const { isAffiliateAuthenticated, loading } = useAffiliateAuth();

  if (loading) return <LoadingSpinner fullScreen />;

  if (!isAffiliateAuthenticated) {
    return <Navigate to={AFFILIATE_LOGIN_PATH} replace />;
  }

  return children;
};

export default AffiliateProtectedRoute;
