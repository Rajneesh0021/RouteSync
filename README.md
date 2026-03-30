# RouteSync – Real-Time Shared Mobility Platform 🚖

RouteSync is a cutting-edge, full-stack shared mobility system designed to connect drivers of auto-rickshaws, e-rickshaws, and shared vans with passengers based on communal travel routes.

## 🚀 Key Features

### 🚗 For Drivers
- **Real-Time Operation**: Unified dashboard to toggle online status and broadcast live GPS location.
- **Route Selection**: Pick from predefined high-demand communal routes.
- **Seat Management**: Atomic seat control to manage onboard passenger capacity.
- **Earnings & Performance**: Track daily trip history and performance metrics.

### 🧍 For Passengers
- **Smart Discovery**: Locate nearby vehicles heading towards your destination using geospatial matching.
- **Live Tracking**: Real-time vehicle movement visualization on interactive maps.
- **Unified History**: Rapid access to past rides with denormalized summaries.

### 🛠️ Technology Stack
- **Frontend**: React (Vite) + Framer Motion (Animations) + Leaflet (Maps) + Zustand (State)
- **Backend**: Node.js + Express + Socket.IO + Mongoose
- **Database**: MongoDB (Geospatial Indexing) + Redis (Real-time caching)
- **Design**: Premium Glassmorphic UI with Outfit & Inter typography.

## 📦 Project Structure
```text
Routesync/
├── backend/
│   ├── src/
│   │   ├── modules/      # Modular API logic (Auth, Drivers, Passengers, etc.)
│   │   ├── models/       # MongoDB Schemas
│   │   ├── sockets/      # Real-time event handling
│   │   └── server.js     # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI parts
│   │   ├── pages/        # Main application views
│   │   ├── services/     # API & logic layer
│   │   └── styles/       # Design system (index.css)
```

## 🚥 Getting Started

### 1. Requirements
- Node.js (v18+)
- MongoDB (Running locally or Atlas)
- Redis (Optional for real-time caching)

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Built with ❤️ for urban commute efficiency by Rajneesh.
