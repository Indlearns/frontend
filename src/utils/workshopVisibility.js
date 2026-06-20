export const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const PUBLIC_WORKSHOP_STATUSES = ["upcoming", "ongoing", "live"];

/** Whether an event is shown on public workshop/hackathon pages. */
export const isPubliclyVisibleWorkshop = (workshop, today = startOfToday()) => {
  if (!workshop) return false;
  if (["cancelled", "completed"].includes(workshop.status)) return false;
  if (!PUBLIC_WORKSHOP_STATUSES.includes(workshop.status)) return false;

  const eventDate = new Date(workshop.date);
  eventDate.setHours(0, 0, 0, 0);

  if (eventDate >= today) return true;

  if (workshop.registrationCloseDate) {
    const closeDate = new Date(workshop.registrationCloseDate);
    closeDate.setHours(0, 0, 0, 0);
    if (closeDate >= today) return true;
  }

  return false;
};
