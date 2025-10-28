# 🚀 Simple Deployment Guide

## Quick Deploy to Vercel

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel --prod
```

3. **Set Environment Variables**
```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add ARCJET_KEY
```

## Environment Variables Needed

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-32-char-secret
JWT_REFRESH_SECRET=your-32-char-refresh-secret
ARCJET_KEY=your-arcjet-key
SMTP_USER=your-email@gmail.com (optional)
SMTP_PASS=your-app-password (optional)
```

## Test Deployment

```bash
node test-api.js
```

## Database Setup

1. **Create PostgreSQL database** (Neon, Supabase, or Railway)
2. **Run migrations**
```bash
pnpm db:migrate
```
3. **Create admin user**
```bash
pnpm create-admin
```

That's it! Your simplified API is ready. 🎉