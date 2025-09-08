import { Router } from 'express';
import Ride from '../models/ride.js';
import Booking from '../models/booking.js';
import User from '../models/user.js';
import auth from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = Router();

// General stats (admin only)
router.get('/stats', auth, requireRole('admin'), async (req, res) => {
  const [rides, bookings, users, drivers] = await Promise.all([
    Ride.countDocuments(),
    Booking.countDocuments(),
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'driver' }),
  ]);
  res.json({ rides, bookings, users, drivers });
});

// Ride stats by status
router.get('/rides-by-status', auth, requireRole('admin'), async (req, res) => {
  const stats = await Ride.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  res.json(stats);
});

// Bookings over time (last 7 days)
router.get('/bookings-weekly', auth, requireRole('admin'), async (req, res) => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const stats = await Booking.aggregate([
    { $match: { bookedAt: { $gte: weekAgo } } },
    { $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$bookedAt" } },
      count: { $sum: 1 }
    }},
    { $sort: { _id: 1 } }
  ]);
  res.json(stats);
});

export default router;