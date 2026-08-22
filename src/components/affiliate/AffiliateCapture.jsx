import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { captureAffiliateFromUrl } from "../utils/affiliateTracking";

const AffiliateCapture = () => {
  const location = useLocation();

  useEffect(() => {
    captureAffiliateFromUrl();
  }, [location.search]);

  return null;
};

export default AffiliateCapture;
