import { useEffect, useState } from "react";
import {
  getNotificationsAPI,
  markNotificationReadAPI,
  markAllNotificationsReadAPI,
  clearNotificationsAPI,
} from "../services/api";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem("userId");

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      const data = await getNotificationsAPI(userId);

      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when component loads
  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  // Mark one notification as read
  const handleMarkRead = async (notificationId) => {
    try {
      await markNotificationReadAPI(notificationId);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    if (!userId) return;

    try {
      await markAllNotificationsReadAPI(userId);

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  // Clear all notifications
  const handleClear = async () => {
    if (!userId) return;

    try {
      await clearNotificationsAPI(userId);

      setNotifications([]);
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);

          if (!isOpen) {
            fetchNotifications();
          }
        }}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
      >
        🔔

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
          <div className="flex justify-between items-center p-3 border-b">
            <h3 className="font-semibold">Notifications</h3>

            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-sm text-blue-600 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() =>
                    !notification.is_read &&
                    handleMarkRead(notification.id)
                  }
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                    !notification.is_read ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="font-medium">
                    {notification.title}
                  </div>

                  <div className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </div>

                  <div className="text-xs text-gray-400 mt-1">
                    {notification.type}
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-2 border-t">
              <button
                onClick={handleClear}
                className="w-full text-sm text-red-500 hover:text-red-700"
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;