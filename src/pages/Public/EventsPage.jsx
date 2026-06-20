import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { publicService } from "../../services/publicService";
import { WorkshopCard, EmptyState } from "../../components/public/ContentCards";
import { isHackathonEvent } from "../../utils/eventPaths";

/** Events = hackathons and paid live events */
const EventsPage = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    publicService.getWorkshops("hackathon").then((r) => {
      if (r.success) setEvents(r.data.filter((w) => isHackathonEvent(w)));
    });
  }, []);

  return (
    <div className="section-container py-12">
      <h1 className="font-display text-3xl lg:text-4xl font-bold">Hackathons</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-2xl">
        Competitive hackathons from IndLearn partners. Register and pay securely with Zoho Payments.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {events.map((w) => (
          <WorkshopCard key={w._id} workshop={w} />
        ))}
        {!events.length && (
          <EmptyState title="No hackathons scheduled" hint="Check back soon or browse workshops." />
        )}
      </div>
      <p className="text-center mt-8 text-sm text-slate-500">
        <Link to="/workshops" className="text-brand-600 hover:underline">
          Browse workshops →
        </Link>
      </p>
    </div>
  );
};

export default EventsPage;
