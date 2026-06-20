/** Normalize to 10-digit Indian mobile (mirrors backend zohoPaymentFormat). */
export const normalizeIndianPhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  if (digits.length === 10) return digits;
  return "";
};

export const hasValidPaymentPhone = (phone) => Boolean(normalizeIndianPhone(phone));
