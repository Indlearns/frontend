import api from "./api";

export const superadminService = {
  createAdmin: (data) => api.post("/superadmin/admins", data).then((r) => r.data),
  getAdmins: () => api.get("/superadmin/admins").then((r) => r.data),
  createTutor: (data) => api.post("/superadmin/tutors", data).then((r) => r.data),
  getTutors: () => api.get("/superadmin/tutors").then((r) => r.data),
  resetPassword: (role, id) =>
    api.post(`/superadmin/${role}/${id}/reset-password`).then((r) => r.data),
  toggleActive: (role, id) =>
    api.patch(`/superadmin/${role}/${id}/toggle-active`).then((r) => r.data),
};
