import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/notifications"
      );
      setNotifications(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/notifications/${id}/read`);
      // Update local state
      setNotifications(
        notifications.map((notif) =>
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.patch("http://localhost:5000/api/notifications/read-all");
      // Update local state
      setNotifications(
        notifications.map((notif) => ({ ...notif, read: true }))
      );
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${id}`);
      // Update local state
      setNotifications(notifications.filter((notif) => notif._id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

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
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>

          {notifications.some((notif) => !notif.read) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-md hover:bg-green-200"
            >
              Mark all as read
            </button>
          )}
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

          {notifications.length === 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center">
                <p className="text-gray-500">
                  You don't have any notifications yet.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <ul className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <li
                    key={notification._id}
                    className={`px-4 py-4 ${
                      !notification.read ? "bg-green-50" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                          {notification.message}
                        </p>
                        <div className="mt-2 flex space-x-3">
                          {notification.relatedTo && (
                            <Link
                              to={`/donations/${notification.relatedTo}`}
                              className="text-xs text-green-600 hover:text-green-800"
                              onClick={() => {
                                if (!notification.read) {
                                  handleMarkAsRead(notification._id);
                                }
                              }}
                            >
                              View Donation
                            </Link>
                          )}
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(notification._id)}
                        className="ml-4 text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">Delete</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notifications;
