import axios from "axios";

// ===============================
// BACKEND BASE URL
// ===============================
const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// ===============================
// CHAT API
// ===============================
export const chatAPI = async (message) => {
  const response = await API.post("/chat", {
    message: message,
  });

  return response.data;
};

// ===============================
// ELIGIBILITY API
// ===============================
export const eligibilityAPI = async (userData) => {
  const response = await API.post("/eligibility", userData);

  return response.data;
};

// ===============================
// SCHEMES API
// ===============================
export const schemesAPI = async () => {
  const response = await API.get("/schemes");

  return response.data;
};

// ===============================
// SEARCH SCHEMES API
// ===============================
export const searchSchemesAPI = async (query) => {
  const response = await API.get("/schemes/search", {
    params: {
      keyword: query,
    },
  });

  return response.data;
};

// ===============================
// DEFAULT EXPORT
// ===============================
export default API;