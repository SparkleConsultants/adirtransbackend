import { Router } from 'express';
import Ride from '../models/ride.js';
import User from '../models/user.js';
import Notification from '../models/notification.js';
import auth from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = Router();

// GET /api/rides
router.get('/', async (req, res) => {
  try {
    const rides = await Ride.find().populate('driver user');
    res.json(rides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/rides
router.post('/', auth, async (req, res) => {
  try {
    const { from, to, status } = req.body;
    const newRide = new Ride({ from, to, status, user: req.user.userId });
    await newRide.save();
    res.status(201).json(newRide);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/rides/:id
router.get('/:id', async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate('driver user');
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    res.json(ride);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/rides/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const ride = await Ride.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    res.json(ride);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/rides/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const ride = await Ride.findByIdAndDelete(req.params.id);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: Assign driver to ride
router.post('/:id/assign-driver', auth, requireRole('admin'), async (req, res) => {
  try {
    const { driverId } = req.body;
    const ride = await Ride.findById(req.params.id);
    const driver = await User.findById(driverId);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    if (!driver || driver.role !== 'driver') return res.status(404).json({ error: 'Driver not found' });

    ride.driver = driverId;
    ride.status = 'assigned';
    await ride.save();

    // Notify driver and user
    const io = req.app.get('io');
    await Notification.create({
      user: driverId,
      message: `You have been assigned to ride from ${ride.from} to ${ride.to}.`,
      type: 'ride'
    });
    io.to(driverId.toString()).emit('notification', { message: `You have been assigned to ride from ${ride.from} to ${ride.to}.` });
    if (ride.user) {
      await Notification.create({
        user: ride.user,
        message: `A driver has been assigned to your ride from ${ride.from} to ${ride.to}.`,
        type: 'ride'
      });
      io.to(ride.user.toString()).emit('notification', { message: `A driver has been assigned to your ride from ${ride.from} to ${ride.to}.` });
    }

    res.json({ message: 'Driver assigned', ride });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Driver: Accept assigned ride
router.post('/:id/accept', auth, requireRole('driver'), async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    if (String(ride.driver) !== String(req.user.userId)) {
      return res.status(403).json({ error: 'Not your assigned ride' });
    }
    ride.status = 'in-progress';
    await ride.save();

    // Notify user
    const io = req.app.get('io');
    if (ride.user) {
      await Notification.create({
        user: ride.user,
        message: `Your ride is now in-progress.`,
        type: 'ride'
      });
      io.to(ride.user.toString()).emit('rideStatus', { rideId: ride._id, status: ride.status });
    }

    res.json(ride);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;