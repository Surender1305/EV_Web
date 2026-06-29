# ChargeFinder Pondy ⚡

ChargeFinder Pondy is a modern, premium web application designed to help Electric Vehicle (EV) drivers locate, book, and manage charging slots in the Puducherry area. It also provides an administrative dashboard for station owners to manage their charging infrastructure, track bookings, and monitor revenue.

## 🌟 Features

### For EV Drivers
- **Interactive Map View**: Discover nearby charging stations in real-time, filtered by connector types, minimum power (kW), pricing, and availability.
- **Convenient Slot Booking**: Pick a date, choose a duration (30m to 120m), select a time slot, and reserve a specific connector (CCS, CHAdeMO, Type 2, Tesla).
- **Wallet System**: Easily top-up your wallet using a seamless UPI / Razorpay mock flow and pay for charging sessions directly.
- **Charging Simulation**: Live tracking of current active charging sessions showing elapsed time, energy delivered (kWh), and calculated cost.
- **Favorites & Notifications**: Add preferred stations to a favorites list and receive instant notifications for booking confirmations, charging status changes, and top-ups.
- **Navigation Integration**: Quick shortcut to navigate directly to the station via Google Maps.

### For Station Owners
- **Station Management**: Add new charging stations, edit existing station amenities, rates, or connector specs, and delete stations.
- **Bookings Dashboard**: Monitor incoming driver reservations and slot occupancies.
- **Earnings & Transactions**: Keep track of payments made at owned stations.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, TailwindCSS v4, Vite, Leaflet (Map visualization), Lucide Icons.
- **Backend**: Express (Node.js), JSON File-based DB (lightweight development storage), JWT authentication, bcryptjs (password hashing).
- **Payment Integration**: Razorpay SDK (with a mock bypass for testing with placeholder keys).

---

## 📁 Project Structure

```text
├── backend/
│   ├── db.js             # File-based database adapter (reading/writing db.json)
│   ├── db.json           # Local database file storing users, stations, bookings, etc.
│   ├── server.js         # Express app configuration and API routes
│   └── middleware/
│       └── auth.js       # JWT validation middleware
├── src/
│   ├── components/       # React UI Components (Layout, LoginPage, DiscoverPage, MapView, BookingsPage, etc.)
│   ├── context/          # React AppContext using useReducer for global state management
│   ├── data/             # Mock data / initial states
│   ├── types/            # TypeScript interface definitions
│   ├── utils/
│   │   ├── api.ts        # Client API request wrapper (using fetch & Bearer Token)
│   │   └── helpers.ts    # Date/time formatters, coordinate distance calculators, etc.
│   ├── App.tsx           # Application routing and root layout
│   └── main.tsx          # Application entry point
├── package.json          # Node dependencies and scripts
└── vite.config.ts        # Vite configuration (includes API proxy setting)
```

---

## 🚀 Getting Started

### 📋 Prerequisites
Ensure you have **Node.js** (v18+) and **npm** installed on your machine.

### 📥 Installation

1. Clone or navigate to the project directory:
   ```bash
   cd Kani
   ```

2. Install the dependencies for the project:
   ```bash
   npm install
   ```

### ⚡ Running the Application

You can start the frontend and backend servers concurrently with a single command:

```bash
npm start
```

This runs:
- **Frontend (Vite)** on [http://localhost:5173](http://localhost:5173)
- **Backend (Express)** on [http://localhost:5000](http://localhost:5000)

*(Vite is configured to automatically proxy requests made to `/api` over to the backend server running on port 5000).*

---

## 🔧 Backend Logic Improvements

We recently addressed several critical issues in the backend server (`backend/server.js`) to restore correct functionality:
- **Slot Reservation Resolution**: Booking a slot previously locked the charger status to `occupied` instantly, blocking all other future reservations. We moved the `occupied` state update to the actual charging session trigger (`/api/bookings/:id/start-charging`), allowing normal bookings again.
- **Math Type Safety**: Wallet balance increments in `/api/wallet/topup` were updated to enforce `Number` casting, avoiding database corruption from string concatenation.
- **Refund Scoping**: Cancellation refunds are now safely evaluated using `booking.userId` instead of `req.user.id` to ensure proper balance allocation.
