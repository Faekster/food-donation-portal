import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const RecipientDashboard = ({ user }) => {
  const [availableDonations, setAvailableDonations] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [stats, setStats] = useState({
    available: 0,
    claimed: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        // Get available donations
        const availableRes = await axios.get(
          "http://localhost:5000/api/donations",
          {
            params: { status: "available" },
          }
        );
        setAvailableDonations(availableRes.data);

        // Get my claimed/completed donations
        const myRes = await axios.get("http://localhost:5000/api/donations", {
          params: { recipient: true },
        });
        setMyDonations(myRes.data);

        // Calculate stats
        setStats({
          available: availableRes.data.length,
          claimed: myRes.data.filter((d) => d.status === "claimed").length,
          completed: myRes.data.filter((d) => d.status === "completed").length,
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching donations:", err);
        setError("Failed to load donations. Please try again later.");
        // Set empty data to prevent rendering issues
        setAvailableDonations([]);
        setMyDonations([]);
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
          Browse available food donations and manage your claimed items.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">
            Available Donations
          </div>
          <div className="text-3xl font-bold text-green-600">
            {stats.available}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">
            Claimed by You
          </div>
          <div className="text-3xl font-bold text-blue-600">
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

      {/* Find Donations Button */}
      <div className="mb-8">
        <Link
          to="/donations"
          className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 inline-block"
        >
          Find Available Donations
        </Link>
      </div>

      {/* Available Donations */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-800">
            Recent Available Donations
          </h3>
        </div>

        {availableDonations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No available donations at the moment. Check back later!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {availableDonations.slice(0, 3).map((donation) => (
                  <tr key={donation._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {donation.donor?.organization || "Anonymous Donor"}
                      </div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/donations/${donation._id}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {availableDonations.length > 3 && (
              <div className="px-6 py-3 border-t">
                <Link
                  to="/donations"
                  className="text-sm text-green-600 hover:text-green-900"
                >
                  View all available donations
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* My Claimed Donations */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-800">
            My Claimed Donations
          </h3>
        </div>

        {myDonations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            You haven't claimed any donations yet.
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
                {myDonations.slice(0, 5).map((donation) => (
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
                          donation.status === "claimed"
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
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipientDashboard;
