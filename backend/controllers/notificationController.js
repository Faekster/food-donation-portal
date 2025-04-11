import Notification from "../models/Notification.js";

// Get user's notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.userId,
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Ensure user can only mark their own notifications as read
    if (notification.recipient.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this notification" });
    }

    notification.read = true;
    await notification.save();

    res.json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.userId },
      { $set: { read: true } }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Ensure user can only delete their own notifications
    if (notification.recipient.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this notification" });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper function to create notifications (will be used in other controllers)
export const createNotification = async (
  recipientId,
  type,
  title,
  message,
  relatedToId = null
) => {
  try {
    // Ensure relatedToId is a string if provided
    const safeRelatedToId = relatedToId ? relatedToId.toString() : null;

    const notification = new Notification({
      recipient: recipientId,
      type,
      title,
      message,
      relatedTo: safeRelatedToId,
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Create notification error:", error);
    return null;
  }
};
