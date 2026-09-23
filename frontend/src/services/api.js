import axios from "axios";

// ======================================================
// BACKEND BASE URL
// Reads VITE_API_URL from .env.local (local dev) or
// .env.production (build/Render).
// Falls back to Render so existing production still works.
// ======================================================
const BASE_URL =
  import.meta.env.VITE_API_URL || "https://intelligov-ai.onrender.com";

const API = axios.create({
  baseURL: BASE_URL,
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
// PROFILE APIs
// ======================================================

export const getProfileAPI = async (userId) => {
  const response = await API.get(`/profile/${userId}`);
  return response.data;
};

export const updateProfileAPI = async (profileData) => {
  const response = await API.put("/profile/update", profileData);
  return response.data;
};

// ======================================================
// CHAT API
// ======================================================

export const chatAPI = async (message, profile = null, language = "en") => {
  const payload = { message, language };
  if (profile) {
    payload.profile = { ...profile, language };
  }
  const response = await API.post("/chat", payload);
  return response.data;
};

// ======================================================
// ELIGIBILITY API
// ======================================================

export const eligibilityAPI = async (userData) => {
  const response = await API.post("/eligibility", userData);

  return response.data;
};

// Fetch eligibility results for a user using their saved DB profile.
// No need to re-send profile fields — the backend reads them directly.
export const eligibilityByProfileAPI = async (userId) => {
  const response = await API.get(`/eligibility/by-profile/${userId}`);
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
// SAVED SCHEMES APIs  (PostgreSQL-persisted)
// ======================================================

export const saveSchemeAPI = async (userId, scheme) => {
  const response = await API.post("/saved-schemes/save", {
    user_id: Number(userId),
    scheme_id: scheme.id || null,
    scheme_name: scheme.name,
    scheme_category: scheme.category || null,
    scheme_description: scheme.description || null,
    scheme_benefits: scheme.benefits || null,
    scheme_eligibility: scheme.eligibility || null,
    scheme_documents: scheme.documents || [],
    scheme_deadline: scheme.deadline || null,
    scheme_official_url: scheme.official_url || null,
  });
  return response.data;
};

export const getSavedSchemesAPI = async (userId) => {
  const response = await API.get(`/saved-schemes/${userId}`);
  return response.data;
};

export const removeSavedSchemeAPI = async (savedId) => {
  const response = await API.delete(`/saved-schemes/remove/${savedId}`);
  return response.data;
};

export const checkSavedSchemeAPI = async (userId, schemeName) => {
  const response = await API.get(
    `/saved-schemes/check/${userId}/${encodeURIComponent(schemeName)}`
  );
  return response.data;
};

// ======================================================
// APPLICATION AGENT APIs
// ======================================================

/**
 * Ask the Application Agent to build an ApplicationPlan
 * for the given scheme and user.
 * Returns { success, user_name, plan }.
 */
export const prepareApplicationAPI = async (userId, scheme) => {
  const response = await API.post("/application/prepare", {
    user_id: Number(userId),
    scheme: {
      name:         scheme.name || scheme.scheme_name || "",
      category:     scheme.category || null,
      description:  scheme.description || null,
      benefits:     scheme.benefits || null,
      eligibility:  scheme.eligibility || null,
      documents:    Array.isArray(scheme.documents) ? scheme.documents : [],
      deadline:     scheme.deadline || null,
      official_url: scheme.official_url || null,
    },
  });
  return response.data;
};

/**
 * Submit a demo application form.
 * Issues a local DEMO- reference ID.
 * Does NOT submit to any real government portal.
 */
export const submitDemoApplicationAPI = async (userId, schemeName, formValues) => {
  const response = await API.post("/application/submit-demo", {
    user_id:     Number(userId),
    scheme_name: schemeName,
    form_values: formValues,
  });
  return response.data;
};

/**
 * Get honest application status for a scheme.
 * Always returns "not tracked" — no fake states.
 */
export const getApplicationStatusAPI = async (schemeName) => {
  const response = await API.get(
    `/application/status/${encodeURIComponent(schemeName)}`
  );
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
