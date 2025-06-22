import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const placementStats = [
    { label: "Students Placed", value: "2,500+", icon: "🎓" },
    { label: "Companies Visited", value: "150+", icon: "🏢" },
    { label: "Average Package", value: "₹12.5 LPA", icon: "💰" },
    { label: "Highest Package", value: "₹45 LPA", icon: "🏆" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100">
      {/* Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* College Logo & Name */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md bg-white">
                <img
                  src="/nitw-logo.png"
                  alt="NIT Warangal Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  NIT Warangal
                </h1>
                <p className="text-gray-400 text-sm">Placement Portal</p>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {user ? (
                // ✅ LOGGED IN USER - Show user info and logout
                <div className="flex items-center space-x-4">
                  {/* User Info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-nit-red rounded-full flex items-center justify-center shadow">
                      <span className="text-white font-bold text-sm">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-semibold text-gray-800">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {user.role}
                      </p>
                    </div>
                  </div>

                  {/* Dashboard Link */}
                  <Link
                    to={
                      user.role === "student"
                        ? "/student-dashboard"
                        : "/company-dashboard"
                    }
                    className="text-nit-red hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Dashboard
                  </Link>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="bg-nit-red text-white px-6 py-2 rounded-full font-semibold hover:bg-red-700 transition-colors shadow"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                // ❌ NOT LOGGED IN - Show login/register buttons
                <>
                  <Link
                    to="/login"
                    className="text-nit-red hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-nit-red text-white px-6 py-2 rounded-full font-semibold hover:bg-red-700 transition-colors shadow"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Banner */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-red-100 via-white to-red-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            NIT Warangal
            <span className="block text-nit-red text-3xl sm:text-4xl md:text-5xl mt-2">
              Placement Portal
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Connect students with top companies and build successful careers
          </p>

          {user ? (
            // ✅ LOGGED IN USER - Show welcome message and dashboard link
            <div className="bg-white/90 backdrop-blur rounded-2xl p-8 shadow-lg border border-gray-200 max-w-xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Welcome back, {user.name}! 👋
              </h2>
              <p className="text-gray-700 mb-6">
                Ready to continue your placement journey?
              </p>
              <Link
                to={
                  user.role === "student"
                    ? "/student-dashboard"
                    : "/company-dashboard"
                }
                className="bg-nit-red text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg inline-block"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            // ❌ NOT LOGGED IN - Show registration buttons
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-nit-red text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="border-2 border-nit-red text-nit-red px-8 py-3 rounded-full text-lg font-semibold hover:bg-nit-red hover:text-white transition-all"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Placement Statistics */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
              Placement Statistics
            </h2>
            <p className="text-base sm:text-lg text-gray-700">
              Our track record speaks for itself
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {placementStats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white shadow hover:shadow-lg transition-all transform hover:scale-105"
              >
                <div className="text-3xl sm:text-4xl mb-3">{stat.icon}</div>
                <div className="text-xl sm:text-2xl font-bold text-nit-red mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-800 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-red-100 via-white to-red-200 text-gray-800 py-10 sm:py-12 mt-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* College Info */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-nit-red rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">N</span>
                </div>
                <span className="text-xl font-bold text-gray-800">
                  NIT Warangal
                </span>
              </div>
              <p className="text-gray-600">
                National Institute of Technology Warangal - Empowering students
                for successful careers.
              </p>
            </div>
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/register"
                    className="text-gray-700 hover:text-nit-red transition-colors"
                  >
                    Student Registration
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="text-gray-700 hover:text-nit-red transition-colors"
                  >
                    Company Registration
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-nit-red transition-colors"
                  >
                    Login
                  </Link>
                </li>
              </ul>
            </div>
            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Contact
              </h3>
              <div className="space-y-2 text-gray-600">
                <p>📧 placement@nitw.ac.in</p>
                <p>📞 +91-870-2462-651</p>
                <p>📍 NIT Warangal, Telangana</p>
              </div>
            </div>
          </div>
          {/* Copyright */}
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-gray-500">
              © 2024 NIT Warangal Placement Portal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
