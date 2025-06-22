import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { toast } from "react-hot-toast";

const SelectionDashboard = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobData, setJobData] = useState(null);
  const [roundStats, setRoundStats] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.role !== "company") {
      toast.error("Access denied. Company account required.");
      navigate("/");
      return;
    }
    fetchJobData();
  }, [jobId, user, navigate]);

  const fetchJobData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch job details
      const jobResponse = await api.get(`/jobs/${jobId}`);
      if (!jobResponse.data.success) {
        throw new Error("Failed to fetch job details");
      }
      
      const job = jobResponse.data.data;
      
      // Check if user owns this job
      if (!isJobOwner(job)) {
        toast.error("You don't have permission to view this job's selection dashboard");
        navigate("/company-dashboard");
        return;
      }
      
      setJobData(job);
      
      // Fetch applications for this job
      await fetchApplications();
      
    } catch (error) {
      console.error('Error fetching job data:', error);
      setError(error.response?.data?.message || "Error loading job data");
      toast.error("Error loading selection dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await api.get(`/applications/job/${jobId}`);
      if (response.data.success) {
        const apps = response.data.data;
        setApplications(apps);
        calculateRoundStats(apps);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error("Error loading applications data");
    }
  };

  const calculateRoundStats = (apps) => {
    if (!jobData?.recruitmentProcess) return;
    
    const stats = jobData.recruitmentProcess.map((stage, index) => {
      const roundNum = stage.stageOrder || index + 1;
      
      // Get applications for this round
      const roundApplications = apps.filter(app => {
        if (roundNum === 1) {
          // First round includes all applications
          return true;
        } else {
          // Subsequent rounds include only those who passed previous rounds
          return app.currentStage >= roundNum || 
                 (app.applicationStatus === 'selected' && app.currentStage >= roundNum - 1);
        }
      });

      const acceptedStudents = apps.filter(app => 
        app.currentStage > roundNum || 
        (app.currentStage === roundNum && app.applicationStatus === 'shortlisted')
      ).length;

      const rejectedStudents = apps.filter(app => 
        app.currentStage === roundNum && app.applicationStatus === 'rejected'
      ).length;

      const status = getStageStatus(roundNum);

      return {
        round: roundNum,
        stageName: stage.stageName,
        totalStudents: roundApplications.length,
        acceptedStudents,
        rejectedStudents,
        status,
        pendingStudents: roundApplications.length - acceptedStudents - rejectedStudents
      };
    });

    setRoundStats(stats);
  };

  const isJobOwner = (job) => {
    if (!user || !job) return false;
    
    return user.companyProfile?._id === job.company?._id || 
           user._id === job.company?._id ||
           user.id === job.company?._id;
  };

  const getStageStatus = (stageOrder) => {
    if (!jobData) return 'pending';
    
    const currentStage = jobData.currentRecruitmentStage || 1;
    
    if (stageOrder < currentStage) return 'completed';
    if (stageOrder === currentStage) return 'active';
    return 'pending';
  };

  const handleFinishHiring = async () => {
    try {
      setFinishing(true);
      
      const response = await api.patch(`/jobs/${jobId}/finish-hiring`);
      
      if (response.data.success) {
        toast.success('Hiring process completed successfully!');
        
        // Update local job data
        setJobData(prev => ({
          ...prev,
          jobStatus: 'completed',
          completedAt: new Date().toISOString()
        }));
        
        // Refresh data
        await fetchJobData();
        
        // Navigate after a short delay
        setTimeout(() => {
          navigate('/company-dashboard');
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Failed to finish hiring');
      }
      
    } catch (error) {
      console.error('Error finishing hiring:', error);
      toast.error(error.response?.data?.message || 'Error completing hiring process');
    } finally {
      setFinishing(false);
      setShowFinishModal(false);
    }
  };

  const handleAdvanceStage = async () => {
    try {
      const response = await api.patch(`/jobs/${jobId}/advance-stage`);
      
      if (response.data.success) {
        toast.success('Advanced to next recruitment stage');
        await fetchJobData(); // Refresh data
      } else {
        throw new Error(response.data.message || 'Failed to advance stage');
      }
    } catch (error) {
      console.error('Error advancing stage:', error);
      toast.error(error.response?.data?.message || 'Error advancing to next stage');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'bg-green-500',
      'active': 'bg-blue-500',
      'pending': 'bg-gray-300'
    };
    return colors[status] || 'bg-gray-300';
  };

  const getStatusTextColor = (status) => {
    const colors = {
      'completed': 'text-green-600',
      'active': 'text-blue-600',
      'pending': 'text-gray-500'
    };
    return colors[status] || 'text-gray-500';
  };

  const isFinished = jobData?.jobStatus === 'completed';
  const isFinalRound = jobData?.currentRecruitmentStage === jobData?.totalRounds;
  const currentRoundStats = roundStats.find(r => r.status === 'active');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nit-red mx-auto mb-4"></div>
          <p className="text-nit-dark-purple">Loading selection dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-nit-navy mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={fetchJobData}
              className="bg-nit-red text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
            <Link
              to="/company-dashboard"
              className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
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
          <p className="text-gray-600 mb-4">The job you're looking for doesn't exist or you don't have access to it.</p>
          <Link
            to="/company-dashboard"
            className="bg-nit-red text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Back to Dashboard
          </Link>
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
                <h1 className="text-2xl font-bold text-nit-navy">Selection Dashboard</h1>
                <p className="text-nit-dark-purple">{jobData.title} - {jobData.role}</p>
              </div>
            </div>
                       
            <div className="flex items-center space-x-4">
              {/* Advance Stage Button */}
              {!isFinished && currentRoundStats?.pendingStudents === 0 && !isFinalRound && (
                <button
                  onClick={handleAdvanceStage}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  ➡️ Advance to Next Stage
                </button>
              )}

              {/* Finish Hiring Button */}
              {isFinalRound && !isFinished && (
                <button
                  onClick={() => setShowFinishModal(true)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  🏁 Finish Hiring
                </button>
              )}
                           
              <div className="text-right">
                <p className="font-medium text-nit-navy">{jobData.company?.name}</p>
                <p className="text-sm text-gray-600">
                  {isFinished ? (
                    <span className="text-green-600 font-medium">✅ Completed</span>
                  ) : (
                    `Round ${jobData.currentRecruitmentStage || 1}/${jobData.totalRounds || jobData.recruitmentProcess?.length}`
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-nit-navy">Recruitment Progress</h2>
            {isFinished && (
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
                🎉 Hiring Completed
              </div>
            )}
          </div>
                   
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Overall Progress</span>
              <span className="text-sm font-medium text-nit-navy">
                {Math.round(((jobData.currentRecruitmentStage || 1) / (jobData.totalRounds || jobData.recruitmentProcess?.length || 1)) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  isFinished ? 'bg-green-500' : 'bg-nit-red'
                }`}
                style={{ 
                  width: `${isFinished ? 100 : Math.round(((jobData.currentRecruitmentStage || 1) / (jobData.totalRounds || jobData.recruitmentProcess?.length || 1)) * 100)}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Round Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {jobData.recruitmentProcess?.map((stage, index) => {
              const roundNum = stage.stageOrder || index + 1;
              const status = getStageStatus(roundNum);
              const stats = roundStats.find(r => r.round === roundNum);
                           
              return (
                <div key={roundNum} className="text-center">
                  {/* Round Circle */}
                  <div className="relative mb-3">
                    <div className={`w-12 h-12 rounded-full ${getStatusColor(status)} flex items-center justify-center text-white font-bold mx-auto`}>
                      {roundNum}
                    </div>
                    {status === 'active' && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                                   
                  {/* Round Info */}
                  <h3 className={`font-medium text-sm mb-1 ${getStatusTextColor(status)}`}>
                    {stage.stageName}
                  </h3>
                                   
                                    {stats && (
                    <div className="text-xs text-gray-600 space-y-1">
                      {stats.totalStudents > 0 && (
                        <p>{stats.totalStudents} students</p>
                      )}
                      {status === 'completed' && (
                        <>
                          <p className="text-green-600">
                            ✓ {stats.acceptedStudents} accepted
                          </p>
                          {stats.rejectedStudents > 0 && (
                            <p className="text-red-600">
                              ✗ {stats.rejectedStudents} rejected
                            </p>
                          )}
                        </>
                      )}
                      {status === 'active' && stats.pendingStudents > 0 && (
                        <p className="text-yellow-600">
                          ⏳ {stats.pendingStudents} pending
                        </p>
                      )}
                    </div>
                  )}
                                   
                  {/* Action Button */}
                  <div className="mt-3">
                    {status === 'completed' || status === 'active' ? (
                      <Link
                        to={`/round-management/${jobId}/${roundNum}`}
                        className={`inline-block px-3 py-1 rounded text-xs font-medium transition-colors ${
                          status === 'active'
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {status === 'active' ? 'Manage' : 'View'}
                      </Link>
                    ) : (
                      <span className="inline-block px-3 py-1 rounded text-xs font-medium bg-gray-50 text-gray-400">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-nit-navy">
                  {applications.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-nit-navy">
                  {applications.filter(app => 
                    app.applicationStatus === 'applied' || 
                    app.applicationStatus === 'shortlisted' ||
                    app.applicationStatus === 'interview'
                  ).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Selected</p>
                <p className="text-2xl font-bold text-nit-navy">
                  {applications.filter(app => app.applicationStatus === 'selected').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <span className="text-2xl">❌</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Rejected</p>
                <p className="text-2xl font-bold text-nit-navy">
                  {applications.filter(app => app.applicationStatus === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Round Details */}
        {currentRoundStats && !isFinished && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-nit-navy mb-4">
              Current Round: {currentRoundStats.stageName}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{currentRoundStats.totalStudents}</p>
                <p className="text-sm text-gray-600">Total Candidates</p>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{currentRoundStats.pendingStudents}</p>
                <p className="text-sm text-gray-600">Pending Review</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{currentRoundStats.acceptedStudents}</p>
                <p className="text-sm text-gray-600">Advanced</p>
              </div>
            </div>

            {currentRoundStats.pendingStudents > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 font-medium">
                  ⚠️ Action Required: {currentRoundStats.pendingStudents} candidates are waiting for your review.
                </p>
                <Link
                  to={`/round-management/${jobId}/${jobData.currentRecruitmentStage}`}
                  className="mt-2 inline-block bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
                >
                  Review Candidates
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-nit-navy mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {applications
              .filter(app => app.updatedAt)
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
              .slice(0, 5)
              .map((app, index) => (
                <div key={app._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      app.applicationStatus === 'selected' ? 'bg-green-500' :
                      app.applicationStatus === 'rejected' ? 'bg-red-500' :
                      app.applicationStatus === 'shortlisted' ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-nit-navy">
                        {app.student?.name || 'Student'}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">
                        Status: {app.applicationStatus}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(app.updatedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(app.updatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            
            {applications.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No applications yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-nit-navy mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to={`/job-details/${jobId}`}
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl mr-3">📋</span>
              <div>
                <p className="font-medium text-nit-navy">View Job Details</p>
                <p className="text-sm text-gray-600">See complete job information</p>
              </div>
            </Link>

            <Link
              to={`/round-management/${jobId}/${jobData.currentRecruitmentStage || 1}`}
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span className="text-2xl mr-3">👥</span>
              <div>
                <p className="font-medium text-nit-navy">Current Round</p>
                <p className="text-sm text-gray-600">Manage active applications</p>
              </div>
            </Link>

            <Link
              to={`/job-applications/${jobId}`}
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <span className="text-2xl mr-3">📊</span>
              <div>
                <p className="font-medium text-nit-navy">All Applications</p>
                <p className="text-sm text-gray-600">View complete application list</p>
              </div>
            </Link>

            <button
              onClick={() => window.print()}
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <span className="text-2xl mr-3">🖨️</span>
              <div>
                <p className="font-medium text-nit-navy">Print Report</p>
                <p className="text-sm text-gray-600">Generate selection report</p>
              </div>
            </button>

            <button
              onClick={fetchJobData}
              className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <span className="text-2xl mr-3">🔄</span>
              <div>
                <p className="font-medium text-nit-navy">Refresh Data</p>
                <p className="text-sm text-gray-600">Update latest information</p>
              </div>
            </button>

            <Link
              to="/company-dashboard"
              className="flex items-center p-4 bg-nit-gold bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              <span className="text-2xl mr-3">🏠</span>
              <div>
                <p className="font-medium text-nit-navy">Dashboard</p>
                <p className="text-sm text-gray-600">Back to all jobs</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Finish Hiring Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-nit-navy mb-4">Finish Hiring Process</h3>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-4">
                Are you sure you want to complete the hiring process for this job?
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <h4 className="font-semibold text-yellow-800 mb-2">This action will:</h4>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• Mark the job as completed</li>
                  <li>• Move it to "Finished Jobs" section</li>
                  <li>• Prevent further applications</li>
                  <li>• Lock the recruitment process</li>
                  <li>• Send notifications to all candidates</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-semibold text-blue-800 mb-1">Current Status:</h4>
                <p className="text-blue-700 text-sm">
                  {applications.filter(app => app.applicationStatus === 'selected').length} candidates selected
                </p>
              </div>
            </div>
                       
            <div className="flex space-x-4">
              <button
                onClick={() => setShowFinishModal(false)}
                disabled={finishing}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleFinishHiring}
                disabled={finishing}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {finishing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Finishing...
                  </>
                ) : (
                  'Finish Hiring'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectionDashboard;
