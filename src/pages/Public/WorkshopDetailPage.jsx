import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { publicService } from "../../services/publicService";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PurchaseButton from "../../components/payment/PurchaseButton";
import PurchaseStatus from "../../components/payment/PurchaseStatus";
import { useRazorpayPurchase } from "../../hooks/useRazorpayPurchase";
import {
  formatPrice,
  formatRegistrationCloseDate,
  isRegistrationClosed,
} from "../../utils/media";
import { resolveWorkshopPurchaseType } from "../../utils/purchaseFlow";
import FormattedDescription from "../../components/common/FormattedDescription";

const WorkshopDetailContent = ({ workshop, onReload }) => {
  const purchaseType = resolveWorkshopPurchaseType(workshop);
  const flow = useRazorpayPurchase({
    purchaseType,
    item: workshop,
    onSuccess: onReload,
  });

  const showAction = !flow.isClosed && !flow.hasAccess;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4 mt-4">
        <div className="flex-1 min-w-0">
          <span className="text-xs px-2 py-0.5 rounded-full bg-accent-100 text-accent-800 capitalize">
            {workshop.eventType || "workshop"}
          </span>
          <h1 className="font-display text-3xl font-bold mt-2">{workshop.title}</h1>
          <p className="text-sm text-slate-500 mt-2">
            {new Date(workshop.date).toLocaleString(undefined, {
              dateStyle: "full",
              timeStyle: "short",
            })}
            {workshop.startTime && ` (${workshop.startTime}–${workshop.endTime})`}
            {workshop.registrationCloseDate && (
              <>
                {" · "}
                {isRegistrationClosed(workshop) ? (
                  <span className="text-red-600 font-medium">Registration closed</span>
                ) : (
                  <>
                    Registration closes {formatRegistrationCloseDate(workshop.registrationCloseDate)}
                  </>
                )}
              </>
            )}
          </p>
          <p className="text-xl font-semibold text-brand-600 mt-2">
            {formatPrice(workshop.price, workshop.currency)}
          </p>
        </div>
        {showAction && (
          <PurchaseButton
            purchaseType={purchaseType}
            itemId={workshop._id}
            enrollment={flow}
            className="shrink-0"
          />
        )}
      </div>

      {workshop.description && (
        <div className="mt-6">
          <FormattedDescription text={workshop.description} />
        </div>
      )}

      <PurchaseStatus enrollment={flow} meetLink={flow.hasAccess ? workshop.meetLink : null} />

      {showAction && (
        <div className="mt-12 flex flex-col items-center text-center border-t border-brand-100 pt-10">
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">
            {purchaseType === "hackathon" ? "Ready to join this event?" : "Ready to register?"}
          </p>
          <p className="text-2xl font-bold text-brand-600 mb-1">
            {formatPrice(workshop.price, workshop.currency)}
          </p>
          {!flow.isFree && (
            <p className="text-sm text-slate-500 mb-4">
              Paid events are completed via Razorpay at checkout.
            </p>
          )}
          <PurchaseButton
            purchaseType={purchaseType}
            itemId={workshop._id}
            enrollment={flow}
            className="w-full max-w-xs sm:max-w-sm px-10 py-3 text-base"
          />
          {!flow.isAuthenticated && (
            <p className="text-xs text-slate-500 mt-3">{flow.loginHint}</p>
          )}
        </div>
      )}
    </>
  );
};

const WorkshopDetailPage = () => {
  const { id } = useParams();
  const [workshop, setWorkshop] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    publicService
      .getWorkshop(id)
      .then((r) => {
        if (r.success) setWorkshop(r.data);
        else setError(r.message || "Not found.");
      })
      .catch(() => setError("Could not load event."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="section-container py-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !workshop) {
    return (
      <div className="section-container py-16 text-center">
        <p className="text-slate-600">{error || "Not found."}</p>
        <Link to="/workshops" className="inline-block mt-4">
          <Button variant="outline">Back</Button>
        </Link>
      </div>
    );
  }

  const isHackathon = workshop.eventType === "hackathon";

  return (
    <div className="section-container py-12 max-w-3xl">
      <Link
        to={isHackathon ? "/events" : "/workshops"}
        className="text-sm text-brand-600 hover:underline"
      >
        ← {isHackathon ? "Events" : "Workshops"}
      </Link>
      <WorkshopDetailContent workshop={workshop} onReload={load} />
    </div>
  );
};

export default WorkshopDetailPage;
