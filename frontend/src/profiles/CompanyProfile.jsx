import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import api from "../utils/api"; // or wherever your API instance is

const CompanyProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [companyData, setCompanyData] = useState({
    companyName: "",
    industry: "",
    website: "",
    description: "",
    hrContact: {
      name: "",
      email: "",
      phone: "",
    },
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
    },
    isVerified: false,
  });

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Industry options
  const industryOptions = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Manufacturing",
    "Retail",
    "Consulting",
    "Media & Entertainment",
    "Transportation",
    "Real Estate",
    "Energy",
    "Telecommunications",
    "Government",
    "Non-Profit",
    "Other",
  ];

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);

      const response = await api.get("/company/profile");

      if (response.data.success) {
        setCompanyData(response.data.data);
        setFormData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching company profile:", error);
      if (error.response?.status === 404) {
        // Profile doesn't exist yet - this is okay for new companies
        setCompanyData({
          companyName: "",
          industry: "",
          website: "",
          description: "",
          hrContact: { name: "", email: "", phone: "" },
          address: {
            street: "",
            city: "",
            state: "",
            country: "",
            pincode: "",
          },
          isVerified: false,
        });
        setFormData({
          companyName: "",
          industry: "",
          website: "",
          description: "",
          hrContact: { name: "", email: "", phone: "" },
          address: {
            street: "",
            city: "",
            state: "",
            country: "",
            pincode: "",
          },
        });
      } else {
        toast.error("Error loading company profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      // Handle nested objects (hrContact, address)
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

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

    // Required fields validation
    if (!formData.companyName?.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!formData.industry?.trim()) {
      newErrors.industry = "Industry is required";
    }

    // Website validation
    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = "Please enter a valid website URL";
    }

    // Email validation
    if (formData.hrContact?.email && !isValidEmail(formData.hrContact.email)) {
      newErrors["hrContact.email"] = "Please enter a valid email address";
    }

    // Phone validation
    if (formData.hrContact?.phone && !isValidPhone(formData.hrContact.phone)) {
      newErrors["hrContact.phone"] = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone) => {
    return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ""));
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const response = await api.post("/company/profile", formData);

      if (response.data.success) {
        setCompanyData(response.data.data);
        setIsEditing(false);
        toast.success("Company profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating company profile:", error);
      toast.error(
        error.response?.data?.message || "Error updating company profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(companyData);
    setErrors({});
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nit-red mx-auto mb-4"></div>
          <p className="text-nit-dark-purple">Loading company profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2 border-nit-gold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/company-dashboard"
                className="text-nit-navy hover:text-nit-red transition-colors"
              >
                ← Back to Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-nit-navy">
                  Company Profile
                </h1>
                <p className="text-nit-dark-purple">
                  Manage your company information
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-nit-red text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="font-medium text-nit-navy">{user?.email}</p>
                  <p className="text-sm text-gray-600">Company Account</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verification Status */}
        <div
          className={`mb-6 p-4 rounded-lg ${
            companyData.isVerified
              ? "bg-green-50 border border-green-200"
              : "bg-yellow-50 border border-yellow-200"
          }`}
        >
          <div className="flex items-center">
            <span className="text-2xl mr-3">
              {companyData.isVerified ? "✅" : "⏳"}
            </span>
            <div>
              <p
                className={`font-medium ${
                  companyData.isVerified ? "text-green-800" : "text-yellow-800"
                }`}
              >
                {companyData.isVerified
                  ? "Verified Company"
                  : "Verification Pending"}
              </p>
              <p
                className={`text-sm ${
                  companyData.isVerified ? "text-green-600" : "text-yellow-600"
                }`}
              >
                {companyData.isVerified
                  ? "Your company profile has been verified by our team."
                  : "Your company profile is under review. Verification typically takes 1-2 business days."}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-nit-navy">
              Company Information
            </h2>
            <p className="text-gray-600">
              Keep your company profile up to date
            </p>
          </div>

          <div className="p-6 space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-nit-navy mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName || ""}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent ${
                          errors.companyName
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter company name"
                      />
                      {errors.companyName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.companyName}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-nit-navy font-medium">
                      {companyData.companyName || "Not provided"}
                    </p>
                  )}
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry *
                  </label>
                  {isEditing ? (
                    <div>
                      <select
                        name="industry"
                        value={formData.industry || ""}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent ${
                          errors.industry ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        <option value="">Select industry</option>
                        {industryOptions.map((industry) => (
                          <option key={industry} value={industry}>
                            {industry}
                          </option>
                        ))}
                      </select>
                      {errors.industry && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.industry}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-nit-navy font-medium">
                      {companyData.industry || "Not provided"}
                    </p>
                  )}
                </div>

                {/* Website */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="url"
                        name="website"
                        value={formData.website || ""}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent ${
                          errors.website ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="https://www.yourcompany.com"
                      />
                      {errors.website && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.website}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      {companyData.website ? (
                        <a
                          href={companyData.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-nit-red hover:text-red-700 font-medium"
                        >
                          {companyData.website} ↗
                        </a>
                      ) : (
                        <p className="text-gray-500">Not provided</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Company Description */}
            <div>
              <h3 className="text-lg font-semibold text-nit-navy mb-4">
                Company Description
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About Your Company
                </label>
                {isEditing ? (
                  <textarea
                    name="description"
                    value={formData.description || ""}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
                    placeholder="Tell us about your company, culture, and what makes you unique..."
                  />
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {companyData.description || "No description provided"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* HR Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-nit-navy mb-4">
                HR Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* HR Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HR Contact Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="hrContact.name"
                      value={formData.hrContact?.name || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
                      placeholder="Enter HR contact name"
                    />
                  ) : (
                    <p className="text-nit-navy font-medium">
                      {companyData.hrContact?.name || "Not provided"}
                    </p>
                  )}
                </div>

                {/* HR Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HR Email
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="email"
                        name="hrContact.email"
                        value={formData.hrContact?.email || ""}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent ${
                          errors["hrContact.email"]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="hr@yourcompany.com"
                      />
                      {errors["hrContact.email"] && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors["hrContact.email"]}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      {companyData.hrContact?.email ? (
                        <a
                          href={`mailto:${companyData.hrContact.email}`}
                          className="text-nit-red hover:text-red-700 font-medium"
                        >
                          {companyData.hrContact.email}
                        </a>
                      ) : (
                        <p className="text-gray-500">Not provided</p>
                      )}
                    </div>
                  )}
                </div>

                {/* HR Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HR Phone
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="tel"
                        name="hrContact.phone"
                        value={formData.hrContact?.phone || ""}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent ${
                          errors["hrContact.phone"]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="+1-555-0123"
                      />
                      {errors["hrContact.phone"] && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors["hrContact.phone"]}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      {companyData.hrContact?.phone ? (
                        <a
                          href={`tel:${companyData.hrContact.phone}`}
                          className="text-nit-red hover:text-red-700 font-medium"
                        >
                          {companyData.hrContact.phone}
                        </a>
                      ) : (
                        <p className="text-gray-500">Not provided</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Company Address */}
            <div>
              <h3 className="text-lg font-semibold text-nit-navy mb-4">
                Company Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Street Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address?.street || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
                      placeholder="123 Main Street, Suite 100"
                    />
                  ) : (
                    <p className="text-nit-navy font-medium">
                      {companyData.address?.street || "Not provided"}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address?.city || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
                      placeholder="Enter city"
                    />
                  ) : (
                    <p className="text-nit-navy font-medium">
                      {companyData.address?.city || "Not provided"}
                    </p>
                  )}
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address?.state || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
                      placeholder="Enter state/province"
                    />
                  ) : (
                    <p className="text-nit-navy font-medium">
                      {companyData.address?.state || "Not provided"}
                    </p>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address?.country || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
                      placeholder="Enter country"
                    />
                  ) : (
                    <p className="text-nit-navy font-medium">
                      {companyData.address?.country || "Not provided"}
                    </p>
                  )}
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode/ZIP
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.pincode"
                      value={formData.address?.pincode || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
                      placeholder="Enter pincode/ZIP"
                    />
                  ) : (
                    <p className="text-nit-navy font-medium">
                      {companyData.address?.pincode || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h3 className="text-lg font-semibold text-nit-navy mb-4">
                Account Information
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Account Created:</span>
                    <p className="font-medium text-nit-navy">
                      {new Date(companyData.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Updated:</span>
                    <p className="font-medium text-nit-navy">
                      {new Date(companyData.updatedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Company ID:</span>
                    <p className="font-medium text-nit-navy font-mono">
                      {companyData._id}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Verification Status:</span>
                    <p
                      className={`font-medium ${
                        companyData.isVerified
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {companyData.isVerified ? "Verified ✅" : "Pending ⏳"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-nit-navy mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/company-dashboard"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span className="text-2xl mr-3">🏠</span>
              <div>
                <p className="font-medium text-nit-navy">Dashboard</p>
                <p className="text-sm text-gray-600">View all jobs</p>
              </div>
            </Link>

            <Link
              to="/post-job"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <span className="text-2xl mr-3">➕</span>
              <div>
                <p className="font-medium text-nit-navy">Post New Job</p>
                <p className="text-sm text-gray-600">Create job posting</p>
              </div>
            </Link>

            <button
              onClick={() =>
                window.open("mailto:support@nitplacement.com", "_blank")
              }
              className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors text-left"
            >
              <span className="text-2xl mr-3">📧</span>
              <div>
                <p className="font-medium text-nit-navy">Contact Support</p>
                <p className="text-sm text-gray-600">Get help</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
