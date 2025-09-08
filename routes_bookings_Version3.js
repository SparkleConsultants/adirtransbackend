import { Router } from 'express';
import Booking from '../models/booking.js';
import Ride from '../models/ride.js';
import auth from '../middleware/auth.js';

const router = Router();

// Create a booking (protected)
router.post('/', auth, async (req, res) => {
  try {
    const { rideId } = req.body;
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });

    const booking = new Booking({ ride: rideId, user: req.user.userId });
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List bookings for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.userId }).populate('ride');
    res.json(bookings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Cancel a booking
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user.userId });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    booking.status = 'cancelled';
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;