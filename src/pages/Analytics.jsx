import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Analytics = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("month"); // 'week', 'month', 'year'

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/donations");
        setDonations(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching donations for analytics:", err);
        setError("Failed to load donation data. Please try again later.");
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  // Generate donation trends data based on time range
  const getDonationTrendsData = () => {
    if (!donations.length) return [];

    const now = new Date();
    const filteredDonations = donations.filter((donation) => {
      const donationDate = new Date(donation.createdAt);

      if (timeRange === "week") {
        // Get donations from the last 7 days
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return donationDate >= weekAgo;
      } else if (timeRange === "month") {
        // Get donations from the last 30 days
        const monthAgo = new Date(now);
        monthAgo.setDate(now.getDate() - 30);
        return donationDate >= monthAgo;
      } else if (timeRange === "year") {
        // Get donations from the last 12 months
        const yearAgo = new Date(now);
        yearAgo.setFullYear(now.getFullYear() - 1);
        return donationDate >= yearAgo;
      }

      return true;
    });

    // Group donations by date
    const donationsByDate = {};

    filteredDonations.forEach((donation) => {
      let dateKey;
      const date = new Date(donation.createdAt);

      if (timeRange === "week") {
        // Group by day of week
        dateKey = date.toLocaleDateString("en-US", { weekday: "short" });
      } else if (timeRange === "month") {
        // Group by day of month
        dateKey = date.getDate().toString();
      } else if (timeRange === "year") {
        // Group by month
        dateKey = date.toLocaleDateString("en-US", { month: "short" });
      }

      if (!donationsByDate[dateKey]) {
        donationsByDate[dateKey] = {
          date: dateKey,
          count: 0,
          items: 0,
        };
      }

      donationsByDate[dateKey].count += 1;
      donationsByDate[dateKey].items += donation.foodItems.length;
    });

    // Convert to array and sort
    let result = Object.values(donationsByDate);

    if (timeRange === "week") {
      // Sort by day of week
      const daysOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      result.sort(
        (a, b) => daysOrder.indexOf(a.date) - daysOrder.indexOf(b.date)
      );
    } else if (timeRange === "month") {
      // Sort by day of month
      result.sort((a, b) => parseInt(a.date) - parseInt(b.date));
    } else if (timeRange === "year") {
      // Sort by month
      const monthsOrder = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      result.sort(
        (a, b) => monthsOrder.indexOf(a.date) - monthsOrder.indexOf(b.date)
      );
    }

    return result;
  };

  // Get categories distribution data
  const getCategoriesData = () => {
    if (!donations.length) return [];

    const categoryCounts = {};

    donations.forEach((donation) => {
      donation.foodItems.forEach((item) => {
        const category = item.category;
        if (!categoryCounts[category]) {
          categoryCounts[category] = 0;
        }
        categoryCounts[category] += 1;
      });
    });

    // Format for pie chart
    return Object.keys(categoryCounts).map((category) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: categoryCounts[category],
    }));
  };

  // Get status distribution data
  const getStatusData = () => {
    if (!donations.length) return [];

    const statusCounts = {
      available: 0,
      claimed: 0,
      completed: 0,
      cancelled: 0,
    };

    // Count donations by status
    donations.forEach((donation) => {
      statusCounts[donation.status] += 1;
    });

    // Format for bar chart
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    }));
  };

  // Colors for pie charts
  const COLORS = [
    "#4CAF50",
    "#2196F3",
    "#FFC107",
    "#F44336",
    "#9C27B0",
    "#FF9800",
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Data for charts
  const donationTrendsData = getDonationTrendsData();
  const categoriesData = getCategoriesData();
  const statusData = getStatusData();

  // Calculate totals for summary cards
  const totalDonations = donations.length;
  const totalItems = donations.reduce(
    (sum, donation) => sum + donation.foodItems.length,
    0
  );
  const completedDonations = donations.filter(
    (d) => d.status === "completed"
  ).length;

  // Calculate impact metrics (estimate)
  const wasteReduction = totalItems * 0.5; // Approx. 0.5 kg per item
  const mealProvided = Math.floor(totalItems / 3); // Approx. 3 items = 1 meal

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
        </div>
      </header>

      <main className="mt-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {error && (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
              role="alert"
            >
              <p>{error}</p>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Donations
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-green-600">
                  {totalDonations}
                </dd>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Food Items Donated
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-green-600">
                  {totalItems}
                </dd>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Completed Transactions
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-green-600">
                  {completedDonations}
                </dd>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Success Rate
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-green-600">
                  {totalDonations
                    ? Math.round((completedDonations / totalDonations) * 100)
                    : 0}
                  %
                </dd>
              </div>
            </div>
          </div>

          {/* Time Series Chart */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Donation Trends
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setTimeRange("week")}
                  className={`px-3 py-1 text-sm rounded-md ${
                    timeRange === "week"
                      ? "bg-green-100 text-green-800 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setTimeRange("month")}
                  className={`px-3 py-1 text-sm rounded-md ${
                    timeRange === "month"
                      ? "bg-green-100 text-green-800 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setTimeRange("year")}
                  className={`px-3 py-1 text-sm rounded-md ${
                    timeRange === "year"
                      ? "bg-green-100 text-green-800 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Year
                </button>
              </div>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="h-72">
                {donationTrendsData.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">
                      No data available for selected time range
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={donationTrendsData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Donations"
                        stroke="#4CAF50"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="items"
                        name="Food Items"
                        stroke="#2196F3"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Category and Status Charts */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Food Categories
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="h-64">
                  {categoriesData.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">
                        No category data available
                      </p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoriesData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {categoriesData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Donation Status
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="h-64">
                  {statusData.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">No status data available</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={statusData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" name="Donations" fill="#4CAF50" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Impact Metrics */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Environmental & Social Impact
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-green-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-green-800 truncate">
                    Food Waste Reduction
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-green-600">
                    {wasteReduction.toFixed(1)} kg
                  </dd>
                  <dd className="mt-1 text-sm text-green-700">
                    Estimated food diverted from landfill
                  </dd>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-green-800 truncate">
                    CO₂ Emissions Saved
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-green-600">
                    {(wasteReduction * 2.5).toFixed(1)} kg
                  </dd>
                  <dd className="mt-1 text-sm text-green-700">
                    Estimated carbon footprint reduction
                  </dd>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-green-800 truncate">
                    Meals Provided
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-green-600">
                    {mealProvided}
                  </dd>
                  <dd className="mt-1 text-sm text-green-700">
                    Estimated meals for people in need
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
