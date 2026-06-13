import Button from "../common/Button";

/** Shows enrolled/registered, closed, or error states after purchase check */
const PurchaseStatus = ({ enrollment, meetLink, onGoPurchases }) => {
  if (enrollment.isClosed) {
    return (
      <div className="mt-10 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border text-center">
        <p className="font-medium text-slate-700 dark:text-slate-300">{enrollment.closedMsg}</p>
        <p className="text-sm text-slate-500 mt-1">{enrollment.closedHint}</p>
      </div>
    );
  }

  if (enrollment.hasAccess) {
    return (
      <div className="mt-10 p-6 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 text-center">
        <p className="text-green-800 dark:text-green-200 font-medium">{enrollment.accessMsg}</p>
        {meetLink && (
          <a
            href={meetLink}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-4 text-brand-600 hover:underline text-sm font-medium"
          >
            Open event link →
          </a>
        )}
        {enrollment.batchEnrolled ? (
          <Button type="button" className="mt-4" onClick={() => enrollment.navigate("/student/courses")}>
            Go to My Courses
          </Button>
        ) : (
          <Button type="button" className="mt-4" onClick={() => enrollment.navigate("/student")}>
            Go to student dashboard
          </Button>
        )}
      </div>
    );
  }

  if (enrollment.error) {
    return <p className="text-sm text-red-600 mt-4">{enrollment.error}</p>;
  }

  return null;
};

export default PurchaseStatus;
