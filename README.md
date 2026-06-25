# Smart School Bus Tracking & Parent Notification System

A production-ready full-stack real-time school bus tracking platform with live GPS tracking, QR/RFID attendance scanning, and automated parent notifications via Firebase Cloud Messaging (FCM) and email.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios, Socket.IO Client, Google Maps API, Recharts |
| Backend | Node.js, Express.js, Socket.IO, JWT, bcrypt, Mongoose |
| Database | MongoDB |
| Notifications | Firebase Cloud Messaging, Nodemailer |
| Optional | Cloudinary (profile images) |

## Features

- **Real-time bus tracking** — Driver GPS updates via Socket.IO every few seconds
- **Role-based dashboards** — Admin, Driver, and Parent portals
- **QR/RFID scanning** — Board/drop attendance with automatic parent alerts
- **Absent automation** — Unscanned students marked absent after trip start delay
- **Attendance reports** — Daily, monthly, and student-wise reports with charts
- **Live map** — Google Maps integration with route visualization
- **Push & email notifications** — FCM push and Nodemailer email alerts

## Project Structure

```
Bus_Tracker/
├── backend/
│   ├── config/          # DB, Firebase, Cloudinary
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, validation, errors
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express API routes
│   ├── services/        # Notifications, attendance, email, push
│   ├── sockets/         # Socket.IO handlers
│   ├── utils/           # Helpers, seed script
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Auth context
│   │   ├── hooks/       # useGeolocation
│   │   ├── pages/       # Role-based pages
│   │   └── services/    # API & Socket clients
│   └── public/
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB 6+ (local or Atlas)
- Google Maps API key ([Google Cloud Console](https://console.cloud.google.com/))
- Firebase project for FCM (optional for development)
- SMTP credentials for email (optional for development)

## Installation

### 1. Clone and install dependencies

```bash
cd Bus_Tracker

# Backend
cd backend
cp .env.example .env
npm install

# Frontend
cd ../frontend
cp .env.example .env
npm install
```

### 2. Configure environment variables

**Backend** (`backend/.env`):

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/smart_school_bus
JWT_SECRET=your_super_secret_jwt_key
```

**Frontend** (`frontend/.env`):

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 3. Seed the database

```bash
cd backend
npm run seed
```

### 4. Start the application

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.com | admin123 |
| Driver | driver@school.com | driver123 |
| Parent | parent@school.com | parent123 |

## API Modules

| Module | Base Path | Description |
|--------|-----------|-------------|
| Auth | `/api/auth` | Login, register, JWT, FCM token |
| Students | `/api/students` | CRUD, bus assignment |
| Drivers | `/api/drivers` | CRUD, profile |
| Buses | `/api/buses` | CRUD, student list |
| Routes | `/api/routes` | CRUD with stops |
| Attendance | `/api/attendance` | Scan, trip control, reports |
| Notifications | `/api/notifications` | Notification logs |
| Tracking | `/api/tracking` | Live locations, active trips |
| Parent | `/api/parent` | Children, attendance, notifications |

## Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `location:update` | Client → Server | Driver sends GPS coordinates |
| `location:receive` | Server → Client | Broadcast bus location |
| `student:boarded` | Server → Client | Student boarded notification |
| `student:dropped` | Server → Client | Student dropped notification |
| `attendance:update` | Server → Client | Attendance record updated |
| `notification:send` | Server → Client | New notification for parent/admin |
| `join:bus` | Client → Server | Join bus room for updates |

## User Roles

### Admin
- Manage buses, drivers, students, routes
- View attendance reports and analytics
- Track all buses in real time
- View notification logs

### Driver
- Start/end morning or afternoon trips
- Scan student QR/RFID codes
- Auto-broadcast GPS location during trips
- View assigned route and students

### Parent
- Track child's bus on live map
- Receive push/email notifications
- View attendance history and today's status

## Attendance States

`Present` → `Boarded` → `Reached School` → `Boarded Return Trip` → `Reached Home` → `Absent`

## Notification Examples

- **Boarded:** "Your child John has boarded Bus 12 at 7:45 AM."
- **Reached School:** "Your child John has safely reached school at 8:20 AM."
- **Return:** "Your child John has left school and boarded Bus 12."
- **Home:** "Your child John has reached home safely."
- **Absent:** "Attendance Alert: Your child John is absent today."

## Security

- JWT authentication with role-based access control
- bcrypt password hashing (12 rounds)
- Input validation via express-validator
- Protected REST routes and Socket.IO handshake auth
- CORS restricted to client URL

## Firebase Setup (Push Notifications)

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Go to Project Settings → Service Accounts → Generate new private key
3. Add credentials to `backend/.env`:
   ```
   FIREBASE_PROJECT_ID=...
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

## Email Setup (Nodemailer)

For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833):

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="Smart School Bus <noreply@schoolbus.com>"
```

## Google Maps Setup

1. Enable **Maps JavaScript API** in Google Cloud Console
2. Create an API key and restrict it to your domain
3. Add to `frontend/.env` as `VITE_GOOGLE_MAPS_API_KEY`

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Deploy MongoDB Atlas cluster
4. Build frontend: `cd frontend && npm run build`
5. Serve frontend static files via Nginx or CDN
6. Run backend with PM2: `pm2 start server.js --name school-bus-api`
7. Enable HTTPS for geolocation and secure WebSocket

## License

MIT
