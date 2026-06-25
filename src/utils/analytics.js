const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "";

let initialized = false;

export const isGoogleAnalyticsEnabled = () =>
  Boolean(GA_MEASUREMENT_ID) && import.meta.env.PROD;

export const initGoogleAnalytics = () => {
  if (!isGoogleAnalyticsEnabled() || initialized || typeof window === "undefined") return;

  initialized = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
};

export const trackPageView = (path) => {
  if (!isGoogleAnalyticsEnabled() || typeof window.gtag !== "function") return;
  window.gtag("config", GA_MEASUREMENT_ID, { page_path: path });
};

export const getGaMeasurementId = () => GA_MEASUREMENT_ID;
