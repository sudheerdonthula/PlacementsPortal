import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      // Real API call to backend
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (response.data && response.data.token) {
        const { token, ...user } = response.data;

        // Update auth state using existing login function
        login({
          ...user,
          token: token,
        });

        // Role-based navigation
        console.log("Login successful, navigating based on role:", user.role);

        if (user.role === "student") {
          navigate("/student-dashboard", { replace: true });
        } else if (user.role === "company") {
          navigate("/company-dashboard", { replace: true });
        } else if (user.role === "admin") {
          navigate("/admin-dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = "Login failed. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = "Invalid email or password";
      } else if (error.response?.status === 403) {
        errorMessage = "Account not verified or access denied";
      } else if (error.response?.status === 404) {
        errorMessage = "User not found";
      } else if (error.code === "NETWORK_ERROR") {
        errorMessage = "Network error. Please check your connection.";
      }

      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nit-navy via-nit-lavender to-nit-purple flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md bg-white">
              <img
                src="/nitw-logo.png"
                alt="NIT Warangal Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            <div className="text-left text-white">
              <h1 className="text-2xl font-bold">NIT Warangal</h1>
              <p className="text-nit-gold text-sm">Placement Portal</p>
            </div>
          </Link>

          <h2 className="text-4xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-200 text-lg">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-nit-navy mb-3">
                Login as:
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.role === "student"
                      ? "border-nit-red bg-red-50 text-nit-red"
                      : "border-gray-300 hover:border-nit-gold"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={formData.role === "student"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <span className="text-xl mr-2">🎓</span>
                    <span className="font-semibold">Student</span>
                  </div>
                </label>

                <label
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.role === "company"
                      ? "border-nit-red bg-red-50 text-nit-red"
                      : "border-gray-300 hover:border-nit-gold"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="company"
                    checked={formData.role === "company"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <span className="text-xl mr-2">🏢</span>
                    <span className="font-semibold">Company</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-nit-navy mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-nit-red focus:border-transparent transition-all ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-nit-navy mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-nit-red focus:border-transparent transition-all ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-nit-red focus:ring-nit-red border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-nit-dark-purple">
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-nit-red hover:text-red-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-nit-red to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-nit-dark-purple">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-nit-red hover:text-red-700 transition-colors"
              >
                Create one here
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            to="/"
            className="text-white hover:text-nit-gold transition-colors font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
