import api from "./api";

export const adminService = {
  getDashboard: () => api.get("/admin/dashboard").then((r) => r.data),

  createTutor: (data) => api.post("/admin/tutors", data).then((r) => r.data),
  getTutors: () => api.get("/admin/tutors").then((r) => r.data),
  getStudents: () => api.get("/admin/students").then((r) => r.data),
  getStudent: (id) => api.get(`/admin/students/${id}`).then((r) => r.data),
  getEnrollmentsByCourse: () =>
    api.get("/admin/students/enrollments/by-course").then((r) => r.data),
  exportAllEnrollments: (courseId) =>
    api.get("/admin/students/enrollments/export", {
      params: courseId ? { courseId } : {},
      responseType: "blob",
    }),

  createCourse: (formData) =>
    api
      .post("/admin/courses", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),
  getCourses: () => api.get("/admin/courses").then((r) => r.data),
  updateCourse: (id, formData) =>
    api
      .put(`/admin/courses/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`).then((r) => r.data),
  getCourseEnrollments: (id) =>
    api.get(`/admin/courses/${id}/enrollments`).then((r) => r.data),
  exportCourseEnrollments: (id) =>
    api.get(`/admin/courses/${id}/enrollments/export`, { responseType: "blob" }),

  createWorkshop: (data) => api.post("/admin/workshops", data).then((r) => r.data),
  getWorkshops: () => api.get("/admin/workshops").then((r) => r.data),
  updateWorkshop: (id, data) => api.put(`/admin/workshops/${id}`, data).then((r) => r.data),
  deleteWorkshop: (id) => api.delete(`/admin/workshops/${id}`).then((r) => r.data),

  createCompany: (data) => api.post("/admin/companies", data).then((r) => r.data),
  createPartner: (data) => api.post("/admin/companies", data).then((r) => r.data),
  getCompanies: () => api.get("/admin/companies").then((r) => r.data),
  updateCompany: (id, data) => api.put(`/admin/companies/${id}`, data).then((r) => r.data),
  deleteCompany: (id) => api.delete(`/admin/companies/${id}`).then((r) => r.data),

  createBatch: (data) => api.post("/admin/batches", data).then((r) => r.data),
  getBatches: () => api.get("/admin/batches").then((r) => r.data),
  updateBatch: (id, data) => api.put(`/admin/batches/${id}`, data).then((r) => r.data),
  deleteBatch: (id) => api.delete(`/admin/batches/${id}`).then((r) => r.data),

  createSchedule: (data) => api.post("/admin/schedules", data).then((r) => r.data),
  getSchedules: (batchId) =>
    api.get("/admin/schedules", { params: batchId ? { batch: batchId } : {} }).then((r) => r.data),
  updateSchedule: (id, data) => api.put(`/admin/schedules/${id}`, data).then((r) => r.data),
  deleteSchedule: (id) => api.delete(`/admin/schedules/${id}`).then((r) => r.data),
  deleteScheduleGroup: (groupId) =>
    api.delete(`/admin/schedules/group/${groupId}`).then((r) => r.data),

  getConversations: () => api.get("/admin/conversations").then((r) => r.data),
  joinConversation: (id) => api.post(`/admin/conversations/${id}/join`).then((r) => r.data),
  getMessages: (id) => api.get(`/admin/conversations/${id}/messages`).then((r) => r.data),
  sendMessage: (id, content) =>
    api.post(`/admin/conversations/${id}/messages`, { content }).then((r) => r.data),

  createReferralCode: (data) => api.post("/admin/referral-codes", data).then((r) => r.data),
  getReferralCodes: () => api.get("/admin/referral-codes").then((r) => r.data),
  getReferralCodeUsages: (id) =>
    api.get(`/admin/referral-codes/${id}/usages`).then((r) => r.data),
  getAllReferralUsages: () => api.get("/admin/referral-codes/usages").then((r) => r.data),
  updateReferralCode: (id, data) => api.put(`/admin/referral-codes/${id}`, data).then((r) => r.data),
  deleteReferralCode: (id) => api.delete(`/admin/referral-codes/${id}`).then((r) => r.data),
};
