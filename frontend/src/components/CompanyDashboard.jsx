import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { toast } from "react-hot-toast";

const CompanyDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active");
  const [loading, setLoading] = useState(true);
  const [activeJobs, setActiveJobs] = useState([]);
  const [finishedJobs, setFinishedJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/jobs/company");
      if (response.data.success) {
        const jobs = response.data.data;
        const active = jobs.filter(
          (job) => job.jobStatus === "open" || job.jobStatus === "in-progress"
        );
        const finished = jobs.filter(
          (job) => job.jobStatus === "completed" || job.jobStatus === "closed"
        );
        setActiveJobs(active);
        setFinishedJobs(finished);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Error loading jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchJobs();
    toast.success("Jobs refreshed");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getStatusColor = (status) => {
    const colors = {
      open: "bg-nit-red/10 text-nit-red",
      "in-progress": "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getProgressPercentage = (current, total) => {
    return Math.round((current / total) * 100);
  };

  const JobCard = ({ job, isFinished = false }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      {/* Job Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-nit-navy mb-1">{job.title}</h3>
          <p className="text-nit-dark-purple font-medium">{job.role}</p>
          <p className="text-gray-600 text-sm">
            Posted: {new Date(job.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
            job.jobStatus
          )}`}
        >
          {job.jobStatus.replace("-", " ").toUpperCase()}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-nit-navy">
            Round {job.currentRecruitmentStage || 1}/
            {job.totalRounds || job.recruitmentProcess?.length || 1}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-nit-red h-2 rounded-full transition-all duration-300"
            style={{
              width: `${getProgressPercentage(
                job.currentRecruitmentStage || 1,
                job.totalRounds || job.recruitmentProcess?.length || 1
              )}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
        <span>📊 {job.currentApplicationCount || 0} applications</span>
        {isFinished && <span>✅ {job.selectedCount || 0} selected</span>}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Link
          to={`/job-details/${job._id}`}
          className="flex-1 text-center border border-nit-navy text-nit-navy px-4 py-2 rounded-lg font-medium hover:bg-nit-navy hover:text-white transition-colors"
        >
          View Details
        </Link>

        {isFinished ? (
          <Link
            to={`/selection-dashboard/${job._id}`}
            className="flex-1 text-center bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            View Process
          </Link>
        ) : (
          <Link
            to={`/selection-dashboard/${job._id}`}
            className="flex-1 text-center bg-nit-red text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Take Action
          </Link>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nit-red mx-auto mb-4"></div>
          <p className="text-nit-dark-purple">Loading dashboard...</p>
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
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-nit-navy">
                Company Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Create Job Button */}
              <Link
                to="/post-job"
                className="bg-nit-red text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                + Create New Job
              </Link>

              {/* Company Profile Button */}
              <Link
                to="/company-profile"
                className="border border-nit-navy text-nit-navy px-6 py-2 rounded-lg font-medium hover:bg-nit-navy hover:text-white transition-colors"
              >
                Company Profile
              </Link>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="font-medium text-nit-navy">
                    {user?.companyName || user?.name || "Company"}
                  </p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
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

      {/* Note for first-time users */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg flex items-center space-x-3">
          <span className="text-yellow-800 text-xl">⚠️</span>
          <span className="text-yellow-800 text-sm sm:text-base">
            <b>Note:</b> If you are visiting for the first time, please{" "}
            <Link
              to="/company-profile"
              className="underline text-nit-red hover:text-red-700 font-semibold"
            >
              create or update your company profile
            </Link>{" "}
            in the <b>Company Profile</b> page using the edit option before
            posting jobs.
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("active")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "active"
                    ? "border-nit-red text-nit-red"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Active Jobs ({activeJobs.length})
              </button>
              <button
                onClick={() => setActiveTab("finished")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "finished"
                    ? "border-nit-red text-nit-red"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Finished Jobs ({finishedJobs.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === "active" ? (
            activeJobs && activeJobs.length > 0 ? (
              activeJobs.map((job) => (
                <JobCard key={job._id} job={job} isFinished={false} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-nit-navy mb-2">
                  No Active Jobs
                </h3>
                <p className="text-gray-600 mb-4">
                  Start by creating your first job posting
                </p>
                <Link
                  to="/post-job"
                  className="bg-nit-red text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Create New Job
                </Link>
              </div>
            )
          ) : finishedJobs && finishedJobs.length > 0 ? (
            finishedJobs.map((job) => (
              <JobCard key={job._id} job={job} isFinished={true} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-nit-navy mb-2">
                No Finished Jobs
              </h3>
              <p className="text-gray-600">
                Completed job postings will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
