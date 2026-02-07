# Deployment Guide

Complete guide to deploy Lumina E-Commerce on free-tier cloud services.

## Required Accounts (All Free)

1. **GitHub** - Code repository
2. **Vercel** - Frontend hosting (vercel.com)
3. **Render** - Backend hosting (render.com)
4. **Neon** - PostgreSQL database (neon.tech)
5. **Upstash** - Redis cache (upstash.com)

---

## Step 1: Database Setup (Neon)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy your connection string:
   ```
   postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this for backend deployment

---

## Step 2: Redis Setup (Upstash)

1. Go to [upstash.com](https://upstash.com) and sign up
2. Create a new Redis database
3. Copy your Redis URL:
   ```
   redis://default:xxx@xxx.upstash.io:6379
   ```
4. Save this for backend deployment

---

## Step 3: Backend Deployment (Render)

1. Go to [render.com](https://render.com) and sign up
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `lumina-api`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

5. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Your Neon connection string |
   | `REDIS_URL` | Your Upstash Redis URL |
   | `SECRET_KEY` | Generate a random 32-char string |
   | `STRIPE_SECRET_KEY` | Your Stripe secret key |
   | `STRIPE_WEBHOOK_SECRET` | (Optional) Stripe webhook secret |

6. Click "Create Web Service"
7. Wait for deployment (~5 min)
8. Your API URL: `https://lumina-api.onrender.com`

> **Note**: Free tier spins down after 15 min inactivity. First request after idle may take 30-60 seconds.

---

## Step 4: Frontend Deployment (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "Add New" → "Project"
3. Import your repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`

5. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | Your Render backend URL |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key |

6. Click "Deploy"
7. Your frontend URL: `https://your-project.vercel.app`

---

## Step 5: Set Up CI/CD (GitHub Actions)

The `.github/workflows/deploy.yml` file is already configured.

### Add GitHub Secrets:
1. Go to your GitHub repo → Settings → Secrets → Actions
2. Add these secrets:
   - `NEXT_PUBLIC_API_URL` - Your Render backend URL
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
   - `RENDER_DEPLOY_HOOK` - (Optional) Render deploy hook URL

### Get Render Deploy Hook:
1. In Render dashboard, go to your service
2. Settings → Deploy Hook
3. Copy the URL and add as GitHub secret

---

## Step 6: Initialize Database

After backend is deployed:

```bash
# Option 1: Run seed script via Render shell
# Go to Render dashboard → Shell → Run:
python seed_data.py

# Option 2: Use the API to create initial data
curl -X POST https://your-api.onrender.com/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"adminpass","full_name":"Admin"}'
```

---

## Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify all environment variables are set
- Make sure DATABASE_URL uses `postgresql://` (not `postgres://`)

### Frontend can't connect to API
- Verify NEXT_PUBLIC_API_URL is correct
- Check for CORS errors in browser console
- Ensure backend is running (not spun down)

### Database connection fails
- Verify Neon database is active
- Check SSL mode in connection string
- Try adding `?sslmode=require` to DATABASE_URL

---

## Free Tier Limits

| Service | Limits |
|---------|--------|
| **Vercel** | 100GB bandwidth, unlimited deploys |
| **Render** | 750 hours/month, spins down after 15min idle |
| **Neon** | 0.5GB storage, auto-suspend after 5min idle |
| **Upstash** | 10K commands/day, 256MB storage |

---

## Your Live URLs

After deployment, you'll have:

- **Frontend**: `https://your-project.vercel.app`
- **Backend API**: `https://lumina-api.onrender.com`
- **API Docs**: `https://lumina-api.onrender.com/docs`
