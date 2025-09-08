# adirtrans-backend

Backend for Adirtrans (Node.js/Express/MongoDB/Socket.IO).

## Features

- User authentication and roles (user, driver, admin)
- Rides management, driver assignment, ride status updates
- Bookings, payments (scaffold), notifications (in-app & real-time)
- Real-time updates with Socket.IO
- Analytics endpoints for admin dashboard

## Setup

1. Install dependencies

    ```bash
    npm install
    ```

2. Set up your `.env` file:

    ```
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/adirtrans
    JWT_SECRET=your_jwt_secret_here
    ```

3. Start MongoDB locally, or use [MongoDB Atlas](https://www.mongodb.com/atlas) and update `MONGODB_URI`.

4. Run the backend server

    ```bash
    npm run dev
    ```

5. The backend API will be available at `http://localhost:5000`.

## API Endpoints

- `/api/users/register`, `/api/users/login`, `/api/users/me`
- `/api/rides` (CRUD, assign driver, status updates)
- `/api/bookings` (CRUD)
- `/api/payments` (create, list)
- `/api/notifications` (fetch, mark as read)
- `/api/analytics` (admin stats)

## Real-time

- Connect to Socket.IO at `ws://localhost:5000` for ride status and notifications.
- On login, emit `join` with your userId.

## Deploy

- Deploy on services like Heroku, Render, Railway, or your own server.
- For cloud MongoDB, update `MONGODB_URI` accordingly.
