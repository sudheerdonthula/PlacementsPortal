import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const JobListings = () => {
  const { user } = useAuth();

  // Simple jobs data - no complex filtering needed
  const [jobs] = useState([
    {
      id: 1,
      title: 'Software Engineer',
      company: 'Google',
      logo: '🔍',
      package: '₹45 LPA',
      location: 'Bangalore',
      deadline: '2024-02-15',
      posted: '2024-01-10',
      description: 'Join Google as a Software Engineer and work on cutting-edge technologies that impact billions of users worldwide.',
      requirements: ['B.Tech/B.E in Computer Science', 'Strong programming skills in Java/Python', 'Problem-solving abilities'],
      type: 'Full-time',
      experience: 'Fresher'
    },
    {
      id: 2,
      title: 'Data Scientist',
      company: 'Microsoft',
      logo: '🪟',
      package: '₹42 LPA',
      location: 'Hyderabad',
      deadline: '2024-02-20',
      posted: '2024-01-12',
      description: 'Work with Microsoft\'s AI team to build intelligent solutions and drive data-driven decisions.',
      requirements: ['B.Tech/M.Tech in relevant field', 'Strong analytical skills', 'Python/R expertise'],
      type: 'Full-time',
      experience: 'Fresher'
    },
    {
      id: 3,
      title: 'Frontend Developer',
      company: 'Flipkart',
      logo: '🛒',
      package: '₹35 LPA',
      location: 'Bangalore',
      deadline: '2024-03-01',
      posted: '2024-01-18',
      description: 'Build amazing user experiences for millions of customers using modern web technologies.',
      requirements: ['B.Tech in Computer Science', 'React/Angular expertise', 'UI/UX understanding'],
      type: 'Full-time',
      experience: 'Fresher'
    },
    {
      id: 4,
      title: 'Backend Developer',
      company: 'Amazon',
      logo: '📦',
      package: '₹40 LPA',
      location: 'Mumbai',
      deadline: '2024-02-25',
      posted: '2024-01-15',
      description: 'Design and develop scalable backend systems for Amazon\'s e-commerce platform.',
      requirements: ['B.Tech in Computer Science', 'Java/Node.js expertise', 'Database knowledge'],
      type: 'Full-time',
      experience: 'Fresher'
    },
    {
      id: 5,
      title: 'DevOps Engineer',
      company: 'Netflix',
      logo: '🎬',
      package: '₹38 LPA',
      location: 'Pune',
      deadline: '2024-03-05',
      posted: '2024-01-20',
      description: 'Help Netflix deliver entertainment to millions by managing cloud infrastructure.',
      requirements: ['B.Tech in Computer Science', 'AWS/Azure knowledge', 'Docker/Kubernetes'],
      type: 'Full-time',
      experience: 'Fresher'
    },
    {
      id: 6,
      title: 'Mobile App Developer',
      company: 'Swiggy',
      logo: '🍔',
      package: '₹32 LPA',
      location: 'Bangalore',
      deadline: '2024-02-28',
      posted: '2024-01-22',
      description: 'Develop mobile applications that connect millions of users with their favorite food.',
      requirements: ['B.Tech in Computer Science', 'React Native/Flutter', 'Mobile development experience'],
      type: 'Full-time',
      experience: 'Fresher'
    }
  ]);

  const getDaysLeft = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleApply = (jobId) => {
    if (!user) {
      alert('Please login to apply for jobs!');
      return;
    }
    alert(`Applied for job ${jobId}! You will be notified about further rounds.`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2 border-nit-gold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-nit-red to-red-700 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-nit-navy">NIT Warangal</h1>
                <p className="text-nit-lavender text-sm">Placement Portal</p>
              </div>
            </Link>
            
            <nav className="flex items-center space-x-6">
              <Link to="/" className="text-nit-navy hover:text-nit-red font-medium transition-colors">
                Home
              </Link>
              {user ? (
                <>
                  <Link 
                    to={user.role === 'student' ? '/student-dashboard' : '/company-dashboard'}
                    className="text-nit-navy hover:text-nit-red font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <span className="text-nit-dark-purple">Welcome, {user.name}!</span>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-nit-red hover:text-red-700 font-medium">
                    Login
                  </Link>
                  <Link to="/register" className="bg-nit-red text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-nit-navy mb-4">
            Available Job Opportunities
          </h1>
          <p className="text-xl text-nit-dark-purple">
            {jobs.length} jobs posted by companies • Apply before deadlines
          </p>
        </div>

        {/* Jobs List */}
        <div className="space-y-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
              {/* Job Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">
                    {job.logo}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-nit-navy">{job.title}</h3>
                    <p className="text-lg text-nit-dark-purple">{job.company}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-nit-red font-bold text-lg">{job.package}</span>
                      <span className="text-nit-dark-purple">📍 {job.location}</span>
                      <span className="text-nit-dark-purple">💼 {job.type}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-lg font-bold mb-1 ${getDaysLeft(job.deadline) <= 3 ? 'text-red-600' : 'text-orange-600'}`}>
                    {getDaysLeft(job.deadline)} days left
                  </div>
                  <div className="text-sm text-gray-500">
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Posted: {new Date(job.posted).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="mb-4">
                <p className="text-nit-dark-purple leading-relaxed">{job.description}</p>
              </div>

              {/* Requirements */}
              <div className="mb-6">
                <h4 className="font-semibold text-nit-navy mb-3">Requirements:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {job.requirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-nit-red">•</span>
                      <span className="text-nit-dark-purple">{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deadline Warning */}
              {getDaysLeft(job.deadline) <= 3 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-500 text-xl">⚠️</span>
                    <span className="text-red-700 font-medium">
                      Deadline approaching! Only {getDaysLeft(job.deadline)} days left to apply.
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => handleApply(job.id)}
                  className="flex-1 bg-nit-red text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors text-center"
                >
                  Apply Now
                </button>
                <button className="flex-1 border-2 border-nit-red text-nit-red py-3 px-6 rounded-lg font-semibold hover:bg-red-50 transition-colors text-center">
                  View Full Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Message */}
        <div className="text-center mt-12 p-8 bg-white rounded-xl shadow-lg">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-2xl font-bold text-nit-navy mb-2">
            Keep Checking for New Opportunities!
          </h3>
          <p className="text-nit-dark-purple">
            New jobs are posted regularly. Make sure to check your dashboard frequently and apply before deadlines.
          </p>
          {user && user.role === 'student' && (
            <Link 
              to="/student-dashboard"
              className="inline-block mt-4 bg-nit-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobListings;
