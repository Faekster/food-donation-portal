import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-700">
                Welcome, {user?.name}!
              </h2>
              <p className="mt-2 text-gray-600">
                {user?.role === "donor"
                  ? "You are logged in as a food donor. Here you can manage your donations and track your impact."
                  : "You are logged in as a food bank/charity. Here you can browse available donations and manage your collection schedule."}
              </p>
              <div className="mt-6">
                <p className="text-sm text-gray-500">
                  This dashboard will be expanded with more features in the next
                  sprints.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
