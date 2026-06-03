import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Notification from '../models/Notification';

// GET /api/notifications
export const getNotifications = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ userId: req.user!.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ userId: req.user!.id }),
    Notification.countDocuments({ userId: req.user!.id, isRead: false }),
  ]);

  res.status(200).json({
    success: true,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit), unreadCount },
    data: notifications,
  });
};

// PATCH /api/notifications/:id/read
export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    res.status(404).json({ success: false, message: 'Notification not found' });
    return;
  }

  res.status(200).json({ success: true, data: notification });
};

// PATCH /api/notifications/read-all
export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  await Notification.updateMany(
    { userId: req.user!.id, isRead: false },
    { isRead: true }
  );
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
};

// DELETE /api/notifications/:id
export const deleteNotification = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  await Notification.findOneAndDelete({
    _id: req.params.id,
    userId: req.user!.id,
  });
  res.status(200).json({ success: true, message: 'Notification deleted' });
};
