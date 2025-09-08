import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';

import ridesRouter from './routes/rides.js';
import usersRouter from './routes/users.js';
import bookingsRouter from './routes/bookings.js';
import paymentsRouter from './routes/payments.js';
import notificationsRouter from './routes/notifications.js';
import analyticsRouter from './routes/analytics.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.connection.on('connected', () => console.log('Connected to MongoDB'));
mongoose.connection.on('error', err => console.error('MongoDB error:', err));

app.set('io', io);

app.get('/', (req, res) => res.json({ message: 'adirtrans backend API is running.' }));

app.use('/api/rides', ridesRouter);
app.use('/api/users', usersRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/analytics', analyticsRouter);

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('join', (userId) => socket.join(userId));
  socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));