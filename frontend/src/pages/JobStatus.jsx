import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const JobStatus = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  // Get data from router state
  const { applicationData, jobData } = location.state || {};
  console.log("applicationData:", applicationData);
  console.log("jobData:", jobData);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const getStageStatus = (stageOrder, currentRound) => {
    if (stageOrder < currentRound) return "completed";
    if (stageOrder === currentRound) return "current";
    return "upcoming";
  };

  const getStageColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "current":
        return "bg-blue-500";
      default:
        return "bg-gray-300";
    }
  };

  const getStageIcon = (status) => {
    switch (status) {
      case "completed":
        return "✓";
      case "current":
        return "🔄";
      default:
        return "⏳";
    }
  };

  const getStatusBadge = (applicationStatus) => {
    const badges = {
      "in-progress": "bg-blue-100 text-blue-800",
      accepted: "bg-green-100 text-green-800",
      selected: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };

    const labels = {
      "in-progress": "In Progress",
      accepted: "Accepted",
      selected: "Selected",
      rejected: "Rejected",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${badges[applicationStatus]}`}
      >
        {labels[applicationStatus]}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

 
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nit-red mx-auto mb-4"></div>
          <p className="text-nit-dark-purple">Loading job status...</p>
        </div>
      </div>
    );
  }

  // If no data passed (direct URL access), show error
  if (!applicationData || !jobData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-nit-navy mb-2">
            Job Status Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            Please access job status from your dashboard.
          </p>
          <button
            onClick={() => navigate("/student-dashboard")}
            className="bg-nit-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalStages = applicationData.totalRounds || 0;
  const currentRound = applicationData.currentRound || 1;

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
                Application Status
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Job Info Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-nit-navy mb-2">
                {jobData.title}
              </h2>
              <p className="text-xl text-nit-dark-purple mb-1">
                {jobData.companyId?.companyName}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <span>
                  💰 ₹{jobData.ctc?.total} LPA
                </span>
                <span>📍 {jobData.location}</span>
              </div>
            </div>
            <div className="text-right">
              {getStatusBadge(applicationData.applicationStatus)}
              <p className="text-sm text-gray-600 mt-2">
                Applied on{" "}
                {formatDate(
                  applicationData.createdAt || applicationData.applicationDate
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-nit-navy">
              Progress Overview
            </h3>
            <div className="text-right">
              <p className="text-2xl font-bold text-nit-red">
                {currentRound}/{totalStages}
              </p>
              <p className="text-sm text-gray-600">Stages Completed</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-nit-red to-red-600 h-3 rounded-full transition-all duration-500"
              style={{
                width: `${
                  totalStages > 0
                    ? ( currentRound  / totalStages) * 100
                    : 0
                }%`,
              }}
            ></div>
          </div>

          <p className="text-center text-gray-600">
            {currentRound == totalStages
              ? "All stages completed! 🎉"
              : `${Math.max(
                  0,
                  totalStages - currentRound 
                )} stages remaining`}
          </p>
        </div>

        {/* Stages Timeline */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-nit-navy mb-6">
            Recruitment Timeline
          </h3>

          <div className="space-y-6">
            {applicationData.jobOfferId.recruitmentProcess?.map((stage, index) => {
              const stageStatus = getStageStatus(
                stage.stageOrder,
                currentRound
              );

              return (
                <div key={stage._id} className="flex items-start space-x-4">
                  {/* Stage Number & Status Indicator */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getStageColor(
                        stageStatus
                      )}`}
                    >
                      {stage.stageOrder}
                    </div>
                    {index < applicationData.jobOfferId.recruitmentProcess.length - 1 && (
                      <div className="w-1 h-16 bg-gray-200 mt-2"></div>
                    )}
                  </div>

                  {/* Stage Details */}
                  <div className="flex-1 pb-8">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-nit-navy">
                        {stage.stageName}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">
                          {getStageIcon(stageStatus)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-sm font-medium ${
                            stageStatus === "completed"
                              ? "bg-green-100 text-green-800"
                              : stageStatus === "current"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {stageStatus === "completed"
                            ? "Passed"
                            : stageStatus === "current"
                            ? "Current"
                            : "Upcoming"}
                        </span>
                      </div>
                    </div>

                    {stage.description && (
                      <p className="text-gray-600 mb-3">{stage.description}</p>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                      <span>📅 {formatDate(stage.date)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Stage Info */}
        {applicationData.applicationStatus === "in-progress" && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mt-8">
            <div className="flex items-start space-x-4">
              <div className="text-blue-600 text-2xl">🎯</div>
              <div>
                <h4 className="font-bold text-blue-900 mb-2">Current Stage</h4>
                {applicationData.jobOfferId.recruitmentProcess
                  ?.filter((stage) => stage.stageOrder === currentRound)
                  .map((currentStage) => (
                    <div key={currentStage._id}>
                      <p className="text-blue-800 mb-2">
                        <strong>Stage:</strong> {currentStage.stageName}
                      </p>
                      <p className="text-blue-700 text-sm mb-2">
                        📅 Scheduled for: {formatDate(currentStage.date)}
                      </p>
                      {currentStage.description && (
                        <p className="text-blue-700 text-sm">
                          📝 {currentStage.description}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Final Result */}
        {(applicationData.applicationStatus === "accepted" ||
          applicationData.applicationStatus === "selected") && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6 mt-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">
                Congratulations! You've been selected!
              </h3>
              <p className="text-green-700 mb-4">
                You have successfully completed the recruitment process for{" "}
                {jobData.title} at {jobData.companyId?.companyName}.
              </p>
            </div>
          </div>
        )}

        {applicationData.applicationStatus === "rejected" && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200 p-6 mt-8">
            <div className="text-center">
              <div className="text-4xl mb-4">😔</div>
              <h3 className="text-xl font-bold text-red-800 mb-2">
                Application Not Selected
              </h3>
              <p className="text-red-700 mb-4">
                Unfortunately, your application for {jobData.title} at{" "}
                {jobData.companyId?.companyName} was not selected at this time.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => navigate("/student-dashboard")}
                  className="bg-nit-red text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Explore Other Opportunities
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h3 className="text-lg font-bold text-nit-navy mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">📧</div>
              <h4 className="font-medium text-nit-navy mb-1">Email Support</h4>
              <p className="text-sm text-gray-600">placement@nitw.ac.in</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">📞</div>
              <h4 className="font-medium text-nit-navy mb-1">Phone Support</h4>
              <p className="text-sm text-gray-600">+91-870-2462-651</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">🏢</div>
              <h4 className="font-medium text-nit-navy mb-1">Visit Office</h4>
              <p className="text-sm text-gray-600">
                Placement Cell, NIT Warangal
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobStatus;
