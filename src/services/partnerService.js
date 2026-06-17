import api from "./api";

export const partnerService = {
  getDashboard: () => api.get("/partner/dashboard").then((r) => r.data),
  getJobs: () => api.get("/partner/jobs").then((r) => r.data),
  createJob: (data) => api.post("/partner/jobs", data).then((r) => r.data),
  updateJob: (id, data) => api.put(`/partner/jobs/${id}`, data).then((r) => r.data),
  deleteJob: (id) => api.delete(`/partner/jobs/${id}`).then((r) => r.data),
  getApplications: (jobId) =>
    api.get("/partner/applications", { params: jobId ? { jobId } : {} }).then((r) => r.data),
  getApplication: (id) => api.get(`/partner/applications/${id}`).then((r) => r.data),
  updateApplicationStatus: (id, status) =>
    api.patch(`/partner/applications/${id}/status`, { status }).then((r) => r.data),
};
