# Quick Setup - Connect to Your Backend

## Your Backend URL
**Backend API**: `https://joblink-jade.vercel.app`

## Step 1: Local Development Setup

Create or update `.env.local` in your mobile app root:

```env
# Copy from your web app's .env.local
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Your Next.js backend (production)
EXPO_PUBLIC_API_URL=https://joblink-jade.vercel.app
```

## Step 2: Vercel Deployment Setup

When deploying to Vercel, add these environment variables:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these 3 variables:

   **Variable 1:**
   - Name: `EXPO_PUBLIC_SUPABASE_URL`
   - Value: (from your web app)
   - Environments: Production, Preview, Development

   **Variable 2:**
   - Name: `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - Value: (from your web app)
   - Environments: Production, Preview, Development

   **Variable 3:**
   - Name: `EXPO_PUBLIC_API_URL`
   - Value: `https://joblink-jade.vercel.app`
   - Environments: Production, Preview, Development

3. Save and redeploy

## Step 3: Test Connection

1. Start your mobile app: `npm start`
2. Try logging in with credentials from your web app
3. Verify API calls work (check dashboard, job cards, etc.)

## Notes

- ✅ Use `https://joblink-jade.vercel.app` for production
- ❌ Don't use `http://localhost:3000` in production/Vercel
- ✅ Both web and mobile apps now share the same backend and database

