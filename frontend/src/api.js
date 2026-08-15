import axios from "axios";

// =========================================================
// BACKEND BASE URL
// =========================================================

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});


// =========================================================
// LOGIN USER
// =========================================================

export const loginUser = async (email, password) => {
  try {
    const response = await API.post("/auth/login", {
      email: email,
      password: password,
    });

    return response.data;

  } catch (error) {

    console.error("Login API Error:", error);

    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }

    throw new Error("Login failed");
  }
};


// =========================================================
// REGISTER USER
// =========================================================

export const registerUser = async (
  name,
  email,
  password,
  phone = null
) => {
  try {

    const response = await API.post("/auth/register", {
      name: name,
      email: email,
      password: password,
      phone: phone,
    });

    return response.data;

  } catch (error) {

    console.error("Register API Error:", error);

    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }

    throw new Error("Registration failed");
  }
};


// =========================================================
// CHAT API
// =========================================================

export const chatAPI = async (message) => {

  const response = await API.post("/chat", {
    message: message,
  });

  return response.data;
};


// =========================================================
// ELIGIBILITY API
// =========================================================

export const eligibilityAPI = async (userData) => {

  const response = await API.post(
    "/eligibility",
    userData
  );

  return response.data;
};


// =========================================================
// SCHEMES API
// =========================================================

export const schemesAPI = async () => {

  const response = await API.get("/schemes");

  return response.data;
};


// =========================================================
// SEARCH SCHEMES API
// =========================================================

export const searchSchemesAPI = async (query) => {

  const response = await API.get(
    "/schemes/search",
    {
      params: {
        keyword: query,
      },
    }
  );

  return response.data;
};


// =========================================================
// SAVE CHAT MESSAGE
// =========================================================

export const saveChatMessage = async (
  userId,
  message,
  response
) => {

  try {

    const result = await API.post(
      "/chat-history/save",
      {
        user_id: userId,
        message: message,
        response: response,
      }
    );

    return result.data;

  } catch (error) {

    console.error(
      "Save Chat Error:",
      error
    );

    if (error.response?.data?.detail) {
      throw new Error(
        error.response.data.detail
      );
    }

    throw new Error(
      "Failed to save chat"
    );
  }
};


// =========================================================
// GET CHAT HISTORY
// =========================================================

export const getChatHistory = async (userId) => {

  try {

    const response = await API.get(
      `/chat-history/${userId}`
    );

    return response.data;

  } catch (error) {

    console.error(
      "Get Chat History Error:",
      error
    );

    if (error.response?.data?.detail) {
      throw new Error(
        error.response.data.detail
      );
    }

    throw new Error(
      "Failed to fetch chat history"
    );
  }
};


// =========================================================
// DEFAULT EXPORT
// =========================================================

export default API;