import { Router } from 'express';
import Payment from '../models/payment.js';
import auth from '../middleware/auth.js';

const router = Router();

// User: Create payment for a ride
router.post('/', auth, async (req, res) => {
  try {
    const { rideId, amount } = req.body;
    const payment = new Payment({
      user: req.user.userId,
      ride: rideId,
      amount,
      status: 'pending'
    });
    await payment.save();
    // Here you would integrate with Stripe/Flutterwave/etc.
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// User: View my payments
router.get('/', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.userId }).populate('ride');
    res.json(payments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;