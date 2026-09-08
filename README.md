# Striver A2Z DSA Problem Tracker 🚀

A full-stack web application to track your progress across all **1000 problems** from the Striver A2Z Master DSA Roadmap.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Tech Stack](https://img.shields.io/badge/Express-4-green) ![Tech Stack](https://img.shields.io/badge/MongoDB-7-brightgreen) ![Tech Stack](https://img.shields.io/badge/Tailwind-3-purple)

## Features

- ✅ Track 1000 DSA problems across 16 topics
- 📊 Visual dashboard with progress rings, stats, and streaks
- 🏷️ Filter by difficulty (Easy/Medium/Hard), status, and Original 369
- 📝 Add personal notes and solution links to each problem
- 🔍 Search problems by title
- 🌙 Dark mode (default) with light mode toggle
- 📱 Fully responsive — works on mobile, tablet, and desktop
- 🐳 Docker support for easy self-hosting
- ☁️ Deployable to Vercel + Railway (free tier)

## Quick Start (Local Development)

### Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org))
- **MongoDB** running locally, or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

### 1. Clone and install

```bash
git clone <your-repo-url> striver-tracker
cd striver-tracker

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure environment

```bash
cd server
cp .env.example .env
# Edit .env if your MongoDB is not at the default localhost:27017
```

### 3. Seed the database

```bash
cd server
node scripts/seed.js
# This parses the master problem list and inserts all 1000 problems into MongoDB
```

### 4. Start the app

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Docker (Self-Hosting)

```bash
# Build and start all services
docker-compose up --build

# Seed the database (first time only)
docker exec striver-server node scripts/seed.js
```

Open **http://localhost:3000** in your browser.

---

## Cloud Deployment

### Frontend → Vercel (Free)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com), import the repo
3. Set root directory to `client`
4. Set environment variable: `VITE_API_URL` = your backend URL (e.g., `https://your-backend.railway.app`)
5. Deploy

### Backend → Railway (Free Tier)

1. Go to [railway.app](https://railway.app), create new project
2. Add a **MongoDB** service (or use MongoDB Atlas)
3. Add a **Node.js** service, point to the `server` directory
4. Set environment variables:
   - `MONGO_URI` = your MongoDB connection string
   - `PORT` = 5000
5. Deploy

### Database → MongoDB Atlas (Free M0)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free M0 cluster
3. Get your connection string
4. Use it as `MONGO_URI` in your backend

---

## Project Structure

```
striver-tracker/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Dashboard, TopicPage
│   │   ├── hooks/           # Custom React hooks
│   │   └── api/             # API client
│   └── ...
├── server/                  # Express.js backend
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API route handlers
│   ├── scripts/             # Database seed script
│   └── server.js            # Entry point
├── docker-compose.yml
├── Dockerfile.client
├── Dockerfile.server
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/problems` | List problems (supports filters) |
| GET | `/api/problems/:number` | Get single problem |
| PATCH | `/api/problems/:number` | Update problem |
| PATCH | `/api/problems/bulk/update` | Bulk update problems |
| POST | `/api/problems/reset` | Reset all progress |
| GET | `/api/stats` | Overall statistics |
| GET | `/api/stats/topics` | Per-topic statistics |
| GET | `/api/stats/streak` | Completion streak |

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router, Axios, Lucide Icons
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB
- **Deployment**: Docker, Vercel, Railway

---

Built with ❤️ for DSA grinders.
