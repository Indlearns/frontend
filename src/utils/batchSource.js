/** Title of the course / workshop / hackathon linked to a batch */
export const getBatchItemTitle = (batch) => {
  if (!batch) return "";
  return batch.course?.title || batch.workshop?.title || "";
};

export const getBatchItemLabel = (batch) => {
  const type = batch?.sourceType || (batch?.workshop ? "workshop" : "course");
  if (type === "hackathon") return "Hackathon";
  if (type === "workshop") return "Workshop";
  return "Course";
};
