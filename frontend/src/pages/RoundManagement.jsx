import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../utils/api";

const RoundManagement = () => {
  const { jobId, roundNo } = useParams();
  const navigate = useNavigate();

  const [jobOffer, setJobOffer] = useState(null);

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState([]);

  // Fix: Use URL parameter as source of truth for current round
  const [currentRound, setCurrentRound] = useState(parseInt(roundNo) || 1);

  const [isActiveRound, setIsActiveRound] = useState(false);
  const [isCompletedRound, setIsCompletedRound] = useState(false);

  const [filters, setFilters] = useState({
    status: "all",
    department: "all",
    sortBy: "date",
  });

  // Fix: Separate useEffect for round parameter changes
  useEffect(() => {
    const round = parseInt(roundNo) || 1;
    setCurrentRound(round);
  }, [roundNo]);

  // Fetch round data
  const fetchRoundData = async (roundNum = currentRound) => {
    try {
      setLoading(true);

      const response = await api.get(
        `/applications/job/${jobId}/round/${roundNum}`,
        {
          params: filters,
        }
      );

      if (response.data.success) {
        setApplications(response.data.data);
        setJobOffer(response.data.jobOffer);

        // Fix: Don't override currentRound from API if it conflicts with URL
        const apiCurrentRound = response.data.currentRound;
        const urlRound = parseInt(roundNo) || 1;

        // Only update currentRound if URL round matches API expectation
        if (urlRound === apiCurrentRound || !apiCurrentRound) {
          setCurrentRound(urlRound);
        }

        setIsActiveRound(response.data.isActiveRound);
        setIsCompletedRound(response.data.isCompletedRound);
        setSelectedApplications([]);
      }
    } catch (error) {
      console.error("Error fetching round data:", error);
      toast.error("Failed to fetch round data");

      // Fix: Handle case where round doesn't exist
      if (error.response?.status === 404) {
        toast.error(`Round ${roundNum} not found`);
        navigate(`/selection-dashboard/${jobId}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fix: Separate useEffect for initial load and round changes
  useEffect(() => {
    if (jobId && currentRound) {
      fetchRoundData(currentRound);
    }
  }, [jobId, currentRound]);

  // Fix: Separate useEffect for filter changes (only when not loading)
  useEffect(() => {
    if (jobId && currentRound && !loading) {
      const timeoutId = setTimeout(() => {
        fetchRoundData(currentRound);
      }, 300); // Debounce filter changes

      return () => clearTimeout(timeoutId);
    }
  }, [filters]);

  // Handle checkbox selection
  const handleSelectApplication = (applicationId) => {
    setSelectedApplications((prev) => {
      if (prev.includes(applicationId)) {
        return prev.filter((id) => id !== applicationId);
      } else {
        return [...prev, applicationId];
      }
    });
  };

  // Select all applications
  const handleSelectAll = () => {
    if (selectedApplications.length === applications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(applications.map((app) => app._id));
    }
  };

  // Push selected students to next round
  const handlePushSelected = async () => {
    if (selectedApplications.length === 0) {
      toast.error("Please select at least one student to push to next round");
      return;
    }

    try {
      setActionLoading(true);
      const response = await api.post(
        `/applications/job/${jobId}/push-to-next-round`,
        {
          applicationIds: selectedApplications,
          currentRound: currentRound,
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Fix: Refresh current round data instead of navigating away
        await fetchRoundData(currentRound);
      }
    } catch (error) {
      console.error("Error pushing students:", error);
      toast.error(
        error.response?.data?.message || "Failed to push students to next round"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Reject selected students
  const handleRejectSelected = async () => {
    if (selectedApplications.length === 0) {
      toast.error("Please select at least one student to reject");
      return;
    }

    try {
      setActionLoading(true);
      const response = await api.post(
        `/applications/job/${jobId}/reject-selected`,
        {
          applicationIds: selectedApplications,
          currentRound: currentRound, // Fix: Pass current round
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Fix: Refresh current round data
        await fetchRoundData(currentRound);
      }
    } catch (error) {
      console.error("Error rejecting students:", error);
      toast.error(error.response?.data?.message || "Failed to reject students");
    } finally {
      setActionLoading(false);
    }
  };

  // Advance to next round
  const handleAdvanceRound = async () => {
    try {
      setActionLoading(true);
      const response = await api.post(
        `/applications/job/${jobId}/advance-round`,
        {
          currentRound: currentRound,
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Fix: Navigate back to selection dashboard after advancing
        navigate(`/selection-dashboard/${jobId}`);
      }
    } catch (error) {
      console.error("Error advancing round:", error);
      toast.error(
        error.response?.data?.message || "Failed to advance to next round"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Complete hiring process
  const handleCompleteHiring = async () => {
    try {
      setActionLoading(true);
      const response = await api.post(
        `/applications/job/${jobId}/complete-hiring`
      );

      if (response.data.success) {
        toast.success(response.data.message);
        navigate(`/selection-dashboard/${jobId}`);
      }
    } catch (error) {
      console.error("Error completing hiring:", error);
      toast.error(
        error.response?.data?.message || "Failed to complete hiring process"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "accepted":
      case "selected":
        return "bg-green-100 text-green-800 border border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-200";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">
            Loading round {currentRound} management...
          </p>
        </div>
      </div>
    );
  }

  if (!jobOffer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Job Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The job you're looking for doesn't exist or you don't have access to
            it.
          </p>
          <button
            onClick={() => navigate("/company-dashboard")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isFinalRound = currentRound === jobOffer.totalRounds;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/selection-dashboard/${jobId}`)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Round {currentRound} Management
                </h1>
                <p className="text-gray-600 mt-1">
                  {jobOffer.role} • {jobOffer.companyId?.companyName}
                </p>
                <p className="text-sm text-gray-500">
                  {isActiveRound
                    ? "🟢 Active Round"
                    : isCompletedRound
                    ? "🔴 Completed Round"
                    : "⚪ Round Status Unknown"}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="bg-gray-100 rounded-lg p-4">
                <p className="text-gray-900 font-medium">
                  {jobOffer.jobLocation}
                </p>
                <p className="text-gray-600 text-sm">
                  {isFinalRound
                    ? "Final Round"
                    : `Round ${currentRound} of ${jobOffer.totalRounds}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters - Only show for active rounds */}
        {isActiveRound && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Filter & Search
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status Filter
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="in-progress">In Progress</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department Filter
                  </label>
                  <select
                    value={filters.department}
                    onChange={(e) =>
                      handleFilterChange("department", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Departments</option>
                    <option value="CSE">Computer Science</option>
                    <option value="ECE">Electronics & Communication</option>
                    <option value="EEE">Electrical Engineering</option>
                    <option value="MECH">Mechanical Engineering</option>
                    <option value="CIVIL">Civil Engineering</option>
                    <option value="IT">Information Technology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      handleFilterChange("sortBy", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="date">Application Date</option>
                    <option value="name">Student Name</option>
                    <option value="cgpa">CGPA (High to Low)</option>
                    <option value="department">Department</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons - Only for active rounds */}
        {isActiveRound && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Quick Actions
              </h3>
            </div>
            <div className="p-6">
              {!isFinalRound ? (
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handlePushSelected}
                    disabled={
                      selectedApplications.length === 0 || actionLoading
                    }
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <span className="mr-2">🚀</span>
                    {actionLoading
                      ? "Processing..."
                      : `Push Selected (${selectedApplications.length})`}
                  </button>

                  <button
                    onClick={handleRejectSelected}
                    disabled={
                      selectedApplications.length === 0 || actionLoading
                    }
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <span className="mr-2">❌</span>
                    {actionLoading
                      ? "Processing..."
                      : `Reject Selected (${selectedApplications.length})`}
                  </button>

                  <button
                    onClick={handleAdvanceRound}
                    disabled={actionLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <span className="mr-2">➡️</span>
                    {actionLoading ? "Processing..." : "Advance to Next Round"}
                  </button>
                </div>
              ) : (
                jobOffer.status !== "completed" && (
                  <div className="text-center">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                      <div className="text-4xl mb-3">🏆</div>
                      <h4 className="text-xl font-bold text-yellow-800 mb-2">
                        Final Round
                      </h4>
                      <p className="text-yellow-700">
                        This is the final round. Students here will be
                        automatically accepted when you complete the hiring
                        process.
                      </p>
                    </div>
                    <button
                      onClick={handleCompleteHiring}
                      disabled={actionLoading}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors flex items-center mx-auto"
                    >
                      <span className="mr-3 text-2xl">🎉</span>
                      {actionLoading
                        ? "Completing..."
                        : "Complete Hiring Process"}
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isCompletedRound ? "Rejected Students" : "Students"} - Round{" "}
                  {currentRound}
                  {isFinalRound && " (Final)"}
                </h3>
                <p className="text-gray-600 mt-1">
                  {isCompletedRound
                    ? "Students who were rejected in this round"
                    : isActiveRound
                    ? "Students currently in this round - Select and manage them"
                    : "Students in this round"}
                </p>
              </div>
              {isActiveRound && applications.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                  <span className="text-blue-800 font-medium">
                    {selectedApplications.length} of {applications.length}{" "}
                    selected
                  </span>
                </div>
              )}
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">
                {isCompletedRound ? "📭" : "👥"}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                No students found
              </h3>
              <p className="text-gray-600 text-lg">
                {isCompletedRound
                  ? "No students were rejected in this round"
                  : "No students are currently in this round"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {/* Checkbox column - only for active rounds */}
                    {isActiveRound && !isFinalRound && (
                      <th className="px-6 py-4 text-left">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={
                              selectedApplications.length ===
                                applications.length && applications.length > 0
                            }
                            onChange={handleSelectAll}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            Select All
                          </span>
                        </div>
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Academic Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.map((application, index) => (
                    <tr
                      key={application._id}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedApplications.includes(application._id)
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : ""
                      }`}
                    >
                      {/* Checkbox column - only for active rounds */}
                      {isActiveRound && !isFinalRound && (
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedApplications.includes(
                              application._id
                            )}
                            onChange={() =>
                              handleSelectApplication(application._id)
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                      )}

                      {/* Student Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div
                              className={`h-10 w-10 rounded-full ${
                                index % 4 === 0
                                  ? "bg-purple-500"
                                  : index % 4 === 1
                                  ? "bg-blue-500"
                                  : index % 4 === 2
                                  ? "bg-green-500"
                                  : "bg-yellow-500"
                              } flex items-center justify-center`}
                            >
                              <span className="text-sm font-medium text-white">
                                {application.studentId?.userId?.name?.charAt(
                                  0
                                ) || "N"}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {application.studentId?.userId?.name || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.studentId?.userId?.email || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              Roll: {application.studentId?.rollNumber || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Academic Info */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            {application.studentId?.department || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            CGPA:{" "}
                            <span className="font-medium text-blue-600">
                              {application.studentId?.cgpa || "N/A"}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            Year: {application.studentId?.currentYear || "N/A"}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            application.status
                          )}`}
                        >
                          {application.status === "accepted" && "✅"}
                          {application.status === "rejected" && "❌"}
                          {application.status === "in-progress" && "⏳"}
                          <span className="ml-1 capitalize">
                            {application.status?.replace("-", " ") || "Unknown"}
                          </span>
                        </span>
                        {application.currentRound && (
                          <div className="text-xs text-gray-500 mt-1">
                            Round {application.currentRound}
                          </div>
                        )}
                      </td>

                      {/* Applied Date */}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="space-y-1">
                          <div>
                            {new Date(application.appliedAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(application.appliedAt).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Actions - Only View Profile */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            navigate(
                              `/company/student-profile/${application.studentId?.userId?._id}`
                            )
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="text-4xl">💡</div>
            <div>
              <h4 className="text-xl font-bold text-blue-800 mb-3">
                How Round Management Works
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700">
                <div>
                  <h5 className="font-semibold mb-2">🎯 Active Rounds:</h5>
                  <ul className="space-y-1 text-sm">
                    <li>• Select students using checkboxes</li>
                    <li>• Push selected students to next round</li>
                    <li>• Reject students who don't qualify</li>
                    <li>• Advance round when ready</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">🏆 Final Round:</h5>
                  <ul className="space-y-1 text-sm">
                    <li>• Students here are pre-selected</li>
                    <li>• Complete hiring to accept all</li>
                    <li>• This finalizes the selection process</li>
                    <li>• Students get automatic acceptance</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoundManagement;
