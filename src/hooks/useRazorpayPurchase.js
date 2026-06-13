import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { paymentService } from "../services/paymentService";
import { useAuth } from "../contexts/AuthContext";
import { useStudentEnrollment } from "./useStudentEnrollment";
import { isEnrollmentClosed, isRegistrationClosed, isFreePrice } from "../utils/media";
import { getPurchaseType } from "../utils/purchaseFlow";

export const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const HOOK_CONFIG = {
  course: {
    closed: isEnrollmentClosed,
    closedMsg: "Enrollment has closed.",
    closedHint: "This course is no longer accepting new enrollments.",
    accessMsg: "You are enrolled in this course.",
    loginHint: "Login as a student to enroll.",
    roleError: "Please log in as a student to enroll.",
    createOrder: (id) => paymentService.createCourseOrder(id),
    checkAccess: (id) => paymentService.checkCourseAccess(id),
    verify: (data) => paymentService.verifyCoursePayment(data),
    verifyPayload: (response, itemId) => ({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      courseId: itemId,
    }),
  },
  workshop: {
    closed: isRegistrationClosed,
    closedMsg: "Registration has closed.",
    closedHint: "This event is no longer accepting registrations.",
    accessMsg: "You are registered for this event.",
    loginHint: "Login as a student to register.",
    roleError: "Please log in as a student to register.",
    createOrder: (id) => paymentService.createWorkshopOrder(id),
    checkAccess: (id) => paymentService.checkWorkshopAccess(id),
    verify: (data) => paymentService.verifyWorkshopPayment(data),
    verifyPayload: (response, itemId) => ({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      workshopId: itemId,
    }),
  },
};

/**
 * Unified Razorpay purchase hook for courses, workshops, and hackathons.
 * @param purchaseType - "course" | "workshop" | "hackathon" (hackathon uses workshop API)
 */
export const useRazorpayPurchase = ({
  purchaseType,
  item,
  onSuccess,
  preloadScript = false,
}) => {
  const flow = getPurchaseType(purchaseType);
  const apiType = flow?.apiType;
  const cfg = apiType ? HOOK_CONFIG[apiType] : null;

  if (!flow || !cfg) {
    throw new Error(`Invalid purchase type: ${purchaseType}`);
  }

  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { enrolled: batchEnrolled } = useStudentEnrollment();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [gatewayReady, setGatewayReady] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [testMode, setTestMode] = useState(false);
  const [error, setError] = useState("");
  const payingRef = useRef(false);

  const isFree = isFreePrice(item);
  const isClosed = item ? cfg.closed(item) : false;

  useEffect(() => {
    let cancelled = false;
    setConfigLoading(true);
    paymentService
      .getConfig()
      .then((r) => {
        if (cancelled) return;
        setGatewayReady(Boolean(r.success && r.data.enabled));
        setTestMode(Boolean(r.success && r.data.testMode));
      })
      .catch(() => {
        if (!cancelled) setGatewayReady(false);
      })
      .finally(() => {
        if (!cancelled) setConfigLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (preloadScript && !isFree) loadRazorpayScript();
  }, [preloadScript, isFree]);

  const refreshAccess = useCallback(async () => {
    if (!isAuthenticated || user?.role !== "student" || !item?._id) {
      setHasAccess(false);
      return false;
    }
    try {
      const r = await cfg.checkAccess(item._id);
      if (r.success) {
        const access = Boolean(r.data.hasAccess);
        setHasAccess(access);
        return access;
      }
    } catch {
      // ignore
    }
    return false;
  }, [item?._id, isAuthenticated, user?.role, cfg]);

  const completeSuccess = useCallback(
    async (data) => {
      setHasAccess(true);
      await refreshAccess();
      window.dispatchEvent(new CustomEvent("student-enrollment-changed"));
      onSuccess?.(data);
      if (purchaseType === "course") {
        navigate("/student", { replace: true });
      }
    },
    [refreshAccess, onSuccess, purchaseType, navigate]
  );

  useEffect(() => {
    refreshAccess();
  }, [refreshAccess]);

  const openRazorpayCheckout = useCallback(
    async (orderRes) => {
      const { orderId, amount, currency, keyId, item: orderItem } = orderRes.data;

      if (!orderId || !keyId || !amount) {
        setError("Invalid payment response. Please try again.");
        setLoading(false);
        payingRef.current = false;
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        setError("Could not load Razorpay. Check your internet connection.");
        setLoading(false);
        payingRef.current = false;
        return;
      }

      const options = {
        key: keyId,
        amount,
        currency: currency || "INR",
        name: "INDLearns",
        description: orderItem?.title || item.title,
        order_id: orderId,
        handler: async (response) => {
          try {
            const verify = await cfg.verify(cfg.verifyPayload(response, item._id));
            if (verify.success) {
              await completeSuccess(verify.data);
            } else {
              setError(verify.message || "Payment verification failed");
            }
          } catch (err) {
            setError(err.response?.data?.message || "Payment verification failed");
          } finally {
            setLoading(false);
            payingRef.current = false;
          }
        },
        prefill: { name: user?.name || "", email: user?.email || "" },
        theme: { color: "#2D89EF" },
        modal: {
          ondismiss: () => {
            setLoading(false);
            payingRef.current = false;
          },
        },
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (resp) => {
          setError(resp.error?.description || "Payment failed");
          setLoading(false);
          payingRef.current = false;
        });
        rzp.open();
      } catch (err) {
        setError(err.message || "Could not open Razorpay");
        setLoading(false);
        payingRef.current = false;
      }
    },
    [item, user, cfg, completeSuccess]
  );

  const handlePurchase = useCallback(async () => {
    if (!item?._id || authLoading || payingRef.current) return;

    if (!isAuthenticated) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }
    if (user?.role !== "student") {
      setError(cfg.roleError);
      return;
    }

    setError("");
    setLoading(true);
    payingRef.current = true;

    try {
      const orderRes = await cfg.createOrder(item._id);

      if (orderRes.data?.alreadyPurchased || orderRes.data?.alreadyRegistered) {
        await completeSuccess();
        setLoading(false);
        payingRef.current = false;
        return;
      }

      if (!orderRes.success) {
        setError(orderRes.message || "Could not start payment");
        setLoading(false);
        payingRef.current = false;
        return;
      }

      if (orderRes.data.free) {
        await completeSuccess();
        setLoading(false);
        payingRef.current = false;
        return;
      }

      await openRazorpayCheckout(orderRes);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Payment failed");
      setLoading(false);
      payingRef.current = false;
    }
  }, [
    item,
    isAuthenticated,
    user,
    cfg,
    navigate,
    onSuccess,
    authLoading,
    openRazorpayCheckout,
    completeSuccess,
  ]);

  const disabled = authLoading || loading || configLoading || isClosed || hasAccess;

  return {
    handlePurchase,
    handleEnroll: handlePurchase,
    loading,
    hasAccess,
    isClosed,
    isFree,
    gatewayReady,
    configLoading,
    testMode,
    error,
    disabled,
    batchEnrolled,
    closedMsg: cfg.closedMsg,
    closedHint: cfg.closedHint,
    accessMsg: cfg.accessMsg,
    loginHint: cfg.loginHint,
    isAuthenticated,
    authLoading,
    navigate,
    refreshAccess,
    flow,
  };
};
