import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

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

    // Poll for new notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);

    return () => clearInterval(interval);
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

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  return (
    <div className="relative">
      <button
        className="p-1 rounded-full text-gray-700 hover:text-green-600 focus:outline-none"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span className="sr-only">View notifications</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
        )}
      </button>

      {showDropdown && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-2">
            <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-green-600 hover:text-green-800"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-2 text-sm text-gray-500">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-2 text-sm text-gray-500">
                  No notifications
                </div>
              ) : (
                notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification._id}
                    className={`px-4 py-2 hover:bg-gray-100 ${
                      !notification.read ? "bg-green-50" : ""
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <div className="mt-1 flex space-x-2">
                      {notification.relatedTo && (
                        <Link
                          to={`/donations/${notification.relatedTo}`}
                          className="text-xs text-green-600 hover:text-green-800"
                          onClick={() => {
                            handleMarkAsRead(notification._id);
                            setShowDropdown(false);
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
                ))
              )}
            </div>

            {notifications.length > 5 && (
              <div className="px-4 py-2 border-t border-gray-200">
                <Link
                  to="/notifications"
                  className="text-sm text-green-600 hover:text-green-800"
                  onClick={() => setShowDropdown(false)}
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
