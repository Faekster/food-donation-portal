import { useAuth } from "../contexts/AuthContext";
import DonorDashboard from "../components/dashboard/DonorDashboard";
import RecipientDashboard from "../components/dashboard/RecipientDashboard";

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {user && user.role === "donor" ? (
            <DonorDashboard user={user} />
          ) : (
            <RecipientDashboard user={user} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
