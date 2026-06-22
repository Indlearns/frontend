import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiExternalLink } from "react-icons/fi";
import { studentService } from "../../services/studentService";
import { EmptyState } from "../../components/public/ContentCards";
import { getEventDetailPath } from "../../utils/eventPaths";
import { formatPrice, formatRegistrationCloseDate } from "../../utils/media";
import Button from "../../components/common/Button";

const RegisteredEventCard = ({ event }) => (
  <div className="glass-card p-5 flex flex-col h-full">
    <div className="flex items-start justify-between gap-2">
      <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center shrink-0">
        <FiCalendar className="text-brand-600" />
      </div>
      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium">
        Registered
      </span>
    </div>
    <h3 className="font-bold text-lg mt-3">{event.title}</h3>
    <p className="text-xs text-slate-500 mt-2 capitalize">{event.status || "upcoming"}</p>
    <p className="text-sm font-medium text-brand-600 mt-1">
      {formatPrice(event.price, event.currency)}
    </p>
    <p className="text-xs text-slate-500 mt-2">
      {new Date(event.date).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })}
      {event.startTime && ` · ${event.startTime}`}
      {event.endTime && `–${event.endTime}`}
    </p>
    {event.registrationCloseDate && (
      <p className="text-xs text-slate-500 mt-1">
        Registration closed {formatRegistrationCloseDate(event.registrationCloseDate)}
      </p>
    )}
    <div className="mt-auto pt-4 flex flex-wrap gap-2">
      <Link to={getEventDetailPath(event)}>
        <Button type="button" variant="outline" className="text-sm py-2">
          View details
        </Button>
      </Link>
      {event.meetLink && (
        <a
          href={event.meetLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline font-medium py-2"
        >
          Join link <FiExternalLink size={14} />
        </a>
      )}
    </div>
  </div>
);

const StudentMyEventsPage = ({ kind }) => {
  const isHackathon = kind === "hackathon";
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    studentService
      .getMyEvents()
      .then((r) => {
        if (r.success) {
          setEvents(isHackathon ? r.data.hackathons : r.data.workshops);
        }
      })
      .finally(() => setLoading(false));
  }, [isHackathon]);

  const title = isHackathon ? "My hackathons" : "My workshops";
  const browsePath = isHackathon ? "/events" : "/workshops";
  const browseLabel = isHackathon ? "Browse hackathons" : "Browse workshops";

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl sm:text-2xl font-bold mb-2">{title}</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6 sm:mb-8 text-sm sm:text-base">
        {isHackathon
          ? "Hackathons and competitive events you have registered for."
          : "Workshops you have registered for via payment or free enrollment."}
      </p>

      {loading && <p className="text-slate-500">Loading...</p>}

      {!loading && events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {events.map((event) => (
            <RegisteredEventCard key={event._id} event={event} />
          ))}
        </div>
      )}

      {!loading && !events.length && (
        <EmptyState
          title={isHackathon ? "No hackathons yet" : "No workshops yet"}
          hint={
            isHackathon
              ? "Register for a hackathon from the events page to see it here."
              : "Register for a workshop from the workshops page to see it here."
          }
        />
      )}

      <div className="mt-8">
        <Link to={browsePath}>
          <Button variant="outline">{browseLabel}</Button>
        </Link>
      </div>
    </div>
  );
};

export default StudentMyEventsPage;
