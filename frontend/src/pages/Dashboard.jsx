import { useAuth } from '../context/AuthContext';
import StudentDashboard from '../components/StudentDashboard';
import CompanyDashboard from '../components/CompanyDashboard';
import AdminDashboard from '../components/AdminDashboard';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'student':
        return <StudentDashboard />;
      case 'company':
        return <CompanyDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">
              Invalid user role
            </h2>
            <p className="text-gray-600 mt-2">
              Please contact support for assistance.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'student' && 'Manage your profile and track job applications'}
            {user?.role === 'company' && 'Post jobs and manage recruitment process'}
            {user?.role === 'admin' && 'Oversee platform activities and manage users'}
          </p>
        </div>
        
        {renderDashboard()}
      </main>
    </div>
  );
};

export default Dashboard;