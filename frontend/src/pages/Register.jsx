import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    // Check empty fields
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    // Check password
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // Send registration data through api.js
      const data = await registerUser(
        name.trim(),
        email.trim(),
        password
      );

      console.log("Register response:", data);

      alert("Account created successfully!");

      // Go to login page
      navigate("/login");

    } catch (error) {
      console.error("Registration error:", error);

      if (error.response) {
        alert(
          error.response.data?.detail ||
          "Registration failed"
        );
      } else {
        alert("Cannot connect to backend");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f7fb",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "400px",
          maxWidth: "100%",
          padding: "35px",
          background: "#ffffff",
          borderRadius: "15px",
          boxShadow: "0 5px 25px rgba(0,0,0,0.1)",
          boxSizing: "border-box",
        }}
      >
        {/* Heading */}
        <h2
          style={{
            textAlign: "center",
            marginBottom: "10px",
            color: "#111827",
            fontSize: "28px",
          }}
        >
          Create Account 👤
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "25px",
          }}
        >
          Join IntelliGov AI
        </p>

        <form onSubmit={handleRegister}>

          {/* Name */}
          <label
            style={{
              display: "block",
              color: "#374151",
              fontWeight: "600",
              marginBottom: "6px",
            }}
          >
            Full Name
          </label>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "18px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              boxSizing: "border-box",
              outline: "none",
              color: "#111827",
              background: "#ffffff",
            }}
          />

          {/* Email */}
          <label
            style={{
              display: "block",
              color: "#374151",
              fontWeight: "600",
              marginBottom: "6px",
            }}
          >
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "18px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              boxSizing: "border-box",
              outline: "none",
              color: "#111827",
              background: "#ffffff",
            }}
          />

          {/* Password */}
          <label
            style={{
              display: "block",
              color: "#374151",
              fontWeight: "600",
              marginBottom: "6px",
            }}
          >
            Password
          </label>

          <input
            type="password"
            placeholder="Create password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "18px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              boxSizing: "border-box",
              outline: "none",
              color: "#111827",
              background: "#ffffff",
            }}
          />

          {/* Confirm Password */}
          <label
            style={{
              display: "block",
              color: "#374151",
              fontWeight: "600",
              marginBottom: "6px",
            }}
          >
            Confirm Password
          </label>

          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "25px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              boxSizing: "border-box",
              outline: "none",
              color: "#111827",
              background: "#ffffff",
            }}
          />

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "8px",
              background: loading ? "#9ca3af" : "#2563eb",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        {/* Login Link */}
        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            color: "#666",
          }}
        >
          Already have an account?{" "}

          <Link
            to="/login"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;