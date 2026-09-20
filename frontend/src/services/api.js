import axios from "axios";

// ======================================================
// BACKEND BASE URL
// ======================================================

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://intelligov-ai.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// ======================================================
// AUTH APIs
// ======================================================

// REGISTER
export const registerUser = async (name, email, password) => {
  const response = await API.post("/auth/register", {
    name,
    email,
    password,
  });

  return response.data;
};

// LOGIN
export const loginUser = async (email, password) => {
  const response = await API.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};

// ======================================================
// CHAT API
// ======================================================

export const chatAPI = async (message) => {
  const response = await API.post("/chat", {
    message,
  });

  return response.data;
};

// ======================================================
// ELIGIBILITY API
// ======================================================

export const eligibilityAPI = async (userData) => {
  const response = await API.post("/eligibility", userData);

  return response.data;
};

// ======================================================
// SCHEMES API
// ======================================================

export const schemesAPI = async () => {
  const response = await API.get("/schemes");

  return response.data;
};

// ======================================================
// SEARCH SCHEMES API
// ======================================================

export const searchSchemesAPI = async (query) => {
  const response = await API.get("/schemes/search", {
    params: {
      keyword: query,
    },
  });

  return response.data;
};

// ======================================================
// CHAT HISTORY APIs
// ======================================================

export const saveChatHistoryAPI = async (userId, message, response) => {
  const result = await API.post("/chat-history/save", {
    user_id: Number(userId),
    message,
    response,
  });

  return result.data;
};

export const getChatHistoryAPI = async (userId) => {
  const result = await API.get(`/chat-history/${userId}`);

  return result.data;
};

// ======================================================
// NOTIFICATION APIs
// ======================================================

export const createNotificationAPI = async (
  userId,
  title,
  message,
  type = "general"
) => {
  const response = await API.post("/notifications", {
    user_id: Number(userId),
    title,
    message,
    type,
  });

  return response.data;
};

export const getNotificationsAPI = async (userId) => {
  const response = await API.get(`/notifications/${userId}`);

  return response.data;
};

export const markNotificationReadAPI = async (notificationId) => {
  const response = await API.patch(
    `/notifications/${notificationId}/read`
  );

  return response.data;
};

export const markAllNotificationsReadAPI = async (userId) => {
  const response = await API.patch(
    `/notifications/user/${userId}/read-all`
  );

  return response.data;
};

export const clearNotificationsAPI = async (userId) => {
  const response = await API.delete(
    `/notifications/user/${userId}`
  );

  return response.data;
};

// ======================================================
// DEFAULT EXPORT
// ======================================================

export default API;