# Environment Variables Setup Guide

## Your Current Setup

Based on your `.env.local`, you have:
1. `NEXT_PUBLIC_SUPABASE_URL` ✅
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
3. `SUPABASE_SERVICE_ROLE_KEY` (not needed for mobile app)
4. (Possibly a 4th variable?)

## Mobile App Configuration

Update your `.env.local` file to include these **EXPO_PUBLIC_** variables:

### Required Variables for Mobile App

```env
# Supabase Configuration (convert from NEXT_PUBLIC_ to EXPO_PUBLIC_)
EXPO_PUBLIC_SUPABASE_URL=https://dsklomowmagybvnwkeyo.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRza2xvbW93bWFneWJ2bndrZXlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNjcxMjksImV4cCI6MjA3NzY0MzEyOX0.X1UA__Cd2H-gf4YZPiWDh1Zh7AgZGaYAbhT_fuZ2fFA

# Backend API URL (your Next.js backend)
EXPO_PUBLIC_API_URL=https://joblink-jade.vercel.app
```

## Step-by-Step Update

### Option 1: Add to Existing File (Recommended)

Add these 3 lines to your existing `.env.local` file:

```env
# Add these EXPO_PUBLIC_ variables for mobile app
EXPO_PUBLIC_SUPABASE_URL=https://dsklomowmagybvnwkeyo.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRza2xvbW93bWFneWJ2bndrZXlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNjcxMjksImV4cCI6MjA3NzY0MzEyOX0.X1UA__Cd2H-gf4YZPiWDh1Zh7AgZGaYAbhT_fuZ2fFA
EXPO_PUBLIC_API_URL=https://joblink-jade.vercel.app
```

### Option 2: Complete File Template

Your complete `.env.local` should look like this:

```env
# Next.js Web App Variables (keep these)
NEXT_PUBLIC_SUPABASE_URL=https://dsklomowmagybvnwkeyo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRza2xvbW93bWFneWJ2bndrZXlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNjcxMjksImV4cCI6MjA3NzY0MzEyOX0.X1UA__Cd2H-gf4YZPiWDh1Zh7AgZGaYAbhT_fuZ2fFA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRza2xvbW93bWFneWJ2bndrZXlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjA2NzEyOSwiZXhwIjoyMDc3NjQzMTI5fQ.iiKYbHLCHDeUuC0ByfjZ8QTqJC6WI1X0NtW0wI1u8dQ

# Mobile App Variables (add these)
EXPO_PUBLIC_SUPABASE_URL=https://dsklomowmagybvnwkeyo.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRza2xvbW93bWFneWJ2bndrZXlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNjcxMjksImV4cCI6MjA3NzY0MzEyOX0.X1UA__Cd2H-gf4YZPiWDh1Zh7AgZGaYAbhT_fuZ2fFA
EXPO_PUBLIC_API_URL=https://joblink-jade.vercel.app
```

## Key Points

✅ **Same Supabase Project**: Both `NEXT_PUBLIC_` and `EXPO_PUBLIC_` use the same values
✅ **Same Database**: Mobile and web apps share the same Supabase database
✅ **Backend URL**: Mobile app connects to `https://joblink-jade.vercel.app`

## Verification

After updating, verify your setup:

1. **Check variables are loaded**:
   ```bash
   npm start
   # App should start without "Missing Supabase environment variables" error
   ```

2. **Test connection**:
   - Try logging in with credentials from your web app
   - Should authenticate successfully

3. **Test API calls**:
   - Check if dashboard loads data
   - Verify job cards can be fetched

## For Vercel Deployment

When deploying to Vercel, add these 3 variables in Vercel dashboard:

- `EXPO_PUBLIC_SUPABASE_URL` = `https://dsklomowmagybvnwkeyo.supabase.co`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` = (your anon key)
- `EXPO_PUBLIC_API_URL` = `https://joblink-jade.vercel.app`

See `VERCEL_ENV_SETUP.md` for detailed Vercel setup instructions.

