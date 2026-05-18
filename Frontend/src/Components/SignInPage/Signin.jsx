import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ToastNotification, { showToast } from "../Utils/ToastNotification";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import UseDarkMode from "../Utils/UseDarkMode";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogoClick = (e) => {
    e.preventDefault();
    navigate("/");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:7287/api/auth",
        {
          userMail: email,
          Password: password,
        }
      );

      const { token } = response.data;
      Cookies.set("token", token);
      const decoded = jwtDecode(token);
      Cookies.set("role", decoded.User_Type);

      showToast("Login Successful!", "success");

      setTimeout(() => {
        decoded.User_Type === "Admin"
          ? navigate("/admin/Dashboard")
          : navigate("/dashboard");
      }, 1500);
    } catch (err) {
      showToast("Failed to Log In. Please try again.", "error");
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-950 transition-colors">

      <UseDarkMode />
      <ToastNotification />
      <div
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://cdn.mos.cms.futurecdn.net/5fz9SMYxWbv44jFVcD4vmd.jpg)",
        }}
      />

      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6">
        <div className="mb-4 flex justify-center">
          <img
            src="/Images/Maventory_light.png"
            alt="Maventory Logo"
            onClick={handleLogoClick}
            className="h-20 w-20 cursor-pointer dark:hidden"
          />

          <img
            src="/Images/maventory1.png"
            alt="Maventory Logo Dark"
            onClick={handleLogoClick}
            className="h-24 w-32 cursor-pointer hidden dark:block"
          />
        </div>

        <div className="flex justify-center mb-8 text-6xl text-black dark:text-white">
          Maventory
        </div>

        <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-900
          shadow-xl rounded-2xl px-8 py-10 animate-fadeUp">

          <h2 className="text-center text-2xl font-extrabold
            text-gray-900 dark:text-white mb-6">
            Welcome Back 👋
          </h2>

          <form className="space-y-4" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 rounded-lg border
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-white
              border-gray-300 dark:border-gray-700
              focus:ring-2 focus:ring-blue-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full  p-4 rounded-lg border
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-white
                border-gray-300 dark:border-gray-700
                focus:ring-2 focus:ring-blue-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-2 text-gray-500 bg-white dark:bg-gray-800"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg font-semibold
              bg-blue-600 hover:bg-blue-700
              text-white transition shadow-md"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 flex justify-between text-sm">
            <a
              href="/Privacy"
              className="text-gray-700 dark:text-gray-300
              hover:text-blue-600"
            >
              Privacy
            </a>
            <a
              href="/Terms"
              className="text-gray-700 dark:text-gray-300
              hover:text-blue-600"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;