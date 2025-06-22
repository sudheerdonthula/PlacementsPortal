import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import api from "../utils/api"; // Your axios instance

const StudentProfile = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile data state
  const [profileData, setProfileData] = useState({
    // User data (from User model)
    name: "",
    email: "",
    // Student data (from Student model)
    studentId: "",
    phone: "",
    department: "",
    year: "",
    cgpa: "",
    skills: [],
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
    },
    resume: {
      filename: "",
      url: "",
      uploadDate: null,
    },
  });

  // Store original data for cancel functionality
  const [originalData, setOriginalData] = useState({});

  // Skills input state
  const [skillInput, setSkillInput] = useState("");

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch student profile data
  useEffect(() => {
    if (user && token) {
      fetchProfileData();
    }
  }, [user, token]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      console.log("Fetching student profile...");

      // Make authenticated API call
      const response = await api.get("/student/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Profile API Response:", response.data);

      if (response.data.success) {
        const studentData = response.data.data;

        // Map backend data to frontend state
        const mappedData = {
          // User data from populated userId
          name: studentData.userId?.name || user?.name || "",
          email: studentData.userId?.email || user?.email || "",

          // Student specific data
          studentId: studentData.studentId || "",
          phone: studentData.phone || "",
          department: studentData.department || "",
          year: studentData.year || "",
          cgpa: studentData.cgpa || "",
          skills: studentData.skills || [],
          address: {
            street: studentData.address?.street || "",
            city: studentData.address?.city || "",
            state: studentData.address?.state || "",
            pincode: studentData.address?.pincode || "",
          },
          resume: {
            filename: studentData.resume?.filename || "",
            url: studentData.resume?.url || "",
            uploadDate: studentData.resume?.uploadDate || null,
          },
        };

        console.log("Mapped profile data:", mappedData);
        setProfileData(mappedData);
        setOriginalData(mappedData);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);

      if (error.response?.status === 404) {
        // Profile doesn't exist yet - this is normal for new users
        console.log("No profile found, using default data");
        const defaultData = {
          name: user?.name || "",
          email: user?.email || "",
          studentId: "",
          phone: "",
          department: "",
          year: "",
          cgpa: "",
          skills: [],
          address: {
            street: "",
            city: "",
            state: "",
            pincode: "",
          },
          resume: {
            filename: "",
            url: "",
            uploadDate: null,
          },
        };
        setProfileData(defaultData);
        setOriginalData(defaultData);
        toast("Please complete your profile information", {
          icon: "ℹ️",
        });
      } else if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        // Handle token expiration - redirect to login
        navigate("/login");
      } else {
        const errorMessage =
          error.response?.data?.message || "Error loading profile data";
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      // Handle nested objects (like address.city)
      const [parent, child] = field.split(".");
      setProfileData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setProfileData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !profileData.skills.includes(skillInput.trim())) {
      setProfileData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      toast.success("File selected successfully");
    } else {
      toast.error("Please select a PDF file");
    }
  };

  const validateForm = () => {
    const errors = [];

    if (!profileData.studentId.trim()) errors.push("Student ID is required");
    if (!profileData.phone.trim()) errors.push("Phone number is required");
    if (!profileData.department.trim()) errors.push("Department is required");
    if (!profileData.year) errors.push("Year is required");
    if (!profileData.cgpa) errors.push("CGPA is required");

    // Validate CGPA range
    const cgpa = parseFloat(profileData.cgpa);
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      errors.push("CGPA must be between 0 and 10");
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[+]?[\d\s\-()]{10,}$/;
    if (!phoneRegex.test(profileData.phone)) {
      errors.push("Please enter a valid phone number");
    }

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      console.log("Saving profile data...");

      // Prepare data for backend (exclude user fields and resume)
      const dataToSend = {
        studentId: profileData.studentId,
        phone: profileData.phone,
        department: profileData.department,
        year: parseInt(profileData.year),
        cgpa: parseFloat(profileData.cgpa),
        skills: profileData.skills,
        address: profileData.address,
      };

      console.log("Data to send:", dataToSend);

      // Make authenticated API call
      const response = await api.post("/student/profile", dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Save response:", response.data);

      if (response.data.success) {
        // Handle file upload if file is selected
        if (selectedFile) {
          await handleResumeUpload();
        }

        // Update original data to reflect saved state
        setOriginalData(profileData);
        setIsEditing(false);
        setSelectedFile(null);

        toast.success("Profile updated successfully!");

        // Optionally refresh data from server
        // await fetchProfileData();
      }
    } catch (error) {
      console.error("Error saving profile:", error);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else if (error.response?.status === 400) {
        const errorMessage =
          error.response?.data?.message || "Validation error";
        toast.error(errorMessage);
      } else {
        toast.error("Error saving profile. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);

      // Note: You'll need to create this endpoint in your backend
      const response = await api.post("/student/resume", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        // Update resume info in profile data
        setProfileData((prev) => ({
          ...prev,
          resume: {
            filename: selectedFile.name,
            url: response.data.data.url,
            uploadDate: new Date(),
          },
        }));
        toast.success("Resume uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading resume:", error);
      toast.error("Error uploading resume. Profile saved without resume.");
    }
  };
  // const handleViewResume = async (resumePath) => {
  //   try {
  //     const filename = resumePath.split("/").pop(); // Extract filename from path
  //     const response = await api.get(`/student/resume/${filename}`, {
  //       responseType: "blob",
  //     });
  //     const url = window.URL.createObjectURL(response.data);
  //     window.open(url, "_blank");
  //   } catch (error) {
  //     toast.error("Error opening resume");
  //   }
  // };

  // const handleDownloadResume = async (resumePath, originalFilename) => {
  //   try {
  //     const filename = resumePath.split("/").pop(); // Extract filename from path
  //     const response = await api.get(`/student/resume/${filename}`, {
  //       responseType: "blob",
  //     });
  //     const url = window.URL.createObjectURL(response.data);
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.download = originalFilename;
  //     link.click();
  //     window.URL.revokeObjectURL(url);
  //   } catch (error) {
  //     toast.error("Error downloading resume");
  //   }
  // };

  const handleCancel = () => {
    setProfileData(originalData);
    setIsEditing(false);
    setSelectedFile(null);
    setSkillInput("");
    toast.info("Changes cancelled");
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!user || !token) {
      toast.error("Please login to access your profile");
      navigate("/login");
    }
  }, [user, token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nit-red mx-auto mb-4"></div>
          <p className="text-nit-dark-purple">Loading profile...</p>
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
              <button
                onClick={() => navigate("/student-dashboard")}
                className="text-nit-red hover:text-red-700 font-medium"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-nit-navy">
                Student Profile
              </h1>
            </div>
            <div className="flex space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-nit-red text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="border border-gray-400 text-gray-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gradient-to-br from-nit-red to-red-700 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-3xl">
                {profileData.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-nit-navy">
                {profileData.name}
              </h2>
              <p className="text-nit-dark-purple text-lg">
                {profileData.studentId || "Student ID not set"}
              </p>
              <p className="text-gray-600">
                {profileData.department || "Department not set"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-nit-navy mb-4">
              Personal Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
                    disabled // Name comes from User model, typically not editable
                  />
                ) : (
                  <p className="text-nit-dark-purple">{profileData.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
                    disabled // Email comes from User model, typically not editable
                  />
                ) : (
                  <p className="text-nit-dark-purple">{profileData.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
                    placeholder="+91 9876543210"
                    required
                  />
                ) : (
                  <p className="text-nit-dark-purple">
                    {profileData.phone || "Not provided"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-nit-navy mb-4">
              Academic Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.studentId}
                    onChange={(e) =>
                      handleInputChange("studentId", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
                    placeholder="20CS1234"
                    required
                  />
                ) : (
                  <p className="text-nit-dark-purple">
                    {profileData.studentId || "Not provided"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                {isEditing ? (
                  <select
                    value={profileData.department}
                    onChange={(e) =>
                      handleInputChange("department", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science & Engineering">
                      Computer Science & Engineering
                    </option>
                    <option value="Electronics & Communication Engineering">
                      Electronics & Communication Engineering
                    </option>
                    <option value="Electrical & Electronics Engineering">
                      Electrical & Electronics Engineering
                    </option>
                    <option value="Mechanical Engineering">
                      Mechanical Engineering
                    </option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Chemical Engineering">
                      Chemical Engineering
                    </option>
                    <option value="Metallurgical & Materials Engineering">
                      Metallurgical & Materials Engineering
                    </option>
                    <option value="Biotechnology">Biotechnology</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                  </select>
                ) : (
                  <p className="text-nit-dark-purple">
                    {profileData.department || "Not provided"}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year *
                  </label>
                  {isEditing ? (
                    <select
                      value={profileData.year}
                      onChange={(e) =>
                        handleInputChange("year", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
                      required
                    >
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  ) : (
                    <p className="text-nit-dark-purple">
                      {profileData.year
                        ? `${profileData.year}${getOrdinalSuffix(
                            profileData.year
                          )} Year`
                        : "Not provided"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CGPA *
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={profileData.cgpa}
                      onChange={(e) =>
                        handleInputChange("cgpa", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
                      placeholder="8.75"
                      required
                    />
                  ) : (
                    <p className="text-nit-dark-purple">
                      {profileData.cgpa || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-nit-navy mb-4">Address</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.address.street}
                    onChange={(e) =>
                      handleInputChange("address.street", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
                    placeholder="123 Main Street"
                  />
                ) : (
                  <p className="text-nit-dark-purple">
                    {profileData.address.street || "Not provided"}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.address.city}
                      onChange={(e) =>
                        handleInputChange("address.city", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
                      placeholder="Warangal"
                    />
                  ) : (
                    <p className="text-nit-dark-purple">
                      {profileData.address.city || "Not provided"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.address.state}
                      onChange={(e) =>
                        handleInputChange("address.state", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
                      placeholder="Telangana"
                    />
                  ) : (
                    <p className="text-nit-dark-purple">
                      {profileData.address.state || "Not provided"}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.address.pincode}
                    onChange={(e) =>
                      handleInputChange("address.pincode", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
                    placeholder="506004"
                  />
                ) : (
                  <p className="text-nit-dark-purple">
                    {profileData.address.pincode || "Not provided"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-nit-navy mb-4">Skills</h3>
            <div className="space-y-4">
              {/* Skills Display */}
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm ${
                      isEditing
                        ? "bg-red-100 text-red-800 cursor-pointer hover:bg-red-200"
                        : "bg-blue-100 text-blue-800"
                    }`}
                    onClick={
                      isEditing ? () => handleRemoveSkill(skill) : undefined
                    }
                  >
                    {skill}
                    {isEditing && <span className="ml-2">×</span>}
                  </span>
                ))}
                {profileData.skills.length === 0 && (
                  <p className="text-gray-500 italic">No skills added yet</p>
                )}
              </div>

              {/* Add Skill Input (only in edit mode) */}
              {isEditing && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                    placeholder="Add a skill..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
                  />
                  <button
                    onClick={handleAddSkill}
                    className="bg-nit-red text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              )}

              {isEditing && (
                <p className="text-sm text-gray-600">
                  Click on skills to remove them, or add new ones above
                </p>
              )}
            </div>
          </div>

          {/* Resume */}
          <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
            <h3 className="text-xl font-bold text-nit-navy mb-4">Resume</h3>
            <div className="space-y-4">
              {/* Current Resume */}
              {profileData.resume.filename && profileData.resume.url && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-red-600 text-lg">📄</span>
                    </div>
                    <div>
                      <p className="font-medium text-nit-navy">
                        {profileData.resume.filename}
                      </p>
                      <p className="text-sm text-gray-600">
                        Uploaded on{" "}
                        {new Date(
                          profileData.resume.uploadDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <a
                      href={profileData.resume.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View
                    </a>
                    <a
                      href={profileData.resume.url}
                      download={profileData.resume.filename}
                      className="text-green-600 hover:text-green-800 font-medium"
                    >
                      Download
                    </a>
                  </div>
                </div>
              )}

              {/* Upload New Resume (only in edit mode) */}
              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {profileData.resume.filename
                      ? "Upload New Resume"
                      : "Upload Resume"}
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
                    />
                    {selectedFile && (
                      <span className="text-green-600 font-medium">
                        ✓ {selectedFile.name}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Only PDF files are allowed. Max size: 5MB
                  </p>
                </div>
              )}

              {/* No Resume Message */}
              {!profileData.resume.filename && !isEditing && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📄</div>
                  <p>No resume uploaded yet</p>
                  <p className="text-sm">
                    Click "Edit Profile" to upload your resume
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Mode Instructions */}
        {isEditing && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-blue-600 text-xl">💡</div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Editing Tips:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Fields marked with * are required</li>
                  <li>
                    • Name and email cannot be changed (contact admin if needed)
                  </li>
                  <li>
                    • Click on skills to remove them, or add new ones using the
                    input field
                  </li>
                  <li>
                    • Upload a new resume to replace the existing one (PDF only,
                    max 5MB)
                  </li>
                  <li>
                    • Don't forget to click "Save Changes" when you're done!
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Profile Completion Status */}
        {!isEditing && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-nit-navy mb-4">
              Profile Completion
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Profile Completion</span>
                <span className="font-bold text-nit-red">
                  {calculateProfileCompletion()}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-nit-red to-red-700 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${calculateProfileCompletion()}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600">
                {getIncompleteFields().length > 0 ? (
                  <div>
                    <p className="mb-2">Missing information:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {getIncompleteFields().map((field, index) => (
                        <li key={index}>{field}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-green-600">✓ Profile is complete!</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Helper function to get ordinal suffix
  function getOrdinalSuffix(num) {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  }

  // Helper function to calculate profile completion percentage
  function calculateProfileCompletion() {
    const requiredFields = [
      profileData.studentId,
      profileData.phone,
      profileData.department,
      profileData.year,
      profileData.cgpa,
      profileData.address.city,
      profileData.address.state,
    ];

    const optionalFields = [
      profileData.address.street,
      profileData.address.pincode,
      profileData.skills.length > 0,
      profileData.resume.filename,
    ];

    const completedRequired = requiredFields.filter(
      (field) => field && field.toString().trim()
    ).length;
    const completedOptional = optionalFields.filter((field) => field).length;

    // Required fields are worth 80%, optional fields are worth 20%
    const requiredPercentage = (completedRequired / requiredFields.length) * 80;
    const optionalPercentage = (completedOptional / optionalFields.length) * 20;

    return Math.round(requiredPercentage + optionalPercentage);
  }

  // Helper function to get incomplete fields
  function getIncompleteFields() {
    const incomplete = [];

    if (!profileData.studentId) incomplete.push("Student ID");
    if (!profileData.phone) incomplete.push("Phone Number");
    if (!profileData.department) incomplete.push("Department");
    if (!profileData.year) incomplete.push("Year");
    if (!profileData.cgpa) incomplete.push("CGPA");
    if (!profileData.address.city) incomplete.push("City");
    if (!profileData.address.state) incomplete.push("State");
    if (!profileData.address.street) incomplete.push("Street Address");
    if (!profileData.address.pincode) incomplete.push("Pincode");
    if (profileData.skills.length === 0) incomplete.push("Skills");
    if (!profileData.resume.filename) incomplete.push("Resume");

    return incomplete;
  }
};

export default StudentProfile;
