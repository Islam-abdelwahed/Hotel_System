# Hotel Booking System API

A backend system for managing hotel room bookings, reservations, payments, and background tasks. Built with Node.js, Express, MongoDB, and Stripe.

---

## Features

- **Room Management**: Search for available rooms and manage room statuses.
- **Reservations**: Create, confirm, check-in, and check-out reservations.
- **Payment Processing**: Integrates with Stripe for secure payment handling.
- **Background Jobs**: Uses Bull (Redis) to auto-expire unconfirmed reservations.
- **Role-Based Access**: Supports `admin`, `reception`, and `guest` roles.

---

## Technologies Used

- **Backend**: Node.js, Express
- **Database**: MongoDB, Mongoose
- **Payment Gateway**: Stripe
- **Job Queue**: Bull (Redis)
- **Authentication**: JWT

---

## Getting Started

### Prerequisites

- Node.js
- MongoDB
- Redis (for Bull job queue)
- Stripe Account (for payment processing)

### Installation

1. **Clone the Repository**:
   ```bash
   git clone git@github.com:Islam-abdelwahed/Hotel_System.git
   cd hotel-system
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory (use `.env.example` as a template):
   ```env
   MONGODB_URI=mongodb://localhost:27017/hotel_booking
   STRIPE_SECRET_KEY=sk_test_your_stripe_key
   JWT_SECRET=your_jwt_secret
   REDIS_URL=redis://127.0.0.1:6379
   PORT=3000
   ```

4. **Start Redis Server**:
   ```bash
   redis-server
   ```

5. **Start the Application**:
   ```bash
   npm start
   ```

---

## API Endpoints

| Endpoint                          | Method | Description                              |
|-----------------------------------|--------|------------------------------------------|
| `GET /api/rooms`                  | GET    | List all available rooms                 |
| `POST /api/reservations`          | POST   | Create a new reservation                 |
| `POST /api/reservations/:id/pay`  | POST   | Process payment for a reservation        |
| `POST /api/reservations/:id/checkin` | POST | Check-in a guest                       |
| `POST /api/reservations/:id/checkout` | POST | Check-out a guest                     |
| `GET /api/reservations`           | GET    | List all reservations                   |

[View full API documentation](docs/API.md)
