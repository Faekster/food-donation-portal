import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const DonationsList = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: "",
    searchTerm: "",
    sortBy: "date",
  });

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/donations",
          {
            params: { status: "available" },
          }
        );
        setDonations(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching donations:", err);
        setError("Failed to load donations. Please try again later.");
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Filter and sort donations based on user selections
  const filteredDonations = donations
    .filter((donation) => {
      // Filter by category
      if (
        filters.category &&
        !donation.foodItems.some((item) => item.category === filters.category)
      ) {
        return false;
      }

      // Filter by search term
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        const hasMatchingItem = donation.foodItems.some((item) =>
          item.name.toLowerCase().includes(searchTerm)
        );

        const hasMatchingOrganization = donation.donor?.organization
          ?.toLowerCase()
          .includes(searchTerm);

        if (!hasMatchingItem && !hasMatchingOrganization) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      // Sort by selected option
      if (filters.sortBy === "date") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (filters.sortBy === "expiry") {
        // Sort by the earliest expiry date
        const aEarliestExpiry = Math.min(
          ...a.foodItems.map((item) => new Date(item.expiryDate).getTime())
        );
        const bEarliestExpiry = Math.min(
          ...b.foodItems.map((item) => new Date(item.expiryDate).getTime())
        );
        return aEarliestExpiry - bEarliestExpiry;
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Available Donations
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

          {/* Filters */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="searchTerm"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Search
                  </label>
                  <input
                    type="text"
                    id="searchTerm"
                    name="searchTerm"
                    value={filters.searchTerm}
                    onChange={handleFilterChange}
                    placeholder="Search by item name or donor..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">All Categories</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="grains">Grains & Cereals</option>
                    <option value="dairy">Dairy</option>
                    <option value="protein">Protein (Meat, Fish, etc.)</option>
                    <option value="prepared">Prepared Meals</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="sortBy"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Sort By
                  </label>
                  <select
                    id="sortBy"
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="date">Most Recent</option>
                    <option value="expiry">Expiring Soon</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Donations Display */}
          {filteredDonations.length === 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center">
                <p className="text-gray-500">
                  No available donations match your criteria.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDonations.map((donation) => (
                <div
                  key={donation._id}
                  className="bg-white shadow overflow-hidden sm:rounded-lg"
                >
                  <div className="px-4 py-5 sm:px-6 border-b">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {donation.donor?.organization || "Anonymous Donor"}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Posted {new Date(donation.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="px-4 py-5 sm:px-6">
                    <h4 className="text-md font-medium text-gray-800 mb-2">
                      Food Items:
                    </h4>
                    <ul className="space-y-1 mb-4">
                      {donation.foodItems.slice(0, 3).map((item, index) => (
                        <li key={index} className="text-sm">
                          <span className="font-medium">{item.name}</span> -{" "}
                          {item.quantity} {item.unit}
                          <span className="block text-xs text-gray-500">
                            Expires:{" "}
                            {new Date(item.expiryDate).toLocaleDateString()}
                          </span>
                        </li>
                      ))}
                      {donation.foodItems.length > 3 && (
                        <li className="text-sm text-gray-500">
                          + {donation.foodItems.length - 3} more items
                        </li>
                      )}
                    </ul>

                    <div className="mb-4">
                      <h4 className="text-md font-medium text-gray-800 mb-1">
                        Location:
                      </h4>
                      <p className="text-sm text-gray-600">
                        {donation.pickupAddress.city},{" "}
                        {donation.pickupAddress.postcode}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-gray-50 sm:px-6 flex justify-end">
                    <Link
                      to={`/donations/${donation._id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DonationsList;
