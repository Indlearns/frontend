import { useEffect, useState } from "react";
import { publicService } from "../services/publicService";
import { isHackathonEvent } from "../utils/eventPaths";

let cachedAvailability = null;
let fetchPromise = null;

export const loadPublicEventAvailability = async () => {
  if (cachedAvailability) return cachedAvailability;
  if (!fetchPromise) {
    fetchPromise = Promise.all([
      publicService.getWorkshops("workshop"),
      publicService.getWorkshops("hackathon"),
    ]).then(([workshopRes, hackathonRes]) => {
      cachedAvailability = {
        hasWorkshops: Boolean(
          workshopRes.success && workshopRes.data.some((item) => !isHackathonEvent(item))
        ),
        hasHackathons: Boolean(
          hackathonRes.success && hackathonRes.data.some((item) => isHackathonEvent(item))
        ),
      };
      return cachedAvailability;
    });
  }
  return fetchPromise;
};

export const filterPublicNavLinks = (links, { hasWorkshops, hasHackathons }) =>
  links.filter((link) => {
    if (link.path === "/workshops") return hasWorkshops;
    if (link.path === "/events") return hasHackathons;
    return true;
  });

export const usePublicEventAvailability = () => {
  const [availability, setAvailability] = useState(
    cachedAvailability || { hasWorkshops: false, hasHackathons: false, loading: true }
  );

  useEffect(() => {
    let active = true;
    loadPublicEventAvailability().then((data) => {
      if (active) setAvailability({ ...data, loading: false });
    });
    return () => {
      active = false;
    };
  }, []);

  return availability;
};
