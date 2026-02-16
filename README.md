# 🚖 RouteSync

### Real-Time Shared Mobility Coordination Platform

![Next.js](https://img.shields.io/badge/Next.js-Frontend-black?logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-darkgreen?logo=mongodb)
![Redis](https://img.shields.io/badge/Redis-Cache-red?logo=redis)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-black?logo=socket.io)
![License](https://img.shields.io/badge/License-MIT-blue)
![Status](https://img.shields.io/badge/Status-MVP--Development-orange)

---

## 📌 Overview

**RouteSync** is a real-time route coordination platform that digitally connects shared transport drivers (auto-rickshaws, vans, mini buses) with passengers traveling along the same predefined routes.

It removes manual route shouting, hand signaling, and repetitive destination confirmations by providing **live route visibility and seat tracking**.

Built specifically for high-density, low-cost shared mobility ecosystems.

---

## 🎯 Problem

Shared transportation in many cities operates informally:

* Manual passenger signaling
* Route shouting by drivers
* Repetitive destination checks
* Fuel and time wastage
* No digital coordination layer
* Ride-hailing alternatives are expensive

---

## 💡 Solution

RouteSync provides:

### For Drivers

* Route selection before trip
* Live GPS sharing
* Seat availability toggle
* Passenger visibility on route
* Online / Offline mode

### For Passengers

* Pickup & drop selection
* Live vehicle tracking
* Route-matched discovery
* ETA calculation
* Hassle-free boarding

---

## 🏗 Architecture

### Frontend

* Next.js (App Router)
* Google Maps / Mapbox
* PWA Support
* WebSockets integration

### Backend

* Node.js + Express
* MongoDB (2dsphere geospatial indexing)
* Redis (driver state cache)
* Socket.IO (real-time communication)

### Infrastructure

* AWS / DigitalOcean / GCP
* Horizontal scaling
* CDN for static assets

---

## 🧠 Core Modules

### Driver Module

* Authentication & KYC
* Route selection
* Live tracking (5s interval)
* Seat management
* Route deviation detection

### Passenger Module

* Location detection
* Route matching
* Vehicle discovery
* ETA estimation

### Admin Panel

* Driver verification
* Route management
* Analytics dashboard
* System monitoring

---

## 🔍 Route Matching Logic

1. Driver selects predefined route polyline
2. Passenger selects pickup & drop
3. System validates:

   * Pickup within X meters of route
   * Drop ahead in route direction

MongoDB `2dsphere` indexing ensures fast geospatial querying.

---

## ⚠️ Edge Case Handling

| Scenario               | Handling               |
| ---------------------- | ---------------------- |
| Driver route deviation | Alert + flag           |
| GPS drift              | Polyline snapping      |
| No internet            | Low-frequency fallback |
| Passenger no-show      | Seat auto-release      |
| Fake drivers           | KYC verification       |
| Traffic congestion     | Dynamic ETA            |

---

## 🔐 Security

* HTTPS enforced
* JWT-based authentication
* Driver KYC validation
* Vehicle verification
* SOS feature
* Rating & reporting system

---

## 🚀 MVP Roadmap

### Phase 1 – Core Visibility

* Driver tracking
* Passenger discovery
* Basic route matching

### Phase 2 – Optimization

* Smart ETA
* Seat analytics
* Route usage metrics

### Phase 3 – Intelligence

* AI demand prediction
* Congestion-based optimization
* Smart route suggestions

---

## 📊 Scalability Strategy

Hyperlocal launch:

* Railway stations
* College corridors
* Market clusters

Density-first expansion model.

---

# 🛠 Local Development Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Rajneesh0021/routesync.git
cd routesync
```

## 2️⃣ Install Dependencies

Frontend:

```bash
cd client
npm install
```

Backend:

```bash
cd server
npm install
```

## 3️⃣ Environment Variables

Create `.env` in `/server`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection
REDIS_URL=your_redis_connection
JWT_SECRET=your_secret_key
GOOGLE_MAPS_API_KEY=your_key
```

## 4️⃣ Run Development

Backend:

```bash
npm run dev
```

Frontend:

```bash
npm run dev
```

---

# 📂 Project Structure

```
routesync/
│
├── client/          # Next.js frontend
├── server/          # Node.js backend
├── docs/            # Documentation
├── scripts/         # Deployment scripts
└── README.md
```
---

## 🧪 Development Guidelines

* Follow clean architecture principles
* Write modular, scalable code
* Add meaningful commit messages
* Test geospatial queries properly

---

## 📌 Open Issues

* Route snapping optimization
* Real-time scaling under 10k concurrent drivers
* Battery-efficient GPS polling
* Offline fallback architecture

---

## 📜 License

MIT License

---

## 📬 Contact

**Rajneesh**
Full Stack Developer
MERN | Next.js | Real-time Systems | AI
