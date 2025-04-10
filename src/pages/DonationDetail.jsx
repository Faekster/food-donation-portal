import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const DonationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/donations/${id}`
        );
        setDonation(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching donation:", err);
        setError("Failed to load donation details. Please try again later.");
        setLoading(false);
      }
    };

    fetchDonation();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (
      !window.confirm(`Are you sure you want to ${newStatus} this donation?`)
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/donations/${id}/status`,
        {
          status: newStatus,
        }
      );
      setDonation(response.data.donation);
      setIsProcessing(false);
    } catch (err) {
      console.error(`Error ${newStatus} donation:`, err);
      setError(`Failed to ${newStatus} donation. Please try again.`);
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this donation? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      await axios.delete(`http://localhost:5000/api/donations/${id}`);
      navigate("/dashboard");
    } catch (err) {
      console.error("Error deleting donation:", err);
      setError("Failed to delete donation. Please try again.");
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
          role="alert"
        >
          <p>{error}</p>
        </div>
        <div className="mt-4">
          <Link to="/dashboard" className="text-green-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <p className="text-gray-500">
              Donation not found or has been removed.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <Link to="/dashboard" className="text-green-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {/* Header */}
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Donation Details
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Status:{" "}
              <span
                className={`font-medium ${
                  donation.status === "available"
                    ? "text-green-600"
                    : donation.status === "claimed"
                    ? "text-blue-600"
                    : donation.status === "completed"
                    ? "text-gray-600"
                    : "text-red-600"
                }`}
              >
                {donation.status.charAt(0).toUpperCase() +
                  donation.status.slice(1)}
              </span>
            </p>
          </div>
          <div>
            <Link to="/dashboard" className="text-green-600 hover:underline">
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Donor Information */}
        <div className="px-4 py-5 sm:p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Donor Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Organization/Name
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {donation.donor?.organization || donation.donor?.name}
              </p>
            </div>

            {/* Only show contact details if recipient has claimed the donation */}
            {(user.role === "recipient" &&
              donation.status === "claimed" &&
              donation.recipient === user._id) ||
            (user.role === "donor" && donation.donor === user._id) ? (
              <>
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {donation.donor?.phone || "No phone provided"}
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Food Items */}
        <div className="px-4 py-5 sm:p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Food Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Expiry Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donation.foodItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.category.charAt(0).toUpperCase() +
                        item.category.slice(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pickup Information */}
        <div className="px-4 py-5 sm:p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Pickup Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-2">
                Pickup Address
              </h4>
              <p className="text-sm text-gray-600 mb-1">
                {donation.pickupAddress.street}
              </p>
              <p className="text-sm text-gray-600">
                {donation.pickupAddress.city}, {donation.pickupAddress.postcode}
              </p>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-800 mb-2">
                Pickup Time
              </h4>
              <p className="text-sm text-gray-600 mb-1">
                From: {new Date(donation.pickupTime.from).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                To: {new Date(donation.pickupTime.to).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {donation.notes && (
          <div className="px-4 py-5 sm:p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Additional Notes
            </h3>
            <p className="text-sm text-gray-600">{donation.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-4 py-5 sm:p-6 flex flex-wrap gap-4 justify-end">
          {/* Donor actions */}
          {user.role === "donor" && user._id === donation.donor._id && (
            <>
              {donation.status === "available" && (
                <>
                  <button
                    onClick={handleDelete}
                    disabled={isProcessing}
                    className={`px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 ${
                      isProcessing ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    Delete
                  </button>

                  <button
                    onClick={() => handleStatusChange("cancelled")}
                    disabled={isProcessing}
                    className={`px-4 py-2 rounded-md text-white bg-gray-600 hover:bg-gray-700 ${
                      isProcessing ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    Cancel
                  </button>
                </>
              )}

              {donation.status === "claimed" && (
                <button
                  onClick={() => handleStatusChange("completed")}
                  disabled={isProcessing}
                  className={`px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 ${
                    isProcessing ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  Mark as Completed
                </button>
              )}
            </>
          )}

          {/* Recipient actions */}
          {user.role === "recipient" && (
            <>
              {donation.status === "available" && (
                <button
                  onClick={() => handleStatusChange("claimed")}
                  disabled={isProcessing}
                  className={`px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 ${
                    isProcessing ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  Claim Donation
                </button>
              )}

              {donation.status === "claimed" &&
                donation.recipient === user._id && (
                  <>
                    <button
                      onClick={() => handleStatusChange("completed")}
                      disabled={isProcessing}
                      className={`px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 ${
                        isProcessing ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      Mark as Completed
                    </button>

                    <button
                      onClick={() => handleStatusChange("cancelled")}
                      disabled={isProcessing}
                      className={`px-4 py-2 rounded-md text-white bg-gray-600 hover:bg-gray-700 ${
                        isProcessing ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      Cancel Claim
                    </button>
                  </>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationDetail;
