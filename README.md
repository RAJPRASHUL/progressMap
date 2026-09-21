# ProgressMap

ProgressMap is a full-stack productivity dashboard for tracking daily tasks, completion streaks, perfect-day milestones, notes, and long-term progress.

## Resume Highlights

**ProgressMap | React | Vite | Node.js | Express | MongoDB**

- Built a full-stack productivity dashboard with JWT authentication, daily task management, notes, streak tracking, and a GitHub-style activity heatmap.
- Developed permanent perfect-day badge milestones with current streak tracking, consistency metrics, weekday averages, and achievements progress.
- Implemented responsive dashboard, profile settings, avatar uploads, one-way task completion, date-based task drawers, and downloadable heatmap PNG exports.
- Deployed the React frontend on Vercel and the Express/MongoDB backend on Render with protected API routes and MongoDB Atlas persistence.

## Live Demo

Try the deployed application:

[Open ProgressMap](https://progress-map-ten.vercel.app/auth)

The live frontend is deployed on Vercel and connects to the Express API deployed on Render. Open the link above to register or sign in and use the dashboard.

## Screenshots

### Login and Registration

The authentication screen allows new users to create an account and returning users to sign in securely.

![ProgressMap login and registration screen](image/login.png)

### Dashboard

The dashboard brings together Today's Quest, the yearly activity heatmap, weekday averages, consistency, streak progress, and the badge wall.

![ProgressMap dashboard](image/dashboard.png)

### Achievements

The Achievements page displays perfect-day badge tiers, unlocked milestones, progress toward the next tier, and the user's longest perfect streak.

![ProgressMap achievements page](image/achievement.png)

## Features

- User registration and login with JWT authentication
- Daily task creation, completion, and deletion
- One-way task completion from Today's Quest
- GitHub-style yearly activity heatmap
- Monday-first or Sunday-first heatmap layout
- Weekday completion averages
- Current streak and consistency metrics
- Permanent perfect-day badge milestones
- Achievements page with badge progress
- Notes for individual dates
- Profile name and avatar settings
- Heatmap PNG export
- Account deletion and logout

## Tech Stack

- React 18
- Vite
- React Router
- Tailwind CSS
- Express
- MongoDB with Mongoose
- JWT
- bcrypt
- html2canvas

## Project Structure

```text
progressMap/
├── src/                  # React frontend
│   ├── components/       # Dashboard and reusable UI components
│   ├── context/          # Authentication and app contexts
│   ├── pages/            # Auth, dashboard, achievements, and settings pages
│   ├── styles/           # Global styles
│   ├── storage.js        # Frontend API client
│   └── utils/            # Milestones and image export helpers
├── server/               # Express backend
│   ├── middleware/       # Authentication middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # Auth, tasks, notes, and settings routes
│   └── index.js          # API server entry point
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Requirements

- Node.js 18 or newer
- npm
- MongoDB Atlas or a local MongoDB server

## Installation

Clone the repository and install both frontend and backend dependencies:

```bash
git clone https://github.com/YOUR_USERNAME/progressMap.git
cd progressMap
npm install
cd server
npm install
cd ..
```

## Environment Variables

Create a `.env` file in the project root. The backend loads this file automatically.

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/progressmap
JWT_SECRET=replace-with-a-long-random-secret
PORT=5000
```


## Run Locally

Start the backend in one terminal:

```bash
cd server
npm start
```

Start the Vite frontend in a second terminal from the project root:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

The Vite development server proxies `/api` requests to `http://localhost:5000`.

## Available Scripts

From the project root:

```bash
npm run dev       # Start the Vite development server
npm run build     # Create a production build in dist/
npm run preview   # Preview the production build locally
npm run server    # Start the backend from the project root
```

From the `server` directory:

```bash
npm start         # Start the Express API
npm run dev       # Start the API with Node watch mode
```

## API Overview

All task, note, and settings routes require a JWT bearer token.

### Health Check

```http
GET /api/health
```

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
```

Registration and login return a JWT token and user data.

### Tasks

```http
GET    /api/tasks?from=YYYY-MM-DD&to=YYYY-MM-DD
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
```

Task creation requires `title` and `date`. Task updates can change `title`, `completed`, `order`, or `date`.

### Notes

```http
GET /api/notes?from=YYYY-MM-DD&to=YYYY-MM-DD
GET /api/notes/:date
PUT /api/notes/:date
```

### Settings

```http
GET    /api/settings
PUT    /api/settings
DELETE /api/settings/account
```

Settings include the user name, avatar, and heatmap week-start preference.

## Production Deployment

The frontend and backend can be deployed separately.

### Deploy the Backend

Deploy the `server` directory as a Node/Express web service on Render, Railway, Fly.io, or a similar platform.

Use:

```text
Build command: npm install
Start command: npm start
Root directory: server
```

Configure these production environment variables on the hosting platform:

```env
MONGODB_URI=your-production-mongodb-connection-string
JWT_SECRET=your-production-jwt-secret
PORT=5000
```

Verify the deployed API with:

```text
https://your-api-domain.example.com/api/health
```

### MongoDB connection fails

Check that:

- `MONGODB_URI` is present in the root `.env` file.
- The MongoDB user and password are correct.
- Your current IP address is allowed in MongoDB Atlas Network Access.
- The database user has permission to read and write the database.

### API requests fail in production

Confirm that the deployed frontend routes `/api/*` to the deployed backend and that the backend allows requests from the frontend domain through CORS.
