# Email/SMS Spam Classifier - Deployment Guide

## Quick Start

```
Frontend: Vercel (React/Vite)
Backend: Render (Flask API)
Database: SQLite (included)
WebSocket: SocketIO on Render
```

---

## 📋 Deployment Platforms

### Frontend: Vercel
- ✅ Best for React/Vite
- ✅ Global CDN
- ✅ Serverless
- ✅ Free tier

### Backend: Render
- ✅ Python support
- ✅ WebSocket ready
- ✅ SQLite support
- ✅ Auto-deploys from GitHub

---

## 🚀 Complete Setup (20 minutes)

### Step 1: Prepare GitHub Repository

```bash
# Initialize git if needed
git init
git add .
git commit -m "Initial commit with Vercel + Render setup"
git remote add origin https://github.com/YOUR-USERNAME/email-sms-spam-classifier.git
git push -u origin main
```

### Step 2: Deploy Frontend to Vercel

1. **Go to https://vercel.com** → Sign up with GitHub
2. Click **"New Project"**
3. **Import Git Repository** → Select your repo
4. **Configure:**
   - Framework: `Vite`
   - Root Directory: `./frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Environment Variables:**
   - Key: `VITE_API_BASE`
   - Value: `https://YOUR-RENDER-APP.onrender.com` (will update after Render setup)
6. Click **Deploy** ✅

**Get your Vercel domain:** `https://spam-classifier-XXXXX.vercel.app`

### Step 3: Deploy Backend to Render

#### Option A: Using Render Dashboard (Easiest)

1. **Go to https://render.com** → Sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. **Connect Repository:**
   - Select your GitHub repo
   - Grant permissions if prompted
4. **Configure Service:**
   - **Name:** `spam-classifier-api`
   - **Environment:** `Python 3`
   - **Region:** Pick closest to you
   - **Branch:** `main`
   - **Build Command:** 
     ```
     pip install -r requirements.txt && npm --prefix frontend install && npm --prefix frontend run build
     ```
   - **Start Command:**
     ```
     gunicorn --worker-class eventlet -w 1 app:app
     ```
5. **Environment Variables:**
   - `FLASK_ENV` = `production`
6. Click **Deploy** ✅

**Get your Render URL:** `https://spam-classifier-api.onrender.com`

#### Option B: Using Render CLI

```bash
# Install Render CLI
npm install -g @render-web/cli

# Login
render login

# Create service from repo
render create web \
  --name spam-classifier-api \
  --buildCommand "pip install -r requirements.txt && npm --prefix frontend install && npm --prefix frontend run build" \
  --startCommand "gunicorn --worker-class eventlet -w 1 app:app"
```

### Step 4: Update Vercel Environment Variable

1. Go back to **Vercel Dashboard** → Your project
2. Go to **Settings** → **Environment Variables**
3. Update `VITE_API_BASE`:
   - Old: `https://localhost:5000`
   - New: `https://spam-classifier-api.onrender.com`
4. **Redeploy** from Vercel dashboard

### Step 5: Update GitHub Secrets (for Auto-Deploy)

Go to GitHub Repo → **Settings** → **Secrets and variables** → **Actions**

Add these secrets:

```
VERCEL_TOKEN          → From Vercel Account Settings
VERCEL_ORG_ID         → From Vercel dashboard
VERCEL_PROJECT_ID     → From Vercel dashboard  
VERCEL_DOMAIN         → spam-classifier-XXXXX.vercel.app

RENDER_API_KEY        → From Render Account Settings
RENDER_SERVICE_ID     → Service ID from Render URL (srv-xxxxx)
RENDER_SERVICE_NAME   → spam-classifier-api
```

**Getting Render Service ID:**
- Go to Render dashboard → Your service
- URL: `https://dashboard.render.com/web/srv-ABC123XYZ`
- Service ID: `srv-ABC123XYZ`

---

## 📦 Architecture

```
┌─────────────────────────────────────────────┐
│         GitHub Repository (main)            │
│  (Your code - stored here, triggers CI/CD)  │
└─────────────────┬──────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
   ┌────▼─────┐      ┌───────▼────┐
   │  Vercel  │      │   Render   │
   │(Frontend)│      │  (Backend) │
   └──────────┘      └────────────┘
        │                   │
        │                   │
        ↓                   ↓
   vercel.app         onrender.com
   (React UI)      (Flask API + WebSocket)
        │                   │
        └───────────┬───────┘
                    │
            ┌───────▼────────┐
            │  Your Database │
            │  (SQLite on    │
            │   Render)      │
            └────────────────┘
```

---

## 🔄 Automatic Deployment (GitHub Actions)

Once secrets are set up, pushing to `main` triggers:

1. **Run Tests** (pytest)
2. **Build Frontend** (Vite)
3. **Deploy to Vercel** (auto)
4. **Deploy to Render** (auto)

```bash
git push origin main
# → Workflows run automatically
# → Your app updates in 2-5 minutes
```

---

## 🛠️ Local Development

```bash
# Backend
python app.py
# Runs on http://localhost:5000

# Frontend (new terminal)
cd frontend
npm run dev
# Runs on http://localhost:5173

# Frontend .env
VITE_API_BASE=http://localhost:5000
```

---

## 📊 Monitoring & Logs

### Vercel
- **Dashboard:** https://vercel.com/dashboard
- Click project → **Deployments** tab
- View build logs and deployment status

### Render
- **Dashboard:** https://dashboard.render.com
- Click service → **Logs** tab
- Real-time application logs

### GitHub Actions
- **Actions tab** in your GitHub repo
- Click workflow run for detailed logs
- See test results and deployment status

---

## ✅ Deployment Checklist

- [ ] GitHub repo created and code pushed
- [ ] Vercel project created and deployed
- [ ] Render service created and deployed
- [ ] VITE_API_BASE points to Render backend
- [ ] GitHub secrets configured (5 secrets)
- [ ] First push to main succeeds
- [ ] Frontend loads and can call API
- [ ] WebSocket connection works (live activity)
- [ ] Database operations work

---

## 🚨 Troubleshooting

### Frontend won't load
- Check VITE_API_BASE in Vercel env vars
- Ensure value is `https://YOUR-RENDER-APP.onrender.com`
- Redeploy Vercel after env var change

### API calls failing (CORS error)
- Check Flask CORS is enabled (it is by default)
- Verify Render backend is running
- Check Render logs for errors
- Try accessing backend directly: `https://render-url/api/metrics`

### Backend won't deploy
- Check Procfile syntax
- Verify runtime.txt exists
- Check Render logs for build errors
- Ensure all dependencies in requirements.txt
- Try manual redeploy from Render dashboard

### WebSocket not connecting
- Ensure `flask-socketio` installed
- Check Render logs: should see "WebSocket connected"
- Verify API_BASE is correct in frontend
- No port conflicts (Render auto-assigns)

### Database errors
- SQLite file auto-created on first run
- Check Render logs for permission errors
- Ensure spam_classifier.db path is writable
- Delete old DB and restart service to reinit

---

## 🔑 Environment Variables

### Render Backend
```
FLASK_ENV=production
FLASK_DEBUG=0
API_BASE=https://spam-classifier-XXXXX.vercel.app
DATABASE_URL=sqlite:///spam_classifier.db (optional)
```

### Vercel Frontend
```
VITE_API_BASE=https://spam-classifier-api.onrender.com
```

---

## 📈 Performance Tips

1. **Keep backend warm:** Render's free tier hibernates. Use a monitoring service.
2. **Optimize images:** Vercel auto-optimizes, but check frontend build size.
3. **Monitor database:** SQLite is fine for small projects. Upgrade if >100MB.
4. **Check logs regularly:** Render and Vercel dashboards show issues early.

---

## 🆘 Getting Help

**Vercel Issues:**
- Docs: https://vercel.com/docs
- Vercel Community: https://github.com/vercel/vercel/discussions

**Render Issues:**
- Docs: https://render.com/docs
- Status: https://render.statuspage.io

**GitHub Actions:**
- Docs: https://docs.github.com/en/actions
- Troubleshooting: https://docs.github.com/en/actions/administering-github-actions/troubleshooting-github-actions

---

## 🎯 Next Steps

1. **Create Vercel account** (5 min)
2. **Create Render account** (5 min)
3. **Deploy both** (5 min each)
4. **Configure GitHub secrets** (2 min)
5. **Push to main** (1 min)
6. **Watch deployments** in Actions tab ✅

Your app will auto-deploy on every push to main!


