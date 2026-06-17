import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { publicService } from "../../services/publicService";
import { WorkshopCard, EmptyState } from "../../components/public/ContentCards";
import { isHackathonEvent } from "../../utils/eventPaths";

const WorkshopsPage = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicService.getWorkshops("workshop").then((r) => {
        if (r.success) setWorkshops(r.data.filter((w) => !isHackathonEvent(w)));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="section-container py-12">
      <div className="max-w-3xl mb-8">
        <h1 className="font-display text-3xl lg:text-4xl font-bold">Workshops</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">
          Upcoming workshops from IndLearn. Open an event and pay with PayPal to register.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {loading && <p className="text-slate-500 col-span-full">Loading...</p>}
        {!loading &&
          workshops.map((w) => <WorkshopCard key={w._id} workshop={w} />)}
        {!loading && !workshops.length && (
          <EmptyState
            title="No upcoming workshops"
            hint="We are scheduling new workshops. Please check back soon."
          />
        )}
      </div>
      <p className="text-center mt-10 text-sm text-slate-500">
        Looking for hackathons?{" "}
        <Link to="/events" className="text-brand-600 hover:underline">
          View hackathons →
        </Link>
      </p>
    </div>
  );
};

export default WorkshopsPage;
