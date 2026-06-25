/** Fields required before we treat a student profile as complete. */
export const REQUIRED_PROFILE_FIELDS = ["name", "phone", "headline"];

export const getMissingProfileFields = (user, profile) => {
  const missing = [];
  if (!user?.name?.trim()) missing.push("name");
  if (!user?.phone?.trim()) missing.push("phone");
  if (!profile?.headline?.trim()) missing.push("headline");
  return missing;
};

export const isStudentProfileComplete = (user, profile) =>
  getMissingProfileFields(user, profile).length === 0;

export const profileCompletionPercent = (user, profile) => {
  const filled = REQUIRED_PROFILE_FIELDS.length - getMissingProfileFields(user, profile).length;
  return Math.round((filled / REQUIRED_PROFILE_FIELDS.length) * 100);
};
