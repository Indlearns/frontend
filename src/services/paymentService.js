import api from "./api";

export const paymentService = {
  getConfig: () => api.get("/payments/config").then((r) => r.data),

  getZohoSetup: () => api.get("/payments/zoho/setup").then((r) => r.data),

  exchangeZohoCode: (code) =>
    api.post("/payments/zoho/exchange-code", { code }).then((r) => r.data),

  createCourseOrder: (courseId, { referralCode } = {}) =>
    api
      .post(`/payments/course/${courseId}/create-order`, { referralCode })
      .then((r) => r.data),

  validateCourseReferral: (courseId, referralCode) =>
    api
      .post(`/payments/course/${courseId}/validate-referral`, { referralCode })
      .then((r) => r.data),

  createWorkshopOrder: (workshopId, { referralCode } = {}) =>
    api
      .post(`/payments/workshop/${workshopId}/create-order`, { referralCode })
      .then((r) => r.data),

  validateReferral: (purchaseType, itemId, referralCode) => {
    const path =
      purchaseType === "course"
        ? `/payments/course/${itemId}/validate-referral`
        : `/payments/workshop/${itemId}/validate-referral`;
    return api.post(path, { referralCode }).then((r) => r.data);
  },

  verifyCoursePayment: (data) => api.post("/payments/verify", data).then((r) => r.data),

  verifyWorkshopPayment: (data) =>
    api.post("/payments/verify/workshop", data).then((r) => r.data),

  checkCourseAccess: (courseId) =>
    api.get(`/payments/course/${courseId}/access`).then((r) => r.data),

  checkWorkshopAccess: (workshopId) =>
    api.get(`/payments/workshop/${workshopId}/access`).then((r) => r.data),

  /** @deprecated use checkCourseAccess */
  checkAccess: (courseId) =>
    api.get(`/payments/course/${courseId}/access`).then((r) => r.data),

  getMyPurchases: () => api.get("/payments/my-purchases").then((r) => r.data),
};
