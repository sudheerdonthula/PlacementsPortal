import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    rollNumber: "",
    branch: "",
    graduationYear: "",
    companyName: "",
    designation: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const branches = [
    "Computer Science & Engineering",
    "Electronics & Communication Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Metallurgical & Materials Engineering",
    "Biotechnology",
    "Mathematics",
    "Physics",
    "Chemistry",
  ];

  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from(
    { length: 6 },
    (_, i) => currentYear + i - 2
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.role === "student") {
      if (!formData.rollNumber.trim())
        newErrors.rollNumber = "Roll number is required";
      if (!formData.branch) newErrors.branch = "Branch is required";
      if (!formData.graduationYear)
        newErrors.graduationYear = "Graduation year is required";
    } else {
      if (!formData.companyName.trim())
        newErrors.companyName = "Company name is required";
      if (!formData.designation.trim())
        newErrors.designation = "Designation is required";
    }

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Phone number must be 10 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(formData);
      navigate("/login");
    } catch (error) {
      setErrors({ submit: error.message || "Registration failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nit-mint via-white to-nit-light-gray flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
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
            <div className="text-left">
              <h1 className="text-2xl font-bold text-nit-navy">NIT Warangal</h1>
              <p className="text-nit-lavender text-sm">Placement Portal</p>
            </div>
          </Link>

          <h2 className="text-4xl font-bold text-nit-navy mb-2">
            Create Your Account
          </h2>
          <p className="text-nit-dark-purple text-lg">
            Join the NIT Warangal placement ecosystem
          </p>
        </div>

        {/* Registration Form */}
        <div className="card p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-nit-navy mb-3">
                I am a:
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
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
                    <span className="text-2xl mr-3">🎓</span>
                    <div>
                      <div className="font-semibold">Student</div>
                      <div className="text-sm opacity-75">
                        Current NIT-W Student
                      </div>
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
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
                    <span className="text-2xl mr-3">🏢</span>
                    <div>
                      <div className="font-semibold">Company</div>
                      <div className="text-sm opacity-75">
                        Recruiting Organization
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-nit-navy mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-nit-red focus:border-transparent transition-all ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-nit-navy mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-nit-red focus:border-transparent transition-all ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-nit-navy mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-nit-red focus:border-transparent transition-all ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Minimum 6 characters"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-nit-navy mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-nit-red focus:border-transparent transition-all ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Re-enter your password"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-nit-navy mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-nit-red focus:border-transparent transition-all ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="10-digit mobile number"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Student-specific fields */}
            {formData.role === "student" && (
              <div className="space-y-6 p-6 bg-blue-50 rounded-lg border-l-4 border-nit-red">
                <h3 className="text-lg font-semibold text-nit-navy mb-4">
                  📚 Student Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-nit-navy mb-2">
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-nit-red focus:border-transparent transition-all ${
                        errors.rollNumber ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g., 20CS1234"
                    />
                    {errors.rollNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.rollNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-nit-navy mb-2">
                      Graduation Year *
                    </label>
                    <select
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-nit-red focus:border-transparent transition-all ${
                        errors.graduationYear
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select graduation year</option>
                      {graduationYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    {errors.graduationYear && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.graduationYear}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-nit-navy mb-2">
                    Branch/Department *
                  </label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-nit-red focus:border-transparent transition-all ${
                      errors.branch ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select your branch</option>
                    {branches.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                  {errors.branch && (
                    <p className="text-red-500 text-sm mt-1">{errors.branch}</p>
                  )}
                </div>
              </div>
            )}

            {/* Company-specific fields */}
            {formData.role === "company" && (
              <div className="space-y-6 p-6 bg-green-50 rounded-lg border-l-4 border-nit-gold">
                <h3 className="text-lg font-semibold text-nit-navy mb-4">
                  🏢 Company Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-nit-navy mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-nit-red focus:border-transparent transition-all ${
                        errors.companyName
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Your company name"
                    />
                    {errors.companyName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.companyName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-nit-navy mb-2">
                      Your Designation *
                    </label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-nit-red focus:border-transparent transition-all ${
                        errors.designation
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g., HR Manager, Talent Acquisition"
                    />
                    {errors.designation && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.designation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.submit}
              </div>
            )}

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
                  Creating Account...
                </div>
              ) : (
                `Create ${
                  formData.role === "student" ? "Student" : "Company"
                } Account`
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-nit-dark-purple">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-nit-red hover:text-red-700 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            to="/"
            className="text-nit-lavender hover:text-nit-navy transition-colors font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
