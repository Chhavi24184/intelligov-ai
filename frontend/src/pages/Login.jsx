import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { loginUser } from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");

  // =========================
  // LOGIN STATES
  // =========================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // =========================
  // REGISTER STATES
  // =========================

  const [name, setName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      // EXISTING LOGIN API — NOT CHANGED
      const data = await loginUser(
        email.trim(),
        password
      );

      console.log("Login response:", data);

      // =========================================
      // SAVE USER INFORMATION
      // =========================================

      if (data.user) {
        localStorage.setItem(
          "userId",
          String(data.user.id)
        );

        localStorage.setItem(
          "userName",
          data.user.name
        );

        localStorage.setItem(
          "userEmail",
          data.user.email
        );
      }

      localStorage.setItem(
        "isLoggedIn",
        "true"
      );

      alert("Login successful!");

      navigate("/dashboard");

    } catch (error) {
      console.error("Login error:", error);

      alert(
        error.message ||
        "Invalid email or password"
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // REGISTER
  // =====================================================

  const handleRegister = async (e) => {
    e.preventDefault();

    if (
      !name.trim() ||
      !registerEmail.trim() ||
      !registerPassword ||
      !confirmPassword
    ) {
      alert("Please fill all fields");
      return;
    }

    if (registerPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // EXISTING REGISTER API — NOT CHANGED
      const response = await axios.post(
        "http://127.0.0.1:8000/auth/register",
        {
          name: name.trim(),
          email: registerEmail.trim(),
          password: registerPassword,
        }
      );

      console.log(
        "Register response:",
        response.data
      );

      alert("Account created successfully!");

      // Switch back to login
      setMode("login");

      // Clear registration fields
      setName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setConfirmPassword("");

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

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

  // =====================================================
  // SWITCH MODE
  // =====================================================

  const switchMode = (newMode) => {
    if (loading) return;

    setMode(newMode);
  };

  return (
    <div
      className="
        h-screen
        w-full
        overflow-hidden
        bg-[#f5f7fb]
        flex
        items-stretch
      "
    >

      {/* =================================================
          LEFT SIDE — INFORMATION / BRANDING
          ================================================= */}

      <div
        className="
          hidden
          lg:flex
          lg:w-1/2
          h-full
          relative
          overflow-hidden
          items-center
          justify-center
          px-10
          xl:px-16
        "
        style={{
          background:
            "linear-gradient(135deg, #eef6ff 0%, #dcecff 45%, #c7dcff 100%)",
        }}
      >

        {/* Background gradient glow */}

        <div
          className="
            absolute
            -top-32
            -left-32
            w-[500px]
            h-[500px]
            rounded-full
            blur-[120px]
            opacity-50
          "
          style={{
            background:
              "linear-gradient(135deg, #60a5fa, #38bdf8)",
          }}
        />

        <div
          className="
            absolute
            -bottom-40
            -right-32
            w-[500px]
            h-[500px]
            rounded-full
            blur-[130px]
            opacity-40
          "
          style={{
            background:
              "linear-gradient(135deg, #2563eb, #06b6d4)",
          }}
        />

        {/* LEFT CONTENT */}

        <div
          className="
            relative
            z-10
            w-full
            max-w-xl
            flex
            flex-col
            justify-center
          "
        >

          {/* Logo / Brand */}

          <div className="flex items-center gap-3 mb-7">

            <div
              className="
                w-12
                h-12
                rounded-2xl
                bg-white
                shadow-lg
                flex
                items-center
                justify-center
                text-2xl
              "
            >
              🤖
            </div>

            <div>

              <h2
                className="
                  text-2xl
                  font-black
                  text-[#111827]
                "
              >
                IntelliGov AI
              </h2>

              <p
                className="
                  text-xs
                  text-[#64748b]
                  font-medium
                "
              >
                Your Government Services Assistant
              </p>

            </div>

          </div>


          {/* Main Heading */}

          <h1
            className="
              text-4xl
              xl:text-5xl
              font-black
              leading-[1.08]
              tracking-tight
              text-[#111827]
              max-w-lg
            "
          >
            Government Services,
            <br />

            <span
              className="
                bg-gradient-to-r
                from-cyan-500
                via-blue-600
                to-indigo-600
                bg-clip-text
                text-transparent
              "
            >
              Made Simple.
            </span>
          </h1>


          {/* Description */}

          <p
            className="
              mt-5
              text-sm
              xl:text-base
              leading-relaxed
              text-[#64748b]
              max-w-lg
            "
          >
            Discover government schemes, scholarships,
            jobs and internships that are relevant to you.
            IntelliGov AI helps you find the right
            opportunities with less effort.
          </p>


          {/* Feature Cards */}

          <div
            className="
              grid
              grid-cols-2
              gap-3
              mt-7
              max-w-lg
            "
          >

            {/* Feature 1 */}

            <div
              className="
                bg-white/75
                backdrop-blur-sm
                border
                border-white
                rounded-2xl
                p-4
                shadow-sm
              "
            >

              <div
                className="
                  w-9
                  h-9
                  rounded-xl
                  bg-cyan-50
                  flex
                  items-center
                  justify-center
                  text-lg
                  mb-2
                "
              >
                🏛️
              </div>

              <h3
                className="
                  text-sm
                  font-bold
                  text-[#1f2937]
                "
              >
                Government Schemes
              </h3>

              <p
                className="
                  text-[11px]
                  text-[#64748b]
                  mt-1
                "
              >
                Find schemes suited to your profile.
              </p>

            </div>


            {/* Feature 2 */}

            <div
              className="
                bg-white/75
                backdrop-blur-sm
                border
                border-white
                rounded-2xl
                p-4
                shadow-sm
              "
            >

              <div
                className="
                  w-9
                  h-9
                  rounded-xl
                  bg-blue-50
                  flex
                  items-center
                  justify-center
                  text-lg
                  mb-2
                "
              >
                🎓
              </div>

              <h3
                className="
                  text-sm
                  font-bold
                  text-[#1f2937]
                "
              >
                Scholarships
              </h3>

              <p
                className="
                  text-[11px]
                  text-[#64748b]
                  mt-1
                "
              >
                Explore education opportunities.
              </p>

            </div>


            {/* Feature 3 */}

            <div
              className="
                bg-white/75
                backdrop-blur-sm
                border
                border-white
                rounded-2xl
                p-4
                shadow-sm
              "
            >

              <div
                className="
                  w-9
                  h-9
                  rounded-xl
                  bg-indigo-50
                  flex
                  items-center
                  justify-center
                  text-lg
                  mb-2
                "
              >
                💼
              </div>

              <h3
                className="
                  text-sm
                  font-bold
                  text-[#1f2937]
                "
              >
                Jobs & Internships
              </h3>

              <p
                className="
                  text-[11px]
                  text-[#64748b]
                  mt-1
                "
              >
                Discover career opportunities.
              </p>

            </div>


            {/* Feature 4 */}

            <div
              className="
                bg-white/75
                backdrop-blur-sm
                border
                border-white
                rounded-2xl
                p-4
                shadow-sm
              "
            >

              <div
                className="
                  w-9
                  h-9
                  rounded-xl
                  bg-emerald-50
                  flex
                  items-center
                  justify-center
                  text-lg
                  mb-2
                "
              >
                🔍
              </div>

              <h3
                className="
                  text-sm
                  font-bold
                  text-[#1f2937]
                "
              >
                Smart Matching
              </h3>

              <p
                className="
                  text-[11px]
                  text-[#64748b]
                  mt-1
                "
              >
                Get personalized recommendations.
              </p>

            </div>

          </div>


          {/* Bottom Trust Text */}

          <div
            className="
              flex
              items-center
              gap-2
              mt-6
              text-xs
              text-[#64748b]
            "
          >

            <span
              className="
                w-2
                h-2
                rounded-full
                bg-emerald-500
              "
            />

            AI-powered • Citizen-focused • Easy to use

          </div>

        </div>

      </div>


      {/* =================================================
          RIGHT SIDE — LOGIN / REGISTER
          ================================================= */}

      <div
        className="
          w-full
          lg:w-1/2
          h-full
          flex
          items-center
          justify-center
          bg-white
          px-5
          sm:px-8
          lg:px-10
          overflow-hidden
        "
      >

        <div
          className="
            w-full
            max-w-md
            max-h-full
            flex
            flex-col
            justify-center
          "
        >

          {/* =============================================
              TOGGLE BAR
              ============================================= */}

          <div
            className="
              bg-[#f1f5f9]
              p-1.5
              rounded-2xl
              flex
              items-center
              mb-6
              border
              border-[#e2e8f0]
            "
          >

            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`
                w-1/2
                py-2.5
                rounded-xl
                text-sm
                font-semibold
                transition-all
                duration-200
                ${
                  mode === "login"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }
              `}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`
                w-1/2
                py-2.5
                rounded-xl
                text-sm
                font-semibold
                transition-all
                duration-200
                ${
                  mode === "register"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }
              `}
            >
              Register
            </button>

          </div>


          {/* =================================================
              LOGIN
              ================================================= */}

          {mode === "login" && (

            <div>

              {/* Header */}

              <div className="text-center mb-5">

                <div
                  className="
                    w-12
                    h-12
                    mx-auto
                    mb-3
                    rounded-2xl
                    bg-cyan-50
                    border
                    border-cyan-100
                    flex
                    items-center
                    justify-center
                    text-xl
                  "
                >
                  🤖
                </div>

                <h1
                  className="
                    text-2xl
                    sm:text-3xl
                    font-bold
                    text-[#111827]
                  "
                >
                  Welcome Back 👋
                </h1>

                <p
                  className="
                    text-sm
                    text-[#64748b]
                    mt-1
                  "
                >
                  Login to IntelliGov AI
                </p>

              </div>


              {/* Login Form */}

              <form
                onSubmit={handleLogin}
                className="space-y-4"
              >

                {/* Email */}

                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-[#374151]
                      mb-1.5
                    "
                  >
                    Email
                  </label>

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    className="
                      w-full
                      px-4
                      py-3
                      rounded-xl
                      bg-[#f8fafc]
                      border
                      border-[#dbe3ee]
                      text-[#111827]
                      placeholder-[#94a3b8]
                      outline-none
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-500/10
                      transition-all
                    "
                  />

                </div>


                {/* Password */}

                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-[#374151]
                      mb-1.5
                    "
                  >
                    Password
                  </label>

                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    className="
                      w-full
                      px-4
                      py-3
                      rounded-xl
                      bg-[#f8fafc]
                      border
                      border-[#dbe3ee]
                      text-[#111827]
                      placeholder-[#94a3b8]
                      outline-none
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-500/10
                      transition-all
                    "
                  />

                </div>


                {/* Login Button */}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full
                    py-3
                    rounded-xl
                    bg-gradient-to-r
                    from-cyan-500
                    to-blue-600
                    text-white
                    font-semibold
                    shadow-lg
                    shadow-blue-500/20
                    hover:scale-[1.01]
                    hover:shadow-blue-500/30
                    transition-all
                    duration-300
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                  "
                >
                  {loading
                    ? "Logging in..."
                    : "Login"}
                </button>

              </form>


              {/* Bottom Link */}

              <p
                className="
                  text-center
                  text-sm
                  text-[#64748b]
                  mt-5
                "
              >
                New user?{" "}

                <button
                  type="button"
                  onClick={() =>
                    switchMode("register")
                  }
                  className="
                    text-blue-600
                    hover:text-blue-700
                    font-semibold
                  "
                >
                  Create Account
                </button>

              </p>

            </div>

          )}


          {/* =================================================
              REGISTER
              ================================================= */}

          {mode === "register" && (

            <div>

              {/* Header */}

              <div className="text-center mb-4">

                <div
                  className="
                    w-11
                    h-11
                    mx-auto
                    mb-2
                    rounded-2xl
                    bg-cyan-50
                    border
                    border-cyan-100
                    flex
                    items-center
                    justify-center
                    text-xl
                  "
                >
                  👤
                </div>

                <h1
                  className="
                    text-2xl
                    sm:text-3xl
                    font-bold
                    text-[#111827]
                  "
                >
                  Create Account
                </h1>

                <p
                  className="
                    text-sm
                    text-[#64748b]
                    mt-1
                  "
                >
                  Join IntelliGov AI
                </p>

              </div>


              {/* Register Form */}

              <form
                onSubmit={handleRegister}
                className="space-y-3"
              >

                {/* Name */}

                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-[#374151]
                      mb-1
                    "
                  >
                    Full Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    className="
                      w-full
                      px-4
                      py-2.5
                      rounded-xl
                      bg-[#f8fafc]
                      border
                      border-[#dbe3ee]
                      text-[#111827]
                      placeholder-[#94a3b8]
                      outline-none
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-500/10
                      transition-all
                    "
                  />

                </div>


                {/* Email */}

                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-[#374151]
                      mb-1
                    "
                  >
                    Email
                  </label>

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={registerEmail}
                    onChange={(e) =>
                      setRegisterEmail(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      px-4
                      py-2.5
                      rounded-xl
                      bg-[#f8fafc]
                      border
                      border-[#dbe3ee]
                      text-[#111827]
                      placeholder-[#94a3b8]
                      outline-none
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-500/10
                      transition-all
                    "
                  />

                </div>


                {/* Password */}

                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-[#374151]
                      mb-1
                    "
                  >
                    Password
                  </label>

                  <input
                    type="password"
                    placeholder="Create password"
                    value={registerPassword}
                    onChange={(e) =>
                      setRegisterPassword(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      px-4
                      py-2.5
                      rounded-xl
                      bg-[#f8fafc]
                      border
                      border-[#dbe3ee]
                      text-[#111827]
                      placeholder-[#94a3b8]
                      outline-none
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-500/10
                      transition-all
                    "
                  />

                </div>


                {/* Confirm Password */}

                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-[#374151]
                      mb-1
                    "
                  >
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      px-4
                      py-2.5
                      rounded-xl
                      bg-[#f8fafc]
                      border
                      border-[#dbe3ee]
                      text-[#111827]
                      placeholder-[#94a3b8]
                      outline-none
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-500/10
                      transition-all
                    "
                  />

                </div>


                {/* Register Button */}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full
                    py-3
                    mt-1
                    rounded-xl
                    bg-gradient-to-r
                    from-cyan-500
                    to-blue-600
                    text-white
                    font-semibold
                    shadow-lg
                    shadow-blue-500/20
                    hover:scale-[1.01]
                    hover:shadow-blue-500/30
                    transition-all
                    duration-300
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                  "
                >
                  {loading
                    ? "Creating Account..."
                    : "Create Account"}
                </button>

              </form>


              {/* Bottom Link */}

              <p
                className="
                  text-center
                  text-sm
                  text-[#64748b]
                  mt-4
                "
              >
                Already have an account?{" "}

                <button
                  type="button"
                  onClick={() =>
                    switchMode("login")
                  }
                  className="
                    text-blue-600
                    hover:text-blue-700
                    font-semibold
                  "
                >
                  Login
                </button>

              </p>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default Login;