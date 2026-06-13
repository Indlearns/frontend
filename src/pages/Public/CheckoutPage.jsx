import { useEffect, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { publicService } from "../../services/publicService";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useRazorpayPurchase } from "../../hooks/useRazorpayPurchase";
import { getPurchaseType } from "../../utils/purchaseFlow";
import {
  getImageUrl,
  formatPrice,
  formatEnrollmentCloseDate,
  formatRegistrationCloseDate,
  isEnrollmentClosed,
  isRegistrationClosed,
} from "../../utils/media";

const CheckoutContent = ({ purchaseType, item, onComplete }) => {
  const navigate = useNavigate();
  const flow = getPurchaseType(purchaseType);

  const purchase = useRazorpayPurchase({
    purchaseType,
    item,
    preloadScript: true,
    onSuccess: () => {
      onComplete();
      if (purchaseType !== "course") {
        navigate(flow.detailPath(item._id), { replace: true });
      }
    },
  });

  useEffect(() => {
    if (!purchase.authLoading && !purchase.isAuthenticated) {
      navigate("/login", {
        state: { from: flow.checkoutPath(item._id) },
        replace: true,
      });
    }
  }, [purchase.authLoading, purchase.isAuthenticated, item._id, navigate, flow]);

  useEffect(() => {
    if (purchase.hasAccess) {
      navigate(purchaseType === "course" ? "/student" : flow.detailPath(item._id), {
        replace: true,
      });
    }
  }, [purchase.hasAccess, item._id, navigate, flow, purchaseType]);

  if (purchase.isClosed) {
    return (
      <div className="mt-8 p-6 rounded-xl bg-slate-100 dark:bg-slate-800/50 border text-center">
        <p className="font-medium">{purchase.closedMsg}</p>
        <p className="text-sm text-slate-500 mt-1">{purchase.closedHint}</p>
        <Link to={flow.detailPath(item._id)} className="inline-block mt-4">
          <Button variant="outline">Back</Button>
        </Link>
      </div>
    );
  }

  const closeLabel =
    purchaseType === "course"
      ? item.enrollmentCloseDate && !isEnrollmentClosed(item)
        ? `Enrollment closes ${formatEnrollmentCloseDate(item.enrollmentCloseDate)}`
        : null
      : item.registrationCloseDate && !isRegistrationClosed(item)
        ? `Registration closes ${formatRegistrationCloseDate(item.registrationCloseDate)}`
        : null;

  const payDisabled =
    purchase.disabled ||
    (!purchase.isFree && !purchase.configLoading && !purchase.gatewayReady);

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-3 glass-card p-6">
        <h2 className="font-display text-xl font-bold">Order summary</h2>
        <div className="flex gap-4 mt-4">
          {item.thumbnail && purchaseType === "course" ? (
            <img
              src={getImageUrl(item.thumbnail)}
              alt=""
              className="w-24 h-24 object-cover rounded-xl border border-brand-100"
            />
          ) : null}
          <div>
            <p className="font-semibold text-lg">{item.title}</p>
            {purchaseType === "course" && (
              <p className="text-sm text-slate-500 mt-1">
                {item.category}
                {item.duration && ` · ${item.duration}`}
              </p>
            )}
            {(purchaseType === "workshop" || purchaseType === "hackathon") && (
              <p className="text-sm text-slate-500 mt-1 capitalize">
                {item.eventType || purchaseType} ·{" "}
                {new Date(item.date).toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}
              </p>
            )}
            {closeLabel && <p className="text-xs text-amber-700 mt-2">{closeLabel}</p>}
          </div>
        </div>
        {item.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 line-clamp-4">
            {item.description}
          </p>
        )}
      </div>

      <div className="lg:col-span-2 glass-card p-6 h-fit">
        <h2 className="font-display text-xl font-bold">Payment</h2>
        <div className="flex justify-between items-baseline mt-4 pb-4 border-b border-brand-100">
          <span className="text-slate-600">Amount</span>
          <span className="text-2xl font-bold text-brand-600">
            {formatPrice(item.price, item.currency)}
          </span>
        </div>

        {purchase.isFree ? (
          <p className="text-sm text-slate-500 mt-4">This is free. Confirm below to continue.</p>
        ) : (
          <>
            <p className="text-sm text-slate-500 mt-4">
              Secure payment via Razorpay. Click below to open the payment window.
            </p>
            {purchase.configLoading && (
              <p className="text-sm text-slate-500 mt-3">Connecting to Razorpay...</p>
            )}
            {!purchase.configLoading && purchase.gatewayReady && purchase.testMode && (
              <p className="text-sm text-amber-700 mt-3 rounded-lg bg-amber-50 px-3 py-2">
                Test mode — card 4111 1111 1111 1111, any future expiry, any CVV.
              </p>
            )}
            {!purchase.configLoading && !purchase.gatewayReady && (
              <p className="text-sm text-amber-600 mt-3">
                Razorpay is not configured. Add keys to backend .env and restart the server.
              </p>
            )}
          </>
        )}

        {purchase.error && <p className="text-sm text-red-600 mt-3">{purchase.error}</p>}

        <Button
          type="button"
          className="w-full mt-6 py-3"
          disabled={payDisabled}
          onClick={purchase.handlePurchase}
        >
          {purchase.loading || purchase.configLoading
            ? "Please wait..."
            : purchase.isFree
              ? flow.freeLabel
              : flow.payLabel}
        </Button>

        <Link
          to={flow.detailPath(item._id)}
          className="block text-center text-sm text-brand-600 hover:underline mt-4"
        >
          ← Back to details
        </Link>
      </div>
    </div>
  );
};

const TYPE_LABELS = {
  course: "Course checkout",
  workshop: "Workshop checkout",
  hackathon: "Event checkout",
};

const CheckoutPage = () => {
  const { type, id } = useParams();
  const flow = getPurchaseType(type);
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!id || !flow) return;
    setLoading(true);
    setError("");

    const fetcher =
      type === "course"
        ? publicService.getCourse(id)
        : publicService.getWorkshop(id);

    fetcher
      .then((r) => {
        if (r.success) setItem(r.data);
        else setError(r.message || "Item not found.");
      })
      .catch(() => setError("Could not load item. Is the backend running?"))
      .finally(() => setLoading(false));
  }, [id, type, flow]);

  useEffect(() => {
    load();
  }, [load]);

  if (!flow) {
    return (
      <div className="section-container py-16 text-center">
        <p className="text-slate-600">Invalid checkout type.</p>
        <Link to="/" className="inline-block mt-4">
          <Button variant="outline">Go home</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="section-container py-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="section-container py-16 text-center">
        <p className="text-slate-600">{error || "Not found."}</p>
        <Link to={flow.listPath} className="inline-block mt-4">
          <Button variant="outline">Back</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="section-container py-12 max-w-4xl">
      <Link to={flow.detailPath(id)} className="text-sm text-brand-600 hover:underline">
        ← Back to details
      </Link>
      <h1 className="font-display text-3xl font-bold mt-4">{TYPE_LABELS[type]}</h1>
      <p className="text-slate-600 mt-2">Review your order and pay with Razorpay to continue.</p>
      <CheckoutContent purchaseType={type} item={item} onComplete={load} />
    </div>
  );
};

export default CheckoutPage;
