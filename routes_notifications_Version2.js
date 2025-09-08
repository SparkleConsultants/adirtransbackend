import { Router } from 'express';
import Notification from '../models/notification.js';
import auth from '../middleware/auth.js';

const router = Router();

// Get my notifications
router.get('/', auth, async (req, res) => {
  const notifications = await Notification.find({ user: req.user.userId }).sort('-createdAt');
  res.json(notifications);
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.userId },
    { read: true },
    { new: true }
  );
  if (!notification) return res.status(404).json({ error: 'Not found' });
  res.json(notification);
});

export default router;