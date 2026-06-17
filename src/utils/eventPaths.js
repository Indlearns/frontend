export const normalizeEventType = (item) => {
  const type = String(item?.eventType || "workshop").toLowerCase().trim();
  return type === "hackathon" ? "hackathon" : "workshop";
};

export const isHackathonEvent = (item) => normalizeEventType(item) === "hackathon";

/** Merge home API arrays and split by eventType (handles older APIs that return all in workshops). */
export const splitHomeEvents = (home) => {
  const merged = [...(home?.workshops || []), ...(home?.hackathons || [])];
  const byId = new Map();
  merged.forEach((item) => {
    if (item?._id) byId.set(String(item._id), item);
  });
  const all = [...byId.values()];
  return {
    workshops: all.filter((item) => !isHackathonEvent(item)),
    hackathons: all.filter((item) => isHackathonEvent(item)),
  };
};

export const getEventListPath = (item) =>
  isHackathonEvent(item) ? "/events" : "/workshops";

export const getEventDetailPath = (item) => {
  const id = item?._id || item;
  return isHackathonEvent(item) ? `/events/${id}` : `/workshops/${id}`;
};
