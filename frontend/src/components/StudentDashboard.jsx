import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active-jobs");
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [studentApplications, setStudentApplications] = useState([]);

  useEffect(() => {
    fetchJobs();
    fetchStudentApplications();
  }, []);

  const fetchStudentApplications = async () => {
    try {
      const response = await api.get("/applications/my-applications");
      setStudentApplications(response.data.data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/jobs");
      setAllJobs(response.data.jobs || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleApply = async (jobId) => {
    try {
      setApplying(jobId);
      const response = await api.post(`/applications/apply/${jobId}`);
      toast.success("Application submitted successfully!");
      setStudentApplications((prev) => [...prev, { jobOfferId: jobId }]);
    } catch (error) {
      console.error("Error applying for job:", error);
      toast.error(error.response?.data?.message || "Failed to apply for job");
    } finally {
      setApplying(null);
    }
  };

  const isJobExpired = (job) => {
    return (
      new Date(job.applicationDeadline) < new Date() ||
      job.jobStatus === "completed"
    );
  };

  const appliedJobIds = new Set(
    studentApplications.map((app) => app.jobOfferId._id)
  );
  const enhancedJobs = allJobs.map((job) => ({
    ...job,
    isApplied: appliedJobIds.has(job._id),
  }));

  const expiredJobs = enhancedJobs.filter(isJobExpired);
  const activeJobs = enhancedJobs.filter((job) => !isJobExpired(job));
  const unappliedJobs = activeJobs.filter((job) => !job.isApplied);

  const appliedJobsWithDetails = studentApplications
    .map((application) => {
      const job = allJobs.find((job) => job._id === application.jobOfferId._id);
      return job ? { ...job, applicationDetails: application } : null;
    })
    .filter(Boolean)
    .filter((job) => !isJobExpired(job.applicationDeadline));

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "rejected":
        return (
          <span className="inline-flex items-center bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
            ❌ Rejected
          </span>
        );
      case "selected":
      case "accepted":
        return (
          <span className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
            ✅ Accepted
          </span>
        );
      case "in-progress":
      default:
        return (
          <span className="inline-flex items-center bg-yellow-50 text-yellow-800 px-2 py-1 rounded text-sm">
            🔄 In Progress
          </span>
        );
    }
  };

  const handleViewStatus = (job) => {
    navigate(`/job-status/${job._id}`, {
      state: {
        applicationData: job.applicationDetails,
        jobData: job,
      },
    });
  };

  const renderActiveJobs = () => (
    <div className="space-y-8">
      {/* Applied Jobs Section */}
      <div>
        <h3 className="text-xl font-bold text-nit-navy mb-4">
          📝 Applied Jobs ({appliedJobsWithDetails.length})
        </h3>
        {appliedJobsWithDetails.length > 0 ? (
          <div className="grid gap-4">
            {appliedJobsWithDetails.map((job) => (
              <div key={job._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-nit-navy">
                        {job.title}
                      </h4>
                      {getStatusBadge(
                        job.applicationDetails?.applicationStatus
                      )}
                    </div>
                    <p className="text-nit-dark-purple">
                      {job.companyId?.companyName}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span>
                        💰 ₹{job.ctc?.total} LPA
                      </span>
                      <span>📍 {job.location}</span>
                      <span>
                        ⏰ Deadline: {formatDate(job.applicationDeadline)}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleViewStatus(job)}
                      className="bg-nit-red text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      View Status
                    </button>
                    <Link
                      to={`/job-details/${job._id}`}
                      className="border border-nit-red text-nit-red px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors"
                    >
                      View Job Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow-md">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-gray-600">No applied jobs yet</p>
          </div>
        )}
      </div>

      {/* Unapplied Jobs Section */}
      <div>
        <h3 className="text-xl font-bold text-nit-navy mb-4">
          💼 Available Jobs ({unappliedJobs.length})
        </h3>
        {unappliedJobs.length > 0 ? (
          <div className="grid gap-4">
            {unappliedJobs.map((job) => (
              <div key={job._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-nit-navy">
                      {job.title}
                    </h4>
                    <p className="text-nit-dark-purple">
                      {job.companyId?.companyName}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span>
                        💰 ₹{job.ctc?.total} LPA
                      </span>
                      <span>📍 {job.location}</span>
                      <span>
                        ⏰ Deadline: {formatDate(job.applicationDeadline)}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Link
                      to={`/job-details/${job._id}`}
                      className="border border-nit-red text-nit-red px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleApply(job._id)}
                      disabled={applying === job._id}
                      className="bg-nit-red text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {applying === job._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Applying...
                        </>
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow-md">
            <div className="text-4xl mb-2">💼</div>
            <p className="text-gray-600">No available jobs at the moment</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderExpiredJobs = () => (
    <div>
      <h3 className="text-xl font-bold text-nit-navy mb-4">
        ⏰ Expired Jobs ({expiredJobs.length})
      </h3>
      {expiredJobs.length > 0 ? (
        <div className="grid gap-4">
          {expiredJobs.map((job) => (
            <div
              key={job._id}
              className="bg-white rounded-lg shadow-md p-6 opacity-75"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-nit-navy">
                    {job.title}
                  </h4>
                  <p className="text-nit-dark-purple">
                    {job.companyId?.companyName}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span>
                      💰 ₹{job.ctc?.total} LPA
                    </span>
                    <span>📍 {job.location}</span>
                    <span>
                      ⏰ Expired: {formatDate(job.applicationDeadline)}
                    </span>
                  </div>
                  <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-sm mt-2">
                    Expired
                  </span>
                </div>
                <div>
                  <Link
                    to={`/job-details/${job._id}`}
                    className="border border-gray-400 text-gray-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <div className="text-4xl mb-2">⏰</div>
          <p className="text-gray-600">No expired jobs</p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nit-red mx-auto mb-4"></div>
          <p className="text-nit-navy font-medium">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2 border-nit-gold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md bg-white">
                <img
                  src="/nitw-logo.png"
                  alt="NIT Warangal Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-nit-navy">
                  NIT Warangal
                </h1>
                <p className="text-nit-lavender text-sm">Student Portal</p>
              </div>
            </Link>
            {/* User Info & Actions */}
            <div className="flex items-center space-x-4">
              {/* Profile Link */}
              <Link
                to="/student-profile"
                className="flex items-center space-x-3 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-nit-red rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || "S"}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-nit-navy">
                    {user?.name || "Student"}
                  </p>
                  <p className="text-xs text-nit-lavender">View Profile</p>
                </div>
              </Link>
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-nit-red text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-nit-navy mb-2">
            Welcome back, {user?.name || "Student"}! 👋
          </h2>
          <p className="text-nit-dark-purple">
            Manage your job applications and explore new opportunities
          </p>
          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg flex items-center space-x-3">
            <span className="text-yellow-800 text-xl">⚠️</span>
            <span className="text-yellow-800 text-sm sm:text-base">
              <b>Note:</b> If you are visiting for the first time, please{" "}
              <Link
                to="/student-profile"
                className="underline text-nit-red hover:text-red-700 font-semibold"
              >
                create or update your profile
              </Link>{" "}
              in the <b>View Profile</b> page using the edit option before applying to jobs.
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-red-100 p-1 rounded-lg max-w-md">
            <button
              onClick={() => setActiveTab("active-jobs")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "active-jobs"
                  ? "bg-white text-nit-red shadow-sm"
                  : "text-nit-dark-purple hover:text-nit-red"
              }`}
            >
              🔥 Active Jobs
            </button>
            <button
              onClick={() => setActiveTab("expired-jobs")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "expired-jobs"
                  ? "bg-white text-nit-red shadow-sm"
                  : "text-nit-dark-purple hover:text-nit-red"
              }`}
            >
              ⏰ Expired Jobs
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "active-jobs" ? renderActiveJobs() : renderExpiredJobs()}
      </div>
    </div>
  );
};

export default StudentDashboard;
