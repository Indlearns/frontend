import { useEffect, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { publicService } from "../../services/publicService";
import { studentService } from "../../services/studentService";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { paymentService } from "../../services/paymentService";
import { usePurchase } from "../../hooks/usePurchase";
import { useAuth } from "../../contexts/AuthContext";
import {
  getImageUrl,
  formatPrice,
  formatEnrollmentCloseDate,
  formatRegistrationCloseDate,
  isEnrollmentClosed,
  isRegistrationClosed,
} from "../../utils/media";
import { getPurchaseType } from "../../utils/purchaseFlow";

import { hasValidPaymentPhone, normalizeIndianPhone } from "../../utils/zohoPaymentFormat";

const CheckoutContent = ({ purchaseType, item, onComplete }) => {
  const navigate = useNavigate();
  const flow = getPurchaseType(purchaseType);
  const { user, updateUser } = useAuth();
  const isStudent = user?.role === "student";
  const [phoneInput, setPhoneInput] = useState(user?.phone || "");
  const [savingPhone, setSavingPhone] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [referralInput, setReferralInput] = useState("");
  const [appliedReferral, setAppliedReferral] = useState(null);
  const [referralError, setReferralError] = useState("");
  const [validatingReferral, setValidatingReferral] = useState(false);

  const purchase = usePurchase({
    purchaseType,
    item,
    referralCode: appliedReferral?.referralCode,
    onSuccess: () => {
      onComplete();
      if (purchaseType !== "course") {
        navigate(flow.detailPath(item._id), { replace: true });
      }
    },
  });

  const displayAmount = appliedReferral?.finalAmount ?? item.price;
  const showReferralPricing = !purchase.isFree && appliedReferral?.discountAmount > 0;

  const handleApplyReferral = async () => {
    setReferralError("");
    const code = referralInput.trim();
    if (!code) {
      setReferralError("Enter a referral code.");
      return;
    }
    setValidatingReferral(true);
    try {
      const r = await paymentService.validateReferral(purchaseType, item._id, code);
      if (r.success) {
        setAppliedReferral(r.data);
      } else {
        setAppliedReferral(null);
        setReferralError(r.message || "Invalid referral code.");
      }
    } catch (err) {
      setAppliedReferral(null);
      setReferralError(err.response?.data?.message || "Invalid referral code.");
    } finally {
      setValidatingReferral(false);
    }
  };

  const handleClearReferral = () => {
    setReferralInput("");
    setAppliedReferral(null);
    setReferralError("");
  };

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

  const fullyDiscounted = appliedReferral && appliedReferral.finalAmount <= 0;
  const needsPayment = !purchase.isFree && !fullyDiscounted;

  const payDisabled =
    purchase.disabled ||
    (needsPayment && !purchase.configLoading && !purchase.gatewayReady);

  const missingPhone =
    needsPayment && isStudent && purchase.isAuthenticated && !hasValidPaymentPhone(user?.phone);
  const missingEmail = needsPayment && isStudent && purchase.isAuthenticated && !user?.email?.trim();
  const phoneReady = !missingPhone || Boolean(normalizeIndianPhone(phoneInput));

  const handlePay = async () => {
    setCheckoutError("");
    if (missingPhone && normalizeIndianPhone(phoneInput)) {
      setSavingPhone(true);
      try {
        const r = await studentService.updateProfile({ phone: phoneInput.trim() });
        if (!r.success) {
          setCheckoutError(r.message || "Could not save phone number.");
          return;
        }
        updateUser({ phone: r.data?.user?.phone || phoneInput.trim() });
      } catch (err) {
        setCheckoutError(err.response?.data?.message || "Could not save phone number.");
        return;
      } finally {
        setSavingPhone(false);
      }
    }
    purchase.handlePurchase();
  };

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
          <span className="text-slate-600">
            {showReferralPricing ? "Original price" : "Amount"}
          </span>
          <span
            className={`text-2xl font-bold text-brand-600 ${showReferralPricing ? "line-through text-slate-400 text-lg" : ""}`}
          >
            {formatPrice(item.price, item.currency)}
          </span>
        </div>

        {showReferralPricing && (
          <>
            <div className="flex justify-between items-baseline mt-3 text-sm">
              <span className="text-green-700">
                Referral ({appliedReferral.referralCode})
              </span>
              <span className="font-medium text-green-700">
                −{formatPrice(appliedReferral.discountAmount, item.currency)}
              </span>
            </div>
            <div className="flex justify-between items-baseline mt-3 pt-3 border-t border-brand-100">
              <span className="text-slate-600 font-medium">You pay</span>
              <span className="text-2xl font-bold text-brand-600">
                {formatPrice(displayAmount, item.currency)}
              </span>
            </div>
          </>
        )}

        {!purchase.isFree && (
          <div className="mt-4 pt-4 border-t border-brand-100">
            <label className="block text-sm font-medium mb-1">Referral code (optional)</label>
            <div className="flex gap-2">
              <input
                className="input-field flex-1 uppercase"
                placeholder="Enter code"
                value={referralInput}
                onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                disabled={Boolean(appliedReferral)}
              />
              {appliedReferral ? (
                <Button type="button" variant="outline" onClick={handleClearReferral}>
                  Remove
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleApplyReferral}
                  disabled={validatingReferral}
                >
                  {validatingReferral ? "..." : "Apply"}
                </Button>
              )}
            </div>
            {referralError && <p className="text-sm text-red-600 mt-2">{referralError}</p>}
            {appliedReferral?.finalAmount <= 0 && (
              <p className="text-sm text-green-700 mt-2">
                Full discount applied — no payment required.
              </p>
            )}
          </div>
        )}

        {purchase.isFree || (appliedReferral && appliedReferral.finalAmount <= 0) ? (
          <p className="text-sm text-slate-500 mt-4">
            {appliedReferral?.finalAmount <= 0
              ? "Your referral code covers the full price. Confirm below to enroll."
              : "This is free. Confirm below to continue."}
          </p>
        ) : (
          <>
            <p className="text-sm text-slate-500 mt-4">
              Secure payment via Zoho Payments (UPI, card, net banking). You will be redirected to
              complete payment.
            </p>
            {purchase.configLoading && (
              <p className="text-sm text-slate-500 mt-3">Connecting to payment gateway...</p>
            )}
            {!purchase.configLoading && !purchase.gatewayReady && (
              <p className="text-sm text-amber-600 mt-3">
                {purchase.needsRefreshToken
                  ? "Zoho OAuth setup is incomplete. Super admin must complete one-time authorization and add the refresh token to the backend."
                  : "Zoho Payments is not configured. Add credentials to backend .env and restart the server."}
              </p>
            )}
          </>
        )}

        {(purchase.error || checkoutError) && (
          <p className="text-sm text-red-600 mt-3">{purchase.error || checkoutError}</p>
        )}

        {missingPhone && (
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Mobile number (required for Zoho)</label>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="10-digit mobile number"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="input-field"
            />
            <p className="text-xs text-slate-500 mt-1">Zoho Payments requires a valid Indian mobile number.</p>
          </div>
        )}

        {missingEmail && (
          <p className="text-sm text-amber-700 mt-3 rounded-lg bg-amber-50 px-3 py-2">
            Your account is missing an email address. Contact support before paying.
          </p>
        )}

        {!isStudent && purchase.isAuthenticated && (
          <p className="text-sm text-amber-700 mt-3 rounded-lg bg-amber-50 px-3 py-2">
            You are logged in as <span className="font-medium">{user?.role}</span>. Please use a
            student account to complete payment.
          </p>
        )}

        <Button
          type="button"
          className="w-full mt-6 py-3"
          disabled={
            payDisabled ||
            (!isStudent && purchase.isAuthenticated) ||
            missingEmail ||
            !phoneReady ||
            savingPhone
          }
          onClick={handlePay}
        >
          {purchase.loading || purchase.configLoading || savingPhone
            ? "Please wait..."
            : purchase.isFree || (appliedReferral && appliedReferral.finalAmount <= 0)
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
      type === "course" ? publicService.getCourse(id) : publicService.getWorkshop(id);

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
      <p className="text-slate-600 mt-2">Review your order and pay with Zoho Payments to continue.</p>
      <CheckoutContent purchaseType={type} item={item} onComplete={load} />
    </div>
  );
};

export default CheckoutPage;
