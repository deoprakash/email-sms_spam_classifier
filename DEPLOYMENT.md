# Email/SMS Spam Classifier - CI/CD Pipeline Setup

## GitHub Actions Workflows

This project includes automated testing and deployment pipelines using GitHub Actions.

### 📋 Workflows Overview

#### 1. **Backend Tests** (`.github/workflows/backend-tests.yml`)
Runs on every push and pull request to `main` or `develop` branches.

**Features:**
- Tests Python 3.9, 3.10, 3.11, 3.12 compatibility
- Runs pytest with coverage reporting
- Performs code quality checks with flake8
- Uploads coverage reports to Codecov
- Downloads required NLTK data

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`
- Changes to backend files

#### 2. **Frontend Build** (`.github/workflows/frontend-build.yml`)
Runs whenever frontend files change.

**Features:**
- Sets up Node.js 18
- Installs dependencies with npm ci
- Runs ESLint for code quality
- Builds production bundle with Vite
- Uploads build artifacts
- Validates build integrity

**Triggers:**
- Push to `main` or `develop`
- Pull requests with frontend changes

#### 3. **Deploy to Production** (`.github/workflows/deploy.yml`)
Automatically deploys to production when code is pushed to `main`.

**Supports:**
- ✅ Heroku
- ✅ Railway
- ✅ Render

**Flow:**
1. Runs all tests (gating deployment)
2. If tests pass, deploys to configured platform
3. Sends deployment summary notification

---

## 🚀 Setup Instructions

### Prerequisites
- GitHub repository (push this code to GitHub)
- Python 3.12+ locally for testing
- Node.js 18+ for frontend development

### Step 1: Set Up GitHub Secrets

Go to your GitHub repo → Settings → Secrets and variables → Actions

#### For Heroku Deployment:
```
HEROKU_API_KEY      → Get from Heroku Account Settings
HEROKU_APP_NAME     → Your Heroku app name (e.g., "spam-classifier-prod")
HEROKU_EMAIL        → Your Heroku account email
```

#### For Railway Deployment:
```
RAILWAY_TOKEN       → Railway project token
RAILWAY_SERVICE_NAME → Your Railway service name
```

#### For Render Deployment:
```
RENDER_DEPLOY_HOOK  → Deploy hook URL from Render dashboard
RENDER_SERVICE_NAME → Your Render service name
```

### Step 2: Choose Your Deployment Platform

#### **Option A: Heroku** (Easiest)
1. Create Heroku account: https://heroku.com
2. Create new app: `heroku create spam-classifier-prod`
3. Get API key: Account Settings → API Key
4. Add secrets to GitHub (see Step 1)

```bash
# Local testing with Heroku
heroku login
heroku create <app-name>
git push heroku main
```

#### **Option B: Railway**
1. Create Railway account: https://railway.app
2. Connect GitHub repo in Railway dashboard
3. Set environment variables in Railway project
4. Get project token
5. Add secrets to GitHub

```bash
# Railway deploys automatically on push
# No extra steps needed after setup
```

#### **Option C: Render**
1. Create Render account: https://render.com
2. Create new Web Service
3. Connect GitHub repo
4. Get Deploy Hook URL (Settings → Deploy Hook)
5. Add secrets to GitHub

```bash
# Render deploys on webhook trigger
# Automatic after webhook setup
```

### Step 3: Configure Environment Variables

Create a `.env` file for local development:

```bash
# Backend
FLASK_ENV=development
FLASK_DEBUG=1

# Frontend (in frontend/.env)
VITE_API_BASE=http://localhost:5000
```

For production (on deployment platform):

```
DATABASE_URL=postgresql://...  (if using)
FLASK_ENV=production
API_BASE=https://your-app.herokuapp.com
```

### Step 4: Run Tests Locally

```bash
# Backend tests
pytest test_app.py -v --cov

# Frontend build
cd frontend
npm run build

# Lint check
npm run lint
```

---

## 📦 Project Structure for Deployment

```
.
├── .github/
│   └── workflows/
│       ├── backend-tests.yml    # Test Python code
│       ├── frontend-build.yml   # Build React app
│       └── deploy.yml           # Deploy to production
├── Procfile                     # Heroku deployment config
├── runtime.txt                  # Python version for Heroku
├── build.sh                     # Build script for frontend
├── app.py                       # Flask backend
├── frontend/                    # React frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── tools/
│   ├── db_helper.py
│   ├── model_trainer.py
│   └── __init__.py
├── requirements.txt             # Python dependencies
├── test_app.py                  # Pytest tests
└── .gitignore                   # Git ignore rules
```

---

## 🔄 Workflow Execution

### When you push code:

1. **GitHub detects changes** → Triggers workflows
2. **Backend tests run** (if Python files changed)
3. **Frontend build runs** (if React files changed)
4. **If all pass & push to main** → Deployment starts
5. **App deploys to production**
6. **You get GitHub notification** of success/failure

### Manual Deployment

If you need to redeploy without code changes:

1. Go to Actions tab in GitHub
2. Select "Deploy to Production" workflow
3. Click "Run workflow"
4. Choose platform (Heroku/Railway/Render)
5. Watch the deployment progress

---

## ✅ Deployment Checklist

- [ ] GitHub repository created and code pushed
- [ ] GitHub secrets configured for your platform
- [ ] Procfile updated with correct app name
- [ ] requirements.txt includes all dependencies
- [ ] frontend/package.json has build script
- [ ] All tests pass locally (`pytest`, `npm run build`)
- [ ] Deployment platform account created
- [ ] Environment variables set on deployment platform
- [ ] First deployment triggered (push to main or manual)

---

## 🛠️ Troubleshooting

### Tests failing in CI but passing locally?
- Check Python version differences
- Ensure NLTK data is downloaded (CI handles this)
- Verify requirements.txt matches local environment

### Deployment fails?
- Check GitHub secrets are set correctly
- Verify platform credentials are active
- Review deployment logs in GitHub Actions
- Check deployment platform logs for errors

### Frontend build failing?
- Check Node.js version (should be 18+)
- Verify npm ci succeeds locally
- Check for missing dependencies in package.json
- Ensure VITE_API_BASE is set correctly

---

## 📊 Monitoring

### GitHub Actions Dashboard
- Go to Actions tab to see workflow history
- Click on workflow runs for detailed logs
- See test coverage and build artifacts

### Deployment Platform Dashboards
- **Heroku:** View logs with `heroku logs --tail`
- **Railway:** Built-in dashboard with metrics
- **Render:** Real-time logs and deployment history

---

## 🚨 Important Notes

1. **Secrets Security:** Never commit `.env` or secrets to GitHub
2. **Test Coverage:** Maintain >70% test coverage
3. **Build Size:** Keep frontend build <5MB
4. **Database Migrations:** Handle schema changes carefully
5. **Downtime:** Plan zero-downtime deployments

---

## Next Steps

1. Push code to GitHub
2. Verify workflows appear in Actions tab
3. Configure secrets for your deployment platform
4. Make a test commit to main branch
5. Watch deployment happen automatically! 🚀
