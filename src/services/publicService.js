import api from "./api";

export const publicService = {
  getHome: () => api.get("/public/home").then((r) => r.data),
  getCourses: (params) => api.get("/public/courses", { params }).then((r) => r.data),
  getCourse: (id) => api.get(`/public/courses/${id}`).then((r) => r.data),
  getWorkshops: (eventType) =>
    api
      .get("/public/workshops", { params: eventType ? { eventType } : {} })
      .then((r) => r.data),
  getWorkshop: (id) => api.get(`/public/workshops/${id}`).then((r) => r.data),
  getCompanies: () => api.get("/public/companies").then((r) => r.data),
};
