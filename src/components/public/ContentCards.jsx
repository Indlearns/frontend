import { Link } from "react-router-dom";
import { FiBookOpen, FiCalendar, FiBriefcase, FiArrowRight } from "react-icons/fi";
import {
  getImageUrl,
  formatPrice,
  formatEnrollmentCloseDate,
  isEnrollmentClosed,
  formatRegistrationCloseDate,
  isRegistrationClosed,
} from "../../utils/media";

export const CourseCard = ({ course, compact }) => {
  const closed = isEnrollmentClosed(course);
  const detailUrl = `/courses/${course._id}`;

  return (
    <div className="glass-card overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full group">
      <Link to={detailUrl} className="block flex-1">
        {course.thumbnail ? (
          <img
            src={getImageUrl(course.thumbnail)}
            alt=""
            className="w-full h-40 object-cover"
          />
        ) : (
          <div className="w-full h-40 bg-brand-500/10 flex items-center justify-center">
            <FiBookOpen className="text-brand-500" size={40} />
          </div>
        )}
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-bold text-brand-600">
              {formatPrice(course.price, course.currency)}
            </span>
            {course.enrollmentCloseDate && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  closed
                    ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                }`}
              >
                {closed
                  ? "Enrollment closed"
                  : `Closes ${formatEnrollmentCloseDate(course.enrollmentCloseDate)}`}
              </span>
            )}
          </div>
          <h3 className="font-bold text-lg mt-2 text-slate-900 dark:text-white group-hover:text-brand-600">
            {course.title}
          </h3>
          {!compact && course.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
              {course.description}
            </p>
          )}
          <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
            {course.category || "General"}
            {course.duration && ` · ${course.duration}`}
            <FiArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-brand-600" />
          </p>
        </div>
      </Link>
      <div className="px-5 pb-5 pt-0">
        {closed ? (
          <Link to={detailUrl} className="btn-outline w-full block text-center py-3 rounded-xl">
            View details
          </Link>
        ) : (
          <Link to={detailUrl} className="btn-primary w-full block text-center py-3 rounded-xl">
            Enroll now
          </Link>
        )}
      </div>
    </div>
  );
};

export const WorkshopCard = ({ workshop, compact }) => (
  <Link
    to={`/workshops/${workshop._id}`}
    className="glass-card p-5 hover:shadow-lg transition-shadow block group h-full"
  >
    <div className="flex items-start justify-between gap-2">
      <div className="w-10 h-10 rounded-xl bg-accent-500/15 flex items-center justify-center shrink-0">
        <FiCalendar className="text-accent-600 dark:text-accent-400" />
      </div>
      <span className="text-sm font-bold text-brand-600">
        {formatPrice(workshop.price, workshop.currency)}
      </span>
    </div>
    <h3 className="font-bold text-lg mt-3 text-slate-900 dark:text-white group-hover:text-brand-600">
      {workshop.title}
    </h3>
    {workshop.eventType && (
      <span className="text-xs capitalize text-accent-600">{workshop.eventType}</span>
    )}
    {!compact && workshop.description && (
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
        {workshop.description}
      </p>
    )}
    <p className="text-xs text-slate-500 mt-3">
      {new Date(workshop.date).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      })}
      {workshop.startTime && ` · ${workshop.startTime}`}
      {workshop.endTime && `–${workshop.endTime}`}
    </p>
    {workshop.registrationCloseDate && (
      <p className="text-xs mt-1">
        {isRegistrationClosed(workshop) ? (
          <span className="text-red-600">Registration closed</span>
        ) : (
          <span className="text-amber-700">
            Closes {formatRegistrationCloseDate(workshop.registrationCloseDate)}
          </span>
        )}
      </p>
    )}
  </Link>
);

export const CompanyCard = ({ company }) => (
  <div className="glass-card p-5 h-full flex flex-col">
    <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
      <FiBriefcase className="text-brand-600 dark:text-brand-400" />
    </div>
    <h3 className="font-bold text-lg mt-3">{company.name}</h3>
    {company.description && (
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-3 flex-1">
        {company.description}
      </p>
    )}
    <p className="text-xs text-slate-500 mt-3 capitalize">
      {company.partnershipType} partner
    </p>
    {company.website && (
      <a
        href={company.website}
        target="_blank"
        rel="noreferrer"
        className="text-sm text-brand-600 mt-2 hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        Visit website
      </a>
    )}
  </div>
);

export const EmptyState = ({ title, hint }) => (
  <div className="glass-card p-12 text-center col-span-full">
    <p className="font-medium text-slate-700 dark:text-slate-300">{title}</p>
    {hint && <p className="text-sm text-slate-500 mt-2">{hint}</p>}
  </div>
);
