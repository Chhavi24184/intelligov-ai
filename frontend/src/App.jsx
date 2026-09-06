import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AIChat from "./pages/AIChat";
import SchemeRecommendation from "./pages/SchemeRecommendation";
import EligibilityChecker from "./pages/EligibilityChecker";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Saved from "./pages/Saved";

function App() {
  const location = useLocation();

  return (
    <>
      {/* Navbar */}
      {location.pathname !== "/dashboard" &&
        location.pathname !== "/login" &&
        location.pathname !== "/register" &&
        location.pathname !== "/profile" && <Navbar />}

      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}

        {/* Home */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Register */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* Saved */}
        <Route
          path="/saved"
          element={
            <Saved />
          }
        />

        {/* ================= PROTECTED ROUTES ================= */}

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* AI Chat */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <AIChat />
            </ProtectedRoute>
          }
        />

        {/* Government Schemes */}
        <Route
          path="/schemes"
          element={
            <ProtectedRoute>
              <SchemeRecommendation />
            </ProtectedRoute>
          }
        />

        {/* Eligibility */}
        <Route
          path="/eligibility"
          element={
            <ProtectedRoute>
              <EligibilityChecker />
            </ProtectedRoute>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

      </Routes>
    </>
  );
}

export default App;