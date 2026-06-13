import api from "./api";

export const studentService = {
  getEnrollmentStatus: () => api.get("/student/enrollment-status").then((r) => r.data),
  getMyCourses: () => api.get("/student/my-courses").then((r) => r.data),
  getCourseDashboard: (batchId) =>
    api.get(`/student/my-courses/${batchId}`).then((r) => r.data),
  getProgress: () => api.get("/student/progress").then((r) => r.data),
  getProfile: () => api.get("/student/profile").then((r) => r.data),
  updateProfile: (data) => api.put("/student/profile", data).then((r) => r.data),
  getResumeData: () => api.get("/student/resume").then((r) => r.data),
  getCareerJobs: () => api.get("/student/career/jobs").then((r) => r.data),

  getAssignments: () => api.get("/student/assignments").then((r) => r.data),
  submitAssignment: (id, data) =>
    api.post(`/student/assignments/${id}/submit`, data).then((r) => r.data),
  getTutors: () => api.get("/student/tutors").then((r) => r.data),
  getMeetingRequests: () => api.get("/student/meeting-requests").then((r) => r.data),
  requestMeeting: (data) => api.post("/student/meeting-requests", data).then((r) => r.data),
};
