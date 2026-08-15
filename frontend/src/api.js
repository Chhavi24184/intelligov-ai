const API_BASE_URL = "http://127.0.0.1:8000";

// =========================================================
// Register User
// =========================================================

export const registerUser = async (name, email, password) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Registration failed");
    }

    return data;
  } catch (error) {
    console.error("Register error:", error);
    throw error;
  }
};


// =========================================================
// Login User
// =========================================================

export const loginUser = async (email, password) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Login failed");
    }

    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};


// =========================================================
// Save Chat Message
// =========================================================

export const saveChatMessage = async (userId, message, response) => {
  try {
    const res = await fetch(`${API_BASE_URL}/chat-history/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        message: message,
        response: response,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Failed to save chat");
    }

    return data;
  } catch (error) {
    console.error("Save chat error:", error);
    throw error;
  }
};


// =========================================================
// Get Chat History
// =========================================================

export const getChatHistory = async (userId) => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/chat-history/${userId}`
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Failed to fetch chat history");
    }

    return data;
  } catch (error) {
    console.error("Get chat history error:", error);
    throw error;
  }
};