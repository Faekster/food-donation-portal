import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const DonorDashboard = ({ user }) => {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    claimed: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/donations");
        setDonations(response.data);

        // Calculate stats
        const total = response.data.length;
        const active = response.data.filter(
          (d) => d.status === "available"
        ).length;
        const claimed = response.data.filter(
          (d) => d.status === "claimed"
        ).length;
        const completed = response.data.filter(
          (d) => d.status === "completed"
        ).length;

        setStats({ total, active, claimed, completed });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching donations:", err);
        setError("Failed to load donations. Please try again later.");
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
        role="alert"
      >
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Welcome, {user.name}
        </h2>
        <p className="text-gray-600">
          Manage your food donations and track your impact on reducing food
          waste.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">
            Total Donations
          </div>
          <div className="text-3xl font-bold text-green-600">{stats.total}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">
            Available
          </div>
          <div className="text-3xl font-bold text-blue-600">{stats.active}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Claimed</div>
          <div className="text-3xl font-bold text-yellow-600">
            {stats.claimed}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">
            Completed
          </div>
          <div className="text-3xl font-bold text-gray-600">
            {stats.completed}
          </div>
        </div>
      </div>

      {/* Create Donation Button */}
      <div className="mb-8">
        <Link
          to="/donations/create"
          className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 inline-block"
        >
          Create New Donation
        </Link>
      </div>

      {/* Recent Donations */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-800">
            Recent Donations
          </h3>
        </div>

        {donations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            You haven't created any donations yet. Click "Create New Donation"
            to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donations.slice(0, 5).map((donation) => (
                  <tr key={donation._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {donation.foodItems.length} items
                      </div>
                      <div className="text-sm text-gray-500">
                        {donation.foodItems
                          .map((item) => item.name)
                          .join(", ")
                          .substring(0, 30)}
                        {donation.foodItems.map((item) => item.name).join(", ")
                          .length > 30
                          ? "..."
                          : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          donation.status === "available"
                            ? "bg-green-100 text-green-800"
                            : donation.status === "claimed"
                            ? "bg-blue-100 text-blue-800"
                            : donation.status === "completed"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {donation.status.charAt(0).toUpperCase() +
                          donation.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/donations/${donation._id}`}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {donations.length > 5 && (
              <div className="px-6 py-3 border-t">
                <Link
                  to="/donations"
                  className="text-sm text-green-600 hover:text-green-900"
                >
                  View all donations
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;
