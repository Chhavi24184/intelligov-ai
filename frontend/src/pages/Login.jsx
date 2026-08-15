import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Check empty fields
    if (!email.trim() || !password.trim()) {
      alert("Please enter email and password");
      return;
    }

    // Get registered user details
    const registeredEmail = localStorage.getItem("userEmail");
    const registeredPassword = localStorage.getItem("userPassword");

    // Check credentials
    if (
      email.trim() !== registeredEmail ||
      password !== registeredPassword
    ) {
      alert("Invalid email or password");
      return;
    }

    // Login successful
    localStorage.setItem("isLoggedIn", "true");

    alert("Login successful!");

    // Go to Dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#060c17] text-white flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Login Card */}
      <div className="relative w-full max-w-md">

        <div className="bg-[#081224] border border-blue-900/40 rounded-3xl p-8 sm:p-10 shadow-2xl">

          {/* Header */}
          <div className="text-center mb-8">

            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Welcome Back 👋
            </h1>

            <p className="text-sm text-slate-400 mt-2">
              Login to IntelliGov AI
            </p>

          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>

              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#060c17] border border-blue-900/50 text-white placeholder-slate-500 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/10 transition-all"
              />

            </div>

            {/* Password */}
            <div>

              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#060c17] border border-blue-900/50 text-white placeholder-slate-500 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/10 transition-all"
              />

            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/20 hover:scale-[1.02] hover:shadow-cyan-500/30 transition-all duration-300"
            >
              Login
            </button>

          </form>

          {/* Register */}
          <p className="text-center text-sm text-slate-400 mt-7">

            New user?{" "}

            <Link
              to="/register"
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Create Account
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;