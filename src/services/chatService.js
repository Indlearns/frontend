import api from "./api";

export const chatService = {
  getConversations: () => api.get("/chat/conversations").then((r) => r.data),
  getContacts: () => api.get("/chat/contacts").then((r) => r.data),
  getStaffDirectory: () => api.get("/chat/staff/directory").then((r) => r.data),
  openBatchConversation: (batchId) =>
    api.post(`/chat/conversations/batch/${batchId}`).then((r) => r.data),
  startGroupChat: (participantIds, title) =>
    api
      .post("/chat/conversations/group", { participantIds, title })
      .then((r) => r.data),
  startDoubtChat: (targetUserId) =>
    api.post("/chat/conversations/doubt", { targetUserId }).then((r) => r.data),
  joinConversation: (id) => api.post(`/chat/conversations/${id}/join`).then((r) => r.data),
  getMessages: (id) => api.get(`/chat/conversations/${id}/messages`).then((r) => r.data),
  sendMessage: (id, content) =>
    api.post(`/chat/conversations/${id}/messages`, { content }).then((r) => r.data),
  getVideoConfig: (id) => api.get(`/chat/conversations/${id}/video`).then((r) => r.data),
  getLiveClasses: () => api.get("/chat/live-classes").then((r) => r.data),
  joinLiveClass: (scheduleId) =>
    api.post(`/chat/live-classes/${scheduleId}/join`).then((r) => r.data),
  getLiveClassVideo: (scheduleId) =>
    api.post(`/chat/live-classes/${scheduleId}/join`).then((r) => r.data),
};
