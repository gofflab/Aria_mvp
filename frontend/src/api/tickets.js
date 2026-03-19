import axios from "axios";

// In dev the Vite proxy forwards /api → http://localhost:8000/api
// In production set VITE_API_URL to your backend URL
const BASE = import.meta.env.VITE_API_URL ?? "/api";

const api = axios.create({ baseURL: BASE });

export const getTickets = (params) => api.get("/tickets/", { params });
export const getTicket = (id) => api.get(`/tickets/${id}`);
export const createTicket = (data) => api.post("/tickets/", data);
export const updateTicket = (id, data) => api.patch(`/tickets/${id}`, data);
export const deleteTicket = (id) => api.delete(`/tickets/${id}`);

export const addComment = (ticketId, data) =>
  api.post(`/tickets/${ticketId}/comments`, data);
export const deleteComment = (ticketId, commentId) =>
  api.delete(`/tickets/${ticketId}/comments/${commentId}`);

export const getHistory = () => api.get("/tickets/history/resolved");
