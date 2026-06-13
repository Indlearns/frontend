/** Base URL for uploaded images (no /api suffix) */
export const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:5000";

export const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
};

export const isFreePrice = (item) => Number(item?.price ?? 0) <= 0;

export const formatPrice = (price, currency = "INR") => {
  if (!price || price <= 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
};

/** Enrollment open through end of enrollmentCloseDate (inclusive). */
export const isEnrollmentClosed = (course) => {
  if (!course?.enrollmentCloseDate) return false;
  const end = new Date(course.enrollmentCloseDate);
  end.setHours(23, 59, 59, 999);
  return Date.now() > end.getTime();
};

export const formatEnrollmentCloseDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const toDateInputValue = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

/** Registration open through end of registrationCloseDate (inclusive). */
export const isRegistrationClosed = (workshop) => {
  if (!workshop?.registrationCloseDate) return false;
  const end = new Date(workshop.registrationCloseDate);
  end.setHours(23, 59, 59, 999);
  return Date.now() > end.getTime();
};

export const formatRegistrationCloseDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
