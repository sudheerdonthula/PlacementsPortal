import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { toast } from "react-hot-toast";

const JobDetails = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [jobData, setJobData] = useState(null);
  const [isApplied, setIsApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [backUrl, setBackUrl] = useState("/student-dashboard");

  // Helper function to safely check if user owns this job
  const isJobOwner = () => {
    if (!user || !jobData) return false;
    if (user.role === "company") {
      return (
        user.companyProfile?._id === jobData.company?._id ||
        user._id === jobData.company?._id ||
        user.id === jobData.company?._id
      );
    }
    return false;
  };

  useEffect(() => {
    if (user?.role === "company") {
      setBackUrl("/company-dashboard");
    } else if (user?.role === "admin") {
      setBackUrl("/admin-dashboard");
    } else {
      setBackUrl("/student-dashboard");
    }
  }, [user]);

  useEffect(() => {
    fetchJobDetails();
    if (user?.role === "student") {
      checkApplicationStatus();
    }
    // eslint-disable-next-line
  }, [jobId, user]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/jobs/${jobId}`);
      if (response.data.success) {
        setJobData(response.data.data);
      } else {
        throw new Error("Failed to fetch job details");
      }
    } catch (error) {
      toast.error("Error loading job details");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const response = await api.get(`/applications/check/${jobId}`);
      if (response.data.success) {
        setIsApplied(response.data.isApplied);
      }
    } catch (error) {
      setIsApplied(false);
    }
  };

  const handleApply = async () => {
    try {
      setApplying(true);
      const response = await api.post("/applications", {
        jobId: jobId,
      });
      if (response.data.success) {
        setIsApplied(true);
        setShowApplyModal(false);
        toast.success("Application submitted successfully!");
      } else {
        throw new Error(response.data.message || "Failed to submit application");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error submitting application");
    } finally {
      setApplying(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getJobTypeLabel = (type) => {
    const labels = {
      "full-time": "Full Time",
      "part-time": "Part Time",
      internship: "Internship",
      contract: "Contract",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nit-red mx-auto mb-4"></div>
          <p className="text-nit-dark-purple">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-nit-navy mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-4">The job you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(backUrl)}
            className="bg-nit-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Dashboard
          </button>
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
                onClick={() => navigate(backUrl)}
                className="text-nit-red hover:text-red-700 font-medium"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-nit-navy">
                {user?.role === "company" ? "Job Overview" : "Job Details"}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              {/* Student-specific header actions */}
              {user?.role === "student" && isApplied && (
                <Link
                  to={`/job-status/${jobId}`}
                  className="border border-blue-500 text-blue-500 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  View Application Status
                </Link>
              )}

              {/* Company-specific header actions */}
              {user?.role === "company" && isJobOwner() && (
                <div className="flex space-x-2">
                  <Link
                    to={`/job-applications/${jobId}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    View Applications ({jobData.currentApplicationCount || 0})
                  </Link>
                  <Link
                    to={`/edit-job/${jobId}`}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Edit Job
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Job Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              <img
                src={
                  jobData.companyId?.logo ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    jobData.companyId?.companyName || "Company"
                  )}&background=1e40af&color=fff`
                }
                alt={jobData.companyId?.companyName || "Company"}
                className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    jobData.companyId?.companyName || "Company"
                  )}&background=1e40af&color=fff`;
                }}
              />
              <div>
                <h2 className="text-3xl font-bold text-nit-navy mb-2">
                  {jobData.title}
                </h2>
                <p className="text-xl text-nit-dark-purple mb-1">
                  {jobData.companyId?.companyName || "Company Name"}
                </p>
                <p className="text-gray-600 mb-2">{jobData.role}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">📍 {jobData.location}</span>
                  <span className="flex items-center">
                    💼 {getJobTypeLabel(jobData.jobType)}
                  </span>
                  <span className="flex items-center">
                    👥 {jobData.currentApplicationCount || 0} applications
                  </span>
                </div>
              </div>
            </div>

            {/* Role-based Action Buttons */}
            <div className="text-right">
              {user?.role === "company" && (
                <div className="space-y-2">
                  <div
                    className={`px-4 py-2 rounded-lg font-medium ${
                      jobData.jobStatus === "open"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    Status:{" "}
                    {jobData.jobStatus?.charAt(0).toUpperCase() +
                      jobData.jobStatus?.slice(1)}
                  </div>
                  <p className="text-sm text-gray-600">
                    Posted: {new Date(jobData.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-nit-navy mb-4">
                Job Description
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {jobData.description}
              </p>
            </div>

            {/* Requirements */}
            {jobData.requirements && jobData.requirements.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-nit-navy mb-4">
                  Requirements
                </h3>
                <ul className="space-y-2">
                  {jobData.requirements.map((req, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-nit-red mt-1">•</span>
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Responsibilities */}
            {jobData.responsibilities && jobData.responsibilities.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-nit-navy mb-4">
                  Responsibilities
                </h3>
                <ul className="space-y-2">
                  {jobData.responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-nit-red mt-1">•</span>
                      <span className="text-gray-700">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recruitment Process */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-nit-navy mb-4">
                🔄 Recruitment Process
              </h3>
              <div className="space-y-4">
                {jobData.recruitmentProcess?.map((stage, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-nit-red text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-nit-navy">
                        {stage.stageName}
                      </h4>
                      <p className="text-gray-600 text-sm mb-1">
                        {stage.description}
                      </p>
                      <p className="text-gray-500 text-xs">
                        📅 {new Date(stage.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Company Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-nit-navy mb-4">
                About {jobData.companyId?.companyName || "Company"}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {jobData.companyId?.description || "Company information not available."}
              </p>
              {jobData.companyId?.website && (
                <a
                  href={jobData.companyId.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Visit Company Website →
                </a>
              )}
            </div>

            {/* Documents */}
            {jobData.documents && jobData.documents.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-nit-navy mb-4">
                  Documents
                </h3>
                <div className="space-y-3">
                  {jobData.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <span className="text-red-600">📄</span>
                        </div>
                        <div>
                          <p className="font-medium text-nit-navy">
                            {doc.filename}
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {doc.type?.replace("-", " ") || "Document"}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          View
                        </a>
                        <a
                          href={doc.url}
                          download={doc.filename}
                          className="text-green-600 hover:text-green-800 font-medium text-sm"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Company-only: Application Statistics */}
            {user?.role === "company" && isJobOwner() && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-nit-navy mb-4">
                  Application Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {jobData.currentApplicationCount || 0}
                    </p>
                    <p className="text-sm text-gray-600">Total Applications</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {jobData.shortlistedCount || 0}
                    </p>
                    <p className="text-sm text-gray-600">Shortlisted</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">
                      {jobData.interviewCount || 0}
                    </p>
                    <p className="text-sm text-gray-600">In Interview</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {jobData.selectedCount || 0}
                    </p>
                    <p className="text-sm text-gray-600">Selected</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* CTC Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-nit-navy mb-4">
                💰 Compensation
              </h3>
              <div className="space-y-3">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total CTC</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(jobData.ctc?.total || 0)}
                  </p>
                </div>
                {jobData.ctc?.breakdown && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Salary:</span>
                      <span className="font-medium">
                        {formatCurrency(jobData.ctc.breakdown.baseSalary || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bonus:</span>
                      <span className="font-medium">
                        {formatCurrency(jobData.ctc.breakdown.bonus || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Benefits:</span>
                      <span className="font-medium">
                        {formatCurrency(jobData.ctc.breakdown.benefits || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Other:</span>
                      <span className="font-medium">
                        {formatCurrency(jobData.ctc.breakdown.other || 0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Eligibility Criteria */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-nit-navy mb-4">
                📋 Eligibility
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Min CGPA:</span>
                  <span className="ml-2 font-medium">
                    {jobData.eligibilityCriteria?.minCGPA || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Departments:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {jobData.eligibilityCriteria?.departments?.map(
                      (dept, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                        >
                          {dept}
                        </span>
                      )
                    ) || (
                      <span className="text-gray-500">Not specified</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Year:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {jobData.eligibilityCriteria?.year?.map((year, index) => (
                      <span
                        key={index}
                        className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs"
                      >
                        {year}th Year
                      </span>
                    )) || (
                      <span className="text-gray-500">Not specified</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Required Skills:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {jobData.eligibilityCriteria?.skills?.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs"
                      >
                        {skill}
                      </span>
                    )) || (
                      <span className="text-gray-500">Not specified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Job Statistics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-nit-navy mb-4">
                📊 Job Stats
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Applications:</span>
                  <span className="font-medium">
                    {jobData.currentApplicationCount || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Rounds:</span>
                  <span className="font-medium">{jobData.totalRounds || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`font-medium capitalize ${
                      jobData.jobStatus === "open"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {jobData.jobStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted:</span>
                  <span className="font-medium">
                    {new Date(jobData.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deadline:</span>
                  <span className="font-medium">
                    {new Date(jobData.applicationDeadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Role-based Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-nit-navy mb-4">
                🔗 Quick Actions
              </h3>
              <div className="space-y-3">
                {user?.role === "student" && (
                  <>
                    <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-blue-600">📧</span>
                      <span className="ml-2 text-sm">Contact HR</span>
                    </button>
                    <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-green-600">💾</span>
                      <span className="ml-2 text-sm">Save Job</span>
                    </button>
                    <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-purple-600">📤</span>
                      <span className="ml-2 text-sm">Share Job</span>
                    </button>
                    <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-red-600">🚨</span>
                      <span className="ml-2 text-sm">Report Issue</span>
                    </button>
                  </>
                )}

                {user?.role === "company" && isJobOwner() && (
                  <>
                    <Link
                      to={`/job-applications/${jobId}`}
                      className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors block"
                    >
                      <span className="text-blue-600">👥</span>
                      <span className="ml-2 text-sm">Manage Applications</span>
                    </Link>
                    <Link
                      to={`/edit-job/${jobId}`}
                      className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors block"
                    >
                      <span className="text-green-600">✏️</span>
                      <span className="ml-2 text-sm">Edit Job Details</span>
                    </Link>
                    <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-purple-600">📊</span>
                      <span className="ml-2 text-sm">View Analytics</span>
                    </button>
                    <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-orange-600">📢</span>
                      <span className="ml-2 text-sm">Promote Job</span>
                    </button>
                  </>
                )}

                {user?.role === "admin" && (
                  <>
                    <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-blue-600">👥</span>
                      <span className="ml-2 text-sm">View All Applications</span>
                    </button>
                    <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-green-600">✅</span>
                      <span className="ml-2 text-sm">Approve/Reject Job</span>
                    </button>
                    <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-purple-600">📊</span>
                      <span className="ml-2 text-sm">Job Analytics</span>
                    </button>
                    <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-red-600">🚨</span>
                      <span className="ml-2 text-sm">Flag Job</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Company-only: Job Management */}
            {user?.role === "company" && isJobOwner() && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-nit-navy mb-4">
                  ⚙️ Job Management
                </h3>
                <div className="space-y-3">
                  <button
                    className={`w-full p-3 rounded-lg font-medium transition-colors ${
                      jobData.jobStatus === "open"
                        ? "bg-red-100 text-red-800 hover:bg-red-200"
                        : "bg-green-100 text-green-800 hover:bg-green-200"
                    }`}
                  >
                    {jobData.jobStatus === "open"
                      ? "⏸️ Close Applications"
                      : "▶️ Open Applications"}
                  </button>
                  <button className="w-full p-3 bg-blue-100 text-blue-800 rounded-lg font-medium hover:bg-blue-200 transition-colors">
                    📋 Clone Job Posting
                  </button>
                  <button className="w-full p-3 bg-yellow-100 text-yellow-800 rounded-lg font-medium hover:bg-yellow-200 transition-colors">
                    📤 Export Applications
                  </button>
                  <button className="w-full p-3 bg-red-100 text-red-800 rounded-lg font-medium hover:bg-red-200 transition-colors">
                    🗑️ Delete Job
                  </button>
                </div>
              </div>
            )}

            {/* Admin-only: Job Control Panel */}
            {user?.role === "admin" && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-nit-navy mb-4">
                  🛠️ Admin Controls
                </h3>
                <div className="space-y-3">
                  <button className="w-full p-3 bg-green-100 text-green-800 rounded-lg font-medium hover:bg-green-200 transition-colors">
                    ✅ Approve Job
                  </button>
                  <button className="w-full p-3 bg-red-100 text-red-800 rounded-lg font-medium hover:bg-red-200 transition-colors">
                    ❌ Reject Job
                  </button>
                  <button className="w-full p-3 bg-blue-100 text-blue-800 rounded-lg font-medium hover:bg-blue-200 transition-colors">
                    📝 Request Changes
                  </button>
                  <button className="w-full p-3 bg-yellow-100 text-yellow-800 rounded-lg font-medium hover:bg-yellow-200 transition-colors">
                    🔒 Suspend Job
                  </button>
                  <button className="w-full p-3 bg-purple-100 text-purple-800 rounded-lg font-medium hover:bg-purple-200 transition-colors">
                    📊 Generate Report
                  </button>
                </div>
              </div>
            )}

            {/* Contact Information */}
            {(user?.role === "student" || user?.role === "admin") && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-nit-navy mb-4">
                  📞 Contact Info
                </h3>
                <div className="space-y-3 text-sm">
                  {jobData.company?.contactPerson && (
                    <div>
                      <span className="text-gray-600">Contact Person:</span>
                      <p className="font-medium">{jobData.company.contactPerson}</p>
                    </div>
                  )}
                  {jobData.company?.email && (
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium">
                        <a
                          href={`mailto:${jobData.company.email}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {jobData.company.email}
                        </a>
                      </p>
                    </div>
                  )}
                  {jobData.company?.phone && (
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <p className="font-medium">
                        <a
                          href={`tel:${jobData.company.phone}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {jobData.company.phone}
                        </a>
                      </p>
                    </div>
                  )}
                  {jobData.company?.address && (
                    <div>
                      <span className="text-gray-600">Address:</span>
                      <p className="font-medium">{jobData.company.address}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student-only Apply Modal */}
      {user?.role === "student" && showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-nit-navy mb-4">
              Confirm Application
            </h3>
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                You are about to apply for:
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-nit-navy">{jobData.title}</p>
                <p className="text-gray-600">{jobData.company?.name}</p>
              </div>
            </div>

            {/* Application Requirements Checklist */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                Before you apply, ensure you have:
              </h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>✓ Updated your profile completely</li>
                <li>✓ Uploaded your latest resume</li>
                <li>✓ Read all job requirements carefully</li>
                <li>✓ Checked the recruitment process timeline</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> Once you apply, you cannot withdraw your
                application. Make sure you meet all requirements and are genuinely
                interested in this position.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowApplyModal(false)}
                disabled={applying}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying}
                className="flex-1 bg-nit-red text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {applying ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Applying...
                  </div>
                ) : (
                  "Confirm Apply"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
