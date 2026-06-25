import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "../../utils/analytics";

/** Sends GA4 page_view on each client-side route change. */
const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(`${location.pathname}${location.search}`);
  }, [location]);

  return null;
};

export default GoogleAnalytics;
