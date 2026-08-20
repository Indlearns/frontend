const stripHtml = (html) =>
  String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const jobSearchText = (job) =>
  [
    job.title,
    job.company,
    job.location,
    job.jobType,
    ...(job.skills || []),
    stripHtml(job.description),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

/** Match jobs when every search word appears somewhere in the listing */
export const filterJobsByKeyword = (jobs, keyword) => {
  const query = String(keyword || "").trim().toLowerCase();
  if (!query) return jobs;

  const words = query.split(/\s+/).filter(Boolean);
  return jobs.filter((job) => {
    const haystack = jobSearchText(job);
    return words.every((word) => haystack.includes(word));
  });
};
