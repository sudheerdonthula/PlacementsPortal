import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import api from "../utils/api";

const CompanyStudentProfile = () => {
  const { token } = useAuth();
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
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

  useEffect(() => {
    if (token && studentId) {
      fetchProfileData();
    }
    // eslint-disable-next-line
  }, [token, studentId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/student/profile?studentId=${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        const studentData = response.data.data;
        setProfileData({
          name: studentData.userId?.name || "",
          email: studentData.userId?.email || "",
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
        });
      } else {
        toast.error("Could not fetch student profile");
      }
    } catch (error) {
      toast.error("Error fetching profile");
    } finally {
      setLoading(false);
    }
  };

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
                onClick={() => navigate(-1)}
                className="text-nit-red hover:text-red-700 font-medium"
              >
                ← Back to Round Management
              </button>
              <h1 className="text-2xl font-bold text-nit-navy">
                Student Profile
              </h1>
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
                <p className="text-nit-dark-purple">{profileData.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-nit-dark-purple">{profileData.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <p className="text-nit-dark-purple">
                  {profileData.phone || "Not provided"}
                </p>
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
                  Student ID
                </label>
                <p className="text-nit-dark-purple">
                  {profileData.studentId || "Not provided"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <p className="text-nit-dark-purple">
                  {profileData.department || "Not provided"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <p className="text-nit-dark-purple">
                    {profileData.year
                      ? `${profileData.year}${getOrdinalSuffix(profileData.year)} Year`
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CGPA
                  </label>
                  <p className="text-nit-dark-purple">
                    {profileData.cgpa || "Not provided"}
                  </p>
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
                <p className="text-nit-dark-purple">
                  {profileData.address.street || "Not provided"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <p className="text-nit-dark-purple">
                    {profileData.address.city || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <p className="text-nit-dark-purple">
                    {profileData.address.state || "Not provided"}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode
                </label>
                <p className="text-nit-dark-purple">
                  {profileData.address.pincode || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-nit-navy mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profileData.skills.length > 0 ? (
                profileData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 italic">No skills added yet</p>
              )}
            </div>
          </div>

          {/* Resume */}
          <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
            <h3 className="text-xl font-bold text-nit-navy mb-4">Resume</h3>
            <div className="space-y-4">
              {profileData.resume.filename && profileData.resume.url ? (
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
                        {profileData.resume.uploadDate
                          ? new Date(profileData.resume.uploadDate).toLocaleDateString()
                          : "N/A"}
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
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📄</div>
                  <p>No resume uploaded yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function getOrdinalSuffix(num) {
    const j = num % 10,
      k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  }
};

export default CompanyStudentProfile;