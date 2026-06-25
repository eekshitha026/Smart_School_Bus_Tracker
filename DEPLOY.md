# Deployment Guide

This app has two parts:
- **Frontend** → [Vercel](https://vercel.com) (React/Vite)
- **Backend** → [Render](https://render.com) (Express + Socket.IO + MongoDB)

> Vercel cannot host the backend because Socket.IO needs a persistent server, not serverless functions.

---

## 1. MongoDB Atlas (required for production)

1. Create a free cluster at https://www.mongodb.com/atlas
2. Create a database user and allow network access from anywhere (`0.0.0.0/0`)
3. Copy the connection string, e.g.:
   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/smart_school_bus
   ```

---

## 2. Deploy backend to Render

1. Push this repo to GitHub
2. Go to https://dashboard.render.com → **New** → **Blueprint**
3. Connect the repo — Render reads `render.yaml` automatically
4. Set environment variables in Render dashboard:
   - `MONGODB_URI` = your Atlas connection string
   - `CLIENT_URL` = your Vercel URL (set after step 3), e.g. `https://smart-school-bus.vercel.app`
5. After deploy, copy your Render URL, e.g. `https://smart-school-bus-api.onrender.com`

Seed production data (run once locally pointing at Atlas):
```bash
cd backend
# Set MONGODB_URI in .env to Atlas URI first
npm run seed
```

---

## 3. Deploy frontend to Vercel

### Option A — Vercel CLI (fastest)

```bash
cd frontend
npx vercel login
npx vercel --prod
```

When prompted:
- **Root directory:** `frontend` (if deploying from repo root)
- **Framework:** Vite

Set environment variables in Vercel dashboard (Project → Settings → Environment Variables):

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://YOUR-RENDER-URL.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://YOUR-RENDER-URL.onrender.com` |
| `VITE_GOOGLE_MAPS_API_KEY` | your Google Maps key |

Redeploy after adding env vars: `npx vercel --prod`

### Option B — Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Add the environment variables above
5. Click **Deploy**

---

## 4. Update Render CORS

After Vercel deploys, update Render env var:
```
CLIENT_URL=https://your-app.vercel.app
```

---

## Production URLs

| Service | URL |
|---------|-----|
| App | `https://your-app.vercel.app` |
| API health | `https://your-api.onrender.com/api/health` |

---

## One-command local Vercel preview (no backend in cloud)

```bash
cd frontend
npx vercel
```

This only deploys the frontend. API calls will fail until `VITE_API_URL` points to a live backend.
