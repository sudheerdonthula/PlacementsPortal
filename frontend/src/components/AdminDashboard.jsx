import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalStudents: 1247,
    totalCompanies: 89,
    activeJobs: 156,
    totalPlacements: 234,
    averagePackage: 12.5,
    highestPackage: 45.0
  });

  const [recentActivities] = useState([
    {
      id: 1,
      type: 'company_registration',
      message: 'Google registered as a new company',
      timestamp: '2024-01-22 10:30 AM',
      icon: '🏢'
    },
    {
      id: 2,
      type: 'job_posting',
      message: 'Microsoft posted Software Engineer position',
      timestamp: '2024-01-22 09:15 AM',
      icon: '💼'
    },
    {
      id: 3,
      type: 'student_placement',
      message: 'Rahul Sharma got placed at Amazon',
      timestamp: '2024-01-21 04:45 PM',
      icon: '🎉'
    },
    {
      id: 4,
      type: 'application_submitted',
      message: '25 new applications submitted today',
      timestamp: '2024-01-21 02:30 PM',
      icon: '📝'
    },
    {
      id: 5,
      type: 'interview_scheduled',
      message: '12 interviews scheduled for tomorrow',
      timestamp: '2024-01-21 11:20 AM',
      icon: '🎯'
    }
  ]);

  const [topCompanies] = useState([
    {
      id: 1,
      name: 'Google',
      jobsPosted: 8,
      applications: 234,
      hired: 12,
      avgPackage: 42.5,
      status: 'Active'
    },
    {
      id: 2,
      name: 'Microsoft',
      jobsPosted: 6,
      applications: 189,
      hired: 10,
      avgPackage: 38.2,
      status: 'Active'
    },
    {
      id: 3,
      name: 'Amazon',
      jobsPosted: 5,
      applications: 156,
      hired: 8,
      avgPackage: 35.8,
      status: 'Active'
    },
    {
      id: 4,
      name: 'Oracle',
      jobsPosted: 4,
      applications: 123,
      hired: 6,
      avgPackage: 32.1,
      status: 'Active'
    }
  ]);

  const [placementStats] = useState([
    { branch: 'Computer Science', students: 180, placed: 165, percentage: 91.7 },
    { branch: 'Electronics & Communication', students: 120, placed: 102, percentage: 85.0 },
    { branch: 'Electrical Engineering', students: 100, placed: 82, percentage: 82.0 },
    { branch: 'Mechanical Engineering', students: 110, placed: 88, percentage: 80.0 },
    { branch: 'Civil Engineering', students: 90, placed: 68, percentage: 75.6 },
    { branch: 'Chemical Engineering', students: 80, placed: 58, percentage: 72.5 }
  ]);

  const [pendingApprovals] = useState([
    {
      id: 1,
      type: 'Company Registration',
      name: 'TechCorp Solutions',
      submittedBy: 'John Smith',
      date: '2024-01-22',
      status: 'Pending'
    },
    {
      id: 2,
      type: 'Job Posting',
      name: 'Senior Developer Position',
      submittedBy: 'Microsoft',
      date: '2024-01-21',
      status: 'Pending'
    },
    {
      id: 3,
      type: 'Student Verification',
      name: 'Priya Sharma (20CS1234)',
      submittedBy: 'Student',
      date: '2024-01-20',
      status: 'Pending'
    }
  ]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'students', name: 'Students', icon: '🎓' },
    { id: 'companies', name: 'Companies', icon: '🏢' },
    { id: 'jobs', name: 'Job Management', icon: '💼' },
    { id: 'placements', name: 'Placements', icon: '🎯' },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
    { id: 'approvals', name: 'Approvals', icon: '✅' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2 border-nit-gold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-nit-red to-red-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">N</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-nit-navy">NIT Warangal</h1>
                  <p className="text-nit-lavender text-sm">Admin Dashboard</p>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-nit-navy font-semibold">Admin Panel</p>
                <p className="text-nit-lavender text-sm">{user?.name} • Administrator</p>
              </div>
              <button
                onClick={logout}
                className="text-nit-red hover:text-red-700 font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-xl shadow-lg p-6">
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-nit-red text-white shadow-md'
                        : 'text-nit-dark-purple hover:bg-nit-mint'
                    }`}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-nit-navy to-nit-lavender text-white rounded-xl p-8">
                  <h2 className="text-3xl font-bold mb-2">Admin Dashboard 👨‍💼</h2>
                  <p className="text-gray-200 text-lg">Manage the entire NIT Warangal placement ecosystem</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="card p-6 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🎓</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalStudents}</div>
                    <div className="text-nit-dark-purple font-medium">Total Students</div>
                  </div>

                  <div className="card p-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🏢</span>
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalCompanies}</div>
                    <div className="text-nit-dark-purple font-medium">Registered Companies</div>
                  </div>

                  <div className="card p-6 text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💼</span>
                    </div>
                    <div className="text-3xl font-bold text-purple-600 mb-2">{stats.activeJobs}</div>
                    <div className="text-nit-dark-purple font-medium">Active Job Postings</div>
                  </div>

                  <div className="card p-6 text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.totalPlacements}</div>
                    <div className="text-nit-dark-purple font-medium">Total Placements</div>
                  </div>

                  <div className="card p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💰</span>
                    </div>
                    <div className="text-3xl font-bold text-red-600 mb-2">₹{stats.averagePackage}L</div>
                    <div className="text-nit-dark-purple font-medium">Average Package</div>
                  </div>

                  <div className="card p-6 text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🏆</span>
                    </div>
                    <div className="text-3xl font-bold text-orange-600 mb-2">₹{stats.highestPackage}L</div>
                    <div className="text-nit-dark-purple font-medium">Highest Package</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="card p-6">
                  <h3 className="text-2xl font-bold text-nit-navy mb-6">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button 
                      onClick={() => setActiveTab('approvals')}
                      className="flex items-center space-x-3 p-4 bg-nit-red text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <span className="text-2xl">✅</span>
                      <span className="font-semibold">Pending Approvals</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('students')}
                      className="flex items-center space-x-3 p-4 bg-nit-gold text-nit-navy rounded-lg hover:bg-nit-gold-dark transition-colors"
                    >
                      <span className="text-2xl">👥</span>
                      <span className="font-semibold">Manage Students</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('companies')}
                      className="flex items-center space-x-3 p-4 bg-nit-purple text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <span className="text-2xl">🏢</span>
                      <span className="font-semibold">Manage Companies</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('analytics')}
                      className="flex items-center space-x-3 p-4 bg-nit-navy text-white rounded-lg hover:bg-blue-800 transition-colors"
                    >
                      <span className="text-2xl">📊</span>
                      <span className="font-semibold">View Analytics</span>
                    </button>
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="card p-6">
                  <h3 className="text-2xl font-bold text-nit-navy mb-6">Recent Activities</h3>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <span className="text-2xl">{activity.icon}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-nit-navy">{activity.message}</p>
                          <p className="text-sm text-nit-lavender">{activity.timestamp}</p>
                        </div>
                        <button className="text-nit-red hover:text-red-700 text-sm font-medium">
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Top Companies */}
                  <div className="card p-6">
                    <h3 className="text-xl font-bold text-nit-navy mb-4">Top Recruiting Companies</h3>
                    <div className="space-y-4">
                      {topCompanies.map((company, index) => (
                        <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-nit-red text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-semibold text-nit-navy">{company.name}</div>
                              <div className="text-sm text-nit-dark-purple">{company.jobsPosted} jobs • {company.hired} hired</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-nit-red">₹{company.avgPackage}L</div>
                            <div className="text-xs text-nit-lavender">avg package</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Placement Statistics */}
                  <div className="card p-6">
                    <h3 className="text-xl font-bold text-nit-navy mb-4">Branch-wise Placement Stats</h3>
                    <div className="space-y-4">
                      {placementStats.map((stat) => (
                        <div key={stat.branch} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-nit-navy">{stat.branch}</span>
                            <span className="text-sm text-nit-dark-purple">{stat.placed}/{stat.students} ({stat.percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-nit-red to-red-600 h-2 rounded-full transition-all duration-300" 
                              style={{width: `${stat.percentage}%`}}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Approvals Tab */}
            {activeTab === 'approvals' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold text-nit-navy">Pending Approvals</h2>
                  <div className="flex space-x-3">
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                      Approve All
                    </button>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
                      Reject All
                    </button>
                  </div>
                </div>

                <div className="card p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-nit-navy">Type</th>
                          <th className="text-left py-3 px-4 font-semibold text-nit-navy">Name/Title</th>
                          <th className="text-left py-3 px-4 font-semibold text-nit-navy">Submitted By</th>
                          <th className="text-left py-3 px-4 font-semibold text-nit-navy">Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-nit-navy">Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-nit-navy">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingApprovals.map((approval) => (
                          <tr key={approval.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                {approval.type}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-medium text-nit-navy">{approval.name}</td>
                            <td className="py-4 px-4 text-nit-dark-purple">{approval.submittedBy}</td>
                            <td className="py-4 px-4 text-nit-dark-purple">{approval.date}</td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(approval.status)}`}>
                                {approval.status}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex space-x-2">
                                <button className="text-green-600 hover:text-green-800 font-medium text-sm">
                                  Approve
                                </button>
                                <button className="text-red-600 hover:text-red-800 font-medium text-sm">
                                  Reject
                                </button>
                                <button className="text-nit-red hover:text-red-700 font-medium text-sm">
                                  View
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold text-nit-navy">Student Management</h2>
                  <div className="flex space-x-3">
                    <input 
                      type="text" 
                      placeholder="Search students..." 
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nit-red"
                    />
                    <button className="bg-nit-red text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
                      Export Data
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="card p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
                    <div className="text-sm text-nit-dark-purple">Total Students</div>
                  </div>
                  <div className="card p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.totalPlacements}</div>
                    <div className="text-sm text-nit-dark-purple">Placed Students</div>
                  </div>
                  <div className="card p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">{stats.totalStudents - stats.totalPlacements}</div>
                    <div className="text-sm text-nit-dark-purple">Unplaced Students</div>
                  </div>
                  <div className="card p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{Math.round((stats.totalPlacements / stats.totalStudents) * 100)}%</div>
                    <div className="text-sm text-nit-dark-purple">Placement Rate</div>
                  </div>
                </div>

                <div className="card p-6">
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">👥</div>
                    <h3 className="text-2xl font-bold text-nit-navy mb-2">Student Management</h3>
                    <p className="text-nit-dark-purple mb-6">
                      Advanced student management features including search, filter, export, and detailed analytics.
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button className="bg-nit-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                        View All Students
                      </button>
                      <button className="border border-nit-red text-nit-red px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors">
                        Generate Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs content */}
            {!['overview', 'approvals', 'students'].includes(activeTab) && (
              <div className="card p-8 text-center">
                <div className="text-6xl mb-4">🚧</div>
                <h3 className="text-2xl font-bold text-nit-navy mb-2">Coming Soon!</h3>
                <p className="text-nit-dark-purple">
                  The {tabs.find(t => t.id === activeTab)?.name} section is under development.
                </p>
                <p className="text-sm text-nit-lavender mt-2">
                  This will include advanced features for managing the entire placement ecosystem.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
