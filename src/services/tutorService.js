import api from "./api";

export const tutorService = {
  getDashboard: () => api.get("/tutor/dashboard").then((r) => r.data),
  getBatches: () => api.get("/tutor/batches").then((r) => r.data),
  getClasses: (upcoming) =>
    api.get("/tutor/classes", { params: upcoming ? { upcoming: true } : {} }).then((r) => r.data),
  joinClass: (id) => api.get(`/tutor/classes/${id}/join`).then((r) => r.data),
  updateClassStatus: (id, status) =>
    api.patch(`/tutor/classes/${id}/status`, { status }).then((r) => r.data),

  getAssignments: (batchId) =>
    api.get("/tutor/assignments", { params: batchId ? { batch: batchId } : {} }).then((r) => r.data),
  createAssignment: (data) => api.post("/tutor/assignments", data).then((r) => r.data),
  updateAssignment: (id, data) => api.put(`/tutor/assignments/${id}`, data).then((r) => r.data),
  deleteAssignment: (id) => api.delete(`/tutor/assignments/${id}`).then((r) => r.data),
  getSubmissions: (assignmentId) =>
    api.get(`/tutor/assignments/${assignmentId}/submissions`).then((r) => r.data),
  gradeSubmission: (assignmentId, submissionId, data) =>
    api
      .put(`/tutor/assignments/${assignmentId}/submissions/${submissionId}/grade`, data)
      .then((r) => r.data),

  getMeetingRequests: (status) =>
    api
      .get("/tutor/meeting-requests", { params: status ? { status } : {} })
      .then((r) => r.data),
  respondMeetingRequest: (id, action, responseNote) =>
    api.patch(`/tutor/meeting-requests/${id}`, { action, responseNote }).then((r) => r.data),
};
