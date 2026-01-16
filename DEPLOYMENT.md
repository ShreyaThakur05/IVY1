# 🚀 Deployment Guide - IVY

## Frontend Deployment (Vercel)

### 1. Prepare for Deployment
```bash
npm run build  # Test build locally
```

### 2. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set root directory: ./
# - Build command: npm run build
# - Output directory: .next
```

### 3. Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
```

## Backend Deployment (Railway/Render)

### Option A: Railway

1. Visit: https://railway.app
2. New Project → Deploy from GitHub
3. Select your repo → backend folder
4. Add environment variables:
   ```
   GROQ_API_KEY=...
   GEMINI_API_KEY=...
   ELEVENLABS_API_KEY=...
   SUPABASE_URL=...
   SUPABASE_KEY=...
   ```
5. Railway will auto-detect FastAPI
6. Copy the deployed URL

### Option B: Render

1. Visit: https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Deploy

## Update Frontend API URL

In `src/lib/api.js`:
```javascript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
```

Add to Vercel env:
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

## Production Checklist

### Security
- [ ] Enable HTTPS only
- [ ] Update CORS origins in backend
- [ ] Use environment variables for all secrets
- [ ] Enable Supabase RLS policies
- [ ] Add rate limiting

### Performance
- [ ] Enable CDN for static assets
- [ ] Optimize images (Next.js Image component)
- [ ] Enable audio streaming
- [ ] Add Redis caching (optional)

### Monitoring
- [ ] Setup error tracking (Sentry)
- [ ] Add analytics (Vercel Analytics)
- [ ] Monitor API usage (ElevenLabs dashboard)
- [ ] Setup uptime monitoring

## Update CORS for Production

In `backend/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-app.vercel.app"  # Add your domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Custom Domain (Optional)

### Vercel
1. Domains → Add Domain
2. Follow DNS configuration
3. SSL auto-configured

### Backend
1. Railway/Render → Custom Domain
2. Add CNAME record
3. SSL auto-configured

## Cost Estimation (Monthly)

### Free Tier
- Vercel: Free (Hobby)
- Railway: $5 credit/month
- Supabase: Free (500MB DB)
- Groq: Free (limited requests)
- Gemini: Free (60 req/min)
- ElevenLabs: Free (10k chars/month)

**Total: $0-5/month** for testing

### Production Scale
- Vercel Pro: $20/month
- Railway: ~$20/month
- Supabase Pro: $25/month
- ElevenLabs Creator: $22/month
- Gemini: Pay-as-you-go

**Total: ~$87/month** for 1000+ users

## Scaling Considerations

### 1000+ Users
- Add Redis for session caching
- Use ElevenLabs WebSocket API
- Implement audio chunking
- Add CDN for audio files

### 10,000+ Users
- Migrate to dedicated servers
- Add load balancer
- Use message queue (RabbitMQ)
- Implement horizontal scaling

## Backup Strategy

### Database
```bash
# Supabase auto-backups (Pro plan)
# Or manual backup:
pg_dump -h db.xxx.supabase.co -U postgres > backup.sql
```

### Voice Samples
- Supabase Storage has built-in redundancy
- Consider S3 backup for critical data

## Monitoring Commands

```bash
# Check backend health
curl https://your-backend.railway.app/docs

# Check frontend
curl https://your-app.vercel.app

# Monitor logs
vercel logs
railway logs
```

## Rollback Plan

### Frontend
```bash
vercel rollback
```

### Backend
- Railway: Deployments → Previous deployment → Redeploy
- Render: Rollback from dashboard

---

**🎉 Your IVY app is now live!**
