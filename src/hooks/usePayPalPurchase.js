import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { paymentService } from "../services/paymentService";
import { useAuth } from "../contexts/AuthContext";
import { useStudentEnrollment } from "./useStudentEnrollment";
import { isEnrollmentClosed, isRegistrationClosed, isFreePrice } from "../utils/media";
import { getPurchaseType } from "../utils/purchaseFlow";

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
    verifyPayload: (orderId, itemId) => ({
      orderId,
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
    verifyPayload: (orderId, itemId) => ({
      orderId,
      workshopId: itemId,
    }),
  },
};

/**
 * Unified PayPal purchase hook for courses, workshops, and hackathons.
 * @param purchaseType - "course" | "workshop" | "hackathon" (hackathon uses workshop API)
 */
export const usePayPalPurchase = ({
  purchaseType,
  item,
  onSuccess,
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
  const [clientId, setClientId] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [error, setError] = useState("");
  const payingRef = useRef(false);

  const isFree = isFreePrice(item);
  const isClosed = item ? cfg.closed(item) : false;
  const listCurrency = item?.currency || "INR";

  useEffect(() => {
    let cancelled = false;
    setConfigLoading(true);
    paymentService
      .getConfig()
      .then((r) => {
        if (cancelled) return;
        setGatewayReady(Boolean(r.success && r.data.enabled));
        setTestMode(Boolean(r.success && r.data.testMode));
        setClientId(r.success ? r.data.clientId || "" : "");
        setCurrency(r.success ? r.data.currency || "USD" : "USD");
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

  const createPayPalOrder = useCallback(async () => {
    if (!item?._id) {
      throw new Error("Item not found.");
    }

    setError("");
    setLoading(true);
    payingRef.current = true;

    try {
      const orderRes = await cfg.createOrder(item._id);

      if (orderRes.data?.alreadyPurchased || orderRes.data?.alreadyRegistered) {
        await completeSuccess();
        return null;
      }

      if (!orderRes.success) {
        throw new Error(orderRes.message || "Could not start payment");
      }

      if (orderRes.data?.free) {
        await completeSuccess();
        return null;
      }

      if (!orderRes.data?.orderId) {
        throw new Error("Invalid payment response. Please try again.");
      }

      return orderRes.data.orderId;
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Could not start payment");
      setLoading(false);
      payingRef.current = false;
      throw err;
    }
  }, [item?._id, cfg, completeSuccess]);

  const handlePayPalApprove = useCallback(
    async (orderId) => {
      if (!orderId || payingRef.current) return;

      setError("");
      setLoading(true);
      payingRef.current = true;

      try {
        const verify = await cfg.verify(cfg.verifyPayload(orderId, item._id));
        if (verify.success) {
          await completeSuccess(verify.data);
        } else {
          setError(verify.message || "Payment verification failed");
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Payment verification failed");
      } finally {
        setLoading(false);
        payingRef.current = false;
      }
    },
    [cfg, item?._id, completeSuccess]
  );

  const handlePayPalError = useCallback((err) => {
    setError(err?.message || "PayPal payment failed. Please try again.");
    setLoading(false);
    payingRef.current = false;
  }, []);

  const handlePayPalCancel = useCallback(() => {
    setLoading(false);
    payingRef.current = false;
  }, []);

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
        return;
      }

      if (!orderRes.success) {
        setError(orderRes.message || "Could not start payment");
        return;
      }

      if (orderRes.data?.free) {
        await completeSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Payment failed");
    } finally {
      setLoading(false);
      payingRef.current = false;
    }
  }, [item, isAuthenticated, user, cfg, navigate, authLoading, completeSuccess]);

  const disabled = authLoading || loading || configLoading || isClosed || hasAccess;

  return {
    handlePayPalError,
    handlePayPalCancel,
    handlePurchase,
    handleEnroll: handlePurchase,
    createPayPalOrder,
    handlePayPalApprove,
    loading,
    hasAccess,
    isClosed,
    isFree,
    gatewayReady,
    configLoading,
    testMode,
    clientId,
    currency,
    listCurrency,
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
