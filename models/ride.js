import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'] },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // who requested the ride
  createdAt: { type: Date, default: Date.now }
});

const Ride = mongoose.model('Ride', rideSchema);
export default Ride;