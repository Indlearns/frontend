import api from "./api";

export const affiliateService = {
  getProgramInfo: () => api.get("/affiliate/program-info").then((r) => r.data),

  register: (data) => api.post("/affiliate/register", data).then((r) => r.data),

  login: (data) => api.post("/affiliate/login", data).then((r) => r.data),

  getMe: () => api.get("/affiliate/me").then((r) => r.data),

  getProfile: () => api.get("/affiliate/profile").then((r) => r.data),

  updateProfile: (data) => api.put("/affiliate/profile", data).then((r) => r.data),

  getDashboard: () => api.get("/affiliate/dashboard").then((r) => r.data),

  getProducts: () => api.get("/affiliate/products").then((r) => r.data),

  getSales: () => api.get("/affiliate/sales").then((r) => r.data),

  getWithdrawals: () => api.get("/affiliate/withdrawals").then((r) => r.data),

  requestWithdrawal: () => api.post("/affiliate/withdrawals").then((r) => r.data),
};
