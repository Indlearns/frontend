/** Must match the ID in frontend/index.html */
export const GA_MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID || "G-6MJLWBM8TK";

export const isGoogleAnalyticsEnabled = () =>
  typeof window !== "undefined" && typeof window.gtag === "function";

/** Track SPA route changes (initial page view is sent by the tag in index.html). */
export const trackPageView = (path) => {
  if (!isGoogleAnalyticsEnabled()) return;
  window.gtag("config", GA_MEASUREMENT_ID, { page_path: path });
};
