const STORAGE_KEY = "indlearn_affiliate_code";
const STORAGE_EXPIRY_KEY = "indlearn_affiliate_expires";
const TTL_DAYS = 30;

export const captureAffiliateFromUrl = () => {
  if (typeof window === "undefined") return;

  try {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("aff")?.trim().toUpperCase();
    if (!code) return;

    const expires = Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, code);
    localStorage.setItem(STORAGE_EXPIRY_KEY, String(expires));
  } catch {
    // ignore storage errors
  }
};

export const getStoredAffiliateCode = () => {
  if (typeof window === "undefined") return "";

  try {
    const code = localStorage.getItem(STORAGE_KEY);
    const expires = Number(localStorage.getItem(STORAGE_EXPIRY_KEY) || 0);
    if (!code || !expires || Date.now() > expires) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_EXPIRY_KEY);
      return "";
    }
    return code;
  } catch {
    return "";
  }
};

export const appendAffiliateToPath = (path) => {
  const code = getStoredAffiliateCode();
  if (!code) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}aff=${encodeURIComponent(code)}`;
};
