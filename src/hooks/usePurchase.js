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
  },
};

/**
 * Unified Zoho Payments purchase hook for courses, workshops, and hackathons.
 */
export const usePurchase = ({ purchaseType, item, onSuccess }) => {
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
  const [needsRefreshToken, setNeedsRefreshToken] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
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
        setNeedsRefreshToken(Boolean(r.success && r.data.needsRefreshToken));
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
        return;
      }

      if (!orderRes.data?.checkoutUrl) {
        setError("Invalid payment response. Please try again.");
        return;
      }

      window.location.href = orderRes.data.checkoutUrl;
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Payment failed");
      payingRef.current = false;
      setLoading(false);
    }
  }, [item, isAuthenticated, user, cfg, navigate, authLoading, completeSuccess]);

  const disabled = authLoading || loading || configLoading || isClosed || hasAccess;

  return {
    handlePurchase,
    handleEnroll: handlePurchase,
    loading,
    hasAccess,
    isClosed,
    isFree,
    gatewayReady,
    needsRefreshToken,
    configLoading,
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
    completeSuccess,
    flow,
    cfg,
  };
};