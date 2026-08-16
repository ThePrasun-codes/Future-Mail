# ✅ AI Cold Email Generator - Complete Setup & Deployment Checklist

## 🚀 Quick Start Guide

### 1️⃣ Prerequisites Setup

#### MongoDB Connection
- [ ] Create MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)
- [ ] Create a cluster
- [ ] Get connection string
- [ ] Update `MONGODB_URI` in `.env`

#### Groq API Setup
- [ ] Go to https://console.groq.com/keys
- [ ] Create account (Google/GitHub login)
- [ ] Generate API key
- [ ] Update `GROQ_API_KEY` in `.env`

#### Gmail Configuration (for OTP emails)
- [ ] Enable 2-factor authentication on Gmail
- [ ] Create App Password: https://myaccount.google.com/apppasswords
- [ ] Update `EMAIL_USER` and `EMAIL_PASS` in `.env`

### 2️⃣ Installation

```bash
# Root directory
npm run install:all

# Or manually:
cd server && npm install
cd ../client && npm install
cd ..
```

### 3️⃣ Environment Setup

Create/Update `.env` in `server/` directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster0.mongodb.net/aicoldemail?appName=Cluster0
JWT_SECRET=your_very_secure_random_secret_key_change_this
GROQ_API_KEY=gsk_xxxxx
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=xxxx_xxxx_xxxx_xxxx (16-char app password)
FRONTEND_URL=http://localhost:5173
```

Create `.env` in `client/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4️⃣ Running Development Server

```bash
# From root directory
npm run dev

# This starts:
# - Backend on http://localhost:5000
# - Frontend on http://localhost:5173
```

### 5️⃣ Testing the App

#### Test User Registration & Email Verification:
1. Go to http://localhost:5173/signup
2. Register with email
3. Check email for OTP
4. Verify with OTP
5. Login with credentials

#### Test Email Generation:
1. Go to Dashboard (after login)
2. Enter prompt: "Generate cold email for SDE role at Google"
3. Click Generate
4. View generated email

#### View History:
1. All generated emails appear in history
2. Click to expand and view all variants

---

## 📋 Feature Checklist

### Authentication
- [x] User Registration with validation
- [x] Email OTP Verification
- [x] Login with JWT
- [x] Protected Routes
- [x] Logout functionality

### AI Email Generation
- [x] Cold email subject line generation
- [x] Professional email body generation
- [x] LinkedIn DM variant
- [x] Follow-up email generation
- [x] Email history storage

### Security
- [x] Password hashing (bcrypt)
- [x] JWT Token validation
- [x] Input validation & sanitization
- [x] CORS configuration
- [x] Error message handling
- [x] Environment variable validation

### Code Quality
- [x] Error handling in all endpoints
- [x] Proper HTTP status codes
- [x] Consistent error response format
- [x] Input type validation
- [x] Database query validation

---

## 🔍 API Testing with Postman

### 1. Register User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. Verify OTP
```
POST http://localhost:5000/api/auth/verify-otp
Content-Type: application/json

{
  "userId": "user_id_from_register",
  "otp": "123456"
}
```

### 3. Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### 4. Generate Email (Protected)
```
POST http://localhost:5000/api/ai/generate-email
Content-Type: application/json
Authorization: Bearer <token_from_login>

{
  "prompt": "Write a cold email to a startup founder about AI services"
}
```

### 5. Get History (Protected)
```
GET http://localhost:5000/api/ai/history
Authorization: Bearer <token_from_login>
```

---

## 📬 Time Capsule Feature (Scheduled Mail)

Requires `npm install multer node-cron` inside `server/` first. No new env vars needed.

### 6. Create Draft (Protected, form-data)
```
POST http://localhost:5000/api/capsules
Authorization: Bearer <token_from_login>
Body (form-data):
  recipientEmail: someone@example.com
  subject: Following up
  message: Hi, just checking in...
  aiGenerated: false
  attachment: <file, optional>
```

### 7. Lock / Schedule (Protected)
```
POST http://localhost:5000/api/capsules/<capsule_id>/lock
Authorization: Bearer <token_from_login>
Content-Type: application/json

{ "scheduledAt": "2026-08-09T10:00:00.000Z" }
```
Omit `scheduledAt` (or send `null`) to send immediately instead of scheduling.

### 8. Edit (Protected, form-data) — only while locked and before scheduledAt
```
PUT http://localhost:5000/api/capsules/<capsule_id>
Authorization: Bearer <token_from_login>
Body (form-data): any of recipientEmail, subject, message, attachment, scheduledAt
```

### 9. Cancel (Protected) — only while locked and before scheduledAt
```
PATCH http://localhost:5000/api/capsules/<capsule_id>/cancel
Authorization: Bearer <token_from_login>
```

### 10. Send Now (Protected)
```
POST http://localhost:5000/api/capsules/<capsule_id>/send-now
Authorization: Bearer <token_from_login>
```

### 11. History (Protected)
```
GET http://localhost:5000/api/capsules
GET http://localhost:5000/api/capsules?status=sent
Authorization: Bearer <token_from_login>
```

**Quick end-to-end test:** create a draft → lock it with `scheduledAt` ~2 minutes in the future → leave the server console open → after 2 minutes the scheduler should log `Capsule ... sent.` and the status should flip to `sent` on the next History call.

---

## 🐛 Troubleshooting

### Issue: "MongoDB Connection Error"
**Solution:**
- Check `MONGODB_URI` is correct
- Check IP whitelist in MongoDB Atlas (allow 0.0.0.0 for development)
- Verify username/password in connection string

### Issue: "Groq API 404 Error"
**Solution:**
- Verify `GROQ_API_KEY` is correct
- Check API key hasn't expired
- Ensure you're using correct model name

### Issue: "Email not sending for OTP"
**Solution:**
- Verify `EMAIL_USER` and `EMAIL_PASS` are correct
- Use 16-character App Password, not regular password
- Check Gmail security settings
- Verify Less Secure Apps is enabled (if not using App Password)

### Issue: "Port 5000 already in use"
**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Issue: "Frontend can't connect to Backend"
**Solution:**
- Verify `VITE_API_URL` in client/.env
- Check backend is running on port 5000
- Check CORS in server.js includes frontend URL

---

## 📦 Production Deployment

### Before Deploying:
- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Enable HTTPS/SSL certificates
- [ ] Enable database backups
- [ ] Set up error logging (Sentry, LogRocket)
- [ ] Set up monitoring (New Relic, DataDog)
- [ ] Rate limiting enabled
- [ ] Helmet security headers added

> ⚠️ **Time Capsule attachments on Render's free tier (verified against Render's own docs, Aug 2026):** capsule documents are saved to `server/uploads` on local disk. Render states plainly that a Free web service's filesystem is wiped **every time it redeploys, restarts, or spins down** — and free services spin down after just **15 minutes** of no incoming traffic. Free services also cannot attach a persistent disk at all (that's a paid-tier add-on, priced separately, and still requires manually mounting it). Net effect: on the free tier, a capsule attachment isn't reliably safe past ~15 idle minutes, not just "hours or days later" as originally noted here. Two ways to handle it:
> 1. **Cheap/partial fix:** ping the backend every ~10 min (UptimeRobot, cron-job.org — free) so it never goes idle long enough to spin down. Also fixes the scheduler-not-ticking issue below. Doesn't survive an actual `git push` redeploy while a capsule is pending, though.
> 2. **Real fix:** stop using local disk for attachments — upload straight to Cloudinary/S3 from `uploadMiddleware.js` instead. Independent of Render's container lifecycle entirely. Recommended if this needs to actually be reliable.

> ⚠️ **Scheduler needs the process awake:** `node-cron` only ticks while the Node process is running. If the free-tier service has spun down, a capsule's `scheduledAt` can pass with nobody home to send it — it'll fire late, on the next incoming request that wakes the service up. The same anti-sleep ping above fixes this too.

### Step-by-step: Backend on Render (free tier)

1. Push this repo to GitHub (`.env` is already gitignored — never commit real secrets).
2. Create a free MongoDB Atlas cluster (M0 tier) → Database Access: create a user → Network Access: allow `0.0.0.0/0` for now → copy the connection string.
3. On [render.com](https://render.com), sign up (no card needed) → **New +** → **Web Service** → connect this GitHub repo.
4. Configure it:
   - **Root Directory:** `server`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js` (not `nodemon` — that's dev-only)
   - **Instance Type:** Free
5. Add Environment Variables (same names `server.js` checks for): `MONGODB_URI` (Atlas string), `JWT_SECRET`, `GROQ_API_KEY`, `EMAIL_USER`, `EMAIL_PASS`, `FRONTEND_URL` (fill this in after step 2 below).
6. **Create Web Service** → wait for the build → you get a URL like `https://your-app.onrender.com`.

### Step-by-step: Frontend on Vercel

1. On [vercel.com](https://vercel.com), sign up → **Add New… → Project** → import the same GitHub repo.
2. **Root Directory:** `client`. Framework Preset: Vite (auto-detected).
3. Environment Variable: `VITE_API_URL` = `https://your-app.onrender.com/api` (your Render URL from above, with `/api`).
4. **Deploy** → you get a URL like `https://your-app.vercel.app`.
5. Go back to Render → update `FRONTEND_URL` to this Vercel URL → this avoids CORS errors.

### Step-by-step: Test the live app

1. Open the Vercel URL → sign up → check email for OTP → verify → log in.
2. Try AI generation on the Dashboard.
3. Time Capsule: in the Postman collection, change the `base_url` variable to `https://your-app.onrender.com/api`, then run through Create Draft → Lock (2 min out) → wait → History should show `sent`.

### Other Options (if you outgrow Render/Vercel free tier)

- **Backend:** Railway, AWS EC2, DigitalOcean App Platform/Droplet, or self-host the existing `docker-compose.yml` on any VPS.
- **Frontend:** Netlify, AWS S3 + CloudFront, GitHub Pages.
- **Database:** MongoDB Atlas paid tiers, or self-hosted via the `mongo` service already in `docker-compose.yml`.

---

## 📊 Performance Optimization Tips

1. **Add Caching**
   ```bash
   npm install redis
   ```

2. **Add Compression**
   ```bash
   npm install compression
   ```

3. **Database Indexing**
   - Index on `email` for faster user lookups
   - Index on `userId` for faster history queries

4. **API Response Optimization**
   - Implement pagination for email history
   - Add result limiting for large datasets

5. **Frontend Optimization**
   - Lazy load components
   - Implement code splitting
   - Use React.memo for expensive components

---

## 📞 Support & Resources

- **Groq API Docs:** https://console.groq.com/docs
- **MongoDB Docs:** https://docs.mongodb.com
- **Express.js Docs:** https://expressjs.com
- **React Docs:** https://react.dev

---

**✨ Your AI Cold Email Generator is production-ready!**

*Last Updated: February 24, 2026*
