export const isHackathonEvent = (item) => item?.eventType === "hackathon";

export const getEventListPath = (item) =>
  isHackathonEvent(item) ? "/events" : "/workshops";

export const getEventDetailPath = (item) => {
  const id = item?._id || item;
  return isHackathonEvent(item) ? `/events/${id}` : `/workshops/${id}`;
};
