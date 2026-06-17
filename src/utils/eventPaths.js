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

/** Build homepage workshop/hackathon lists and counts from home + list APIs. */
export const buildHomeEventPayload = (homeData, workshopRes, hackathonRes) => {
  const fallback = splitHomeEvents(homeData);

  let allWorkshops = fallback.workshops;
  let allHackathons = fallback.hackathons;

  if (workshopRes?.success) {
    allWorkshops = workshopRes.data.filter((item) => !isHackathonEvent(item));
  }
  if (hackathonRes?.success) {
    allHackathons = hackathonRes.data.filter((item) => isHackathonEvent(item));
  } else if (!allHackathons.length) {
    allHackathons = fallback.hackathons;
  }
  if (!workshopRes?.success && !allWorkshops.length) {
    allWorkshops = fallback.workshops;
  }

  return {
    workshops: allWorkshops.slice(0, 4),
    hackathons: allHackathons.slice(0, 4),
    counts: {
      courses: homeData?.counts?.courses ?? homeData?.courses?.length ?? 0,
      workshops: allWorkshops.length,
      hackathons: allHackathons.length,
    },
  };
};

export const getEventListPath = (item) =>
  isHackathonEvent(item) ? "/events" : "/workshops";

export const getEventDetailPath = (item) => {
  const id = item?._id || item;
  return isHackathonEvent(item) ? `/events/${id}` : `/workshops/${id}`;
};
