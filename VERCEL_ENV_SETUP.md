# Setting Up Environment Variables in Vercel

Since you have a `.env.local` file, here's how to use those same values in Vercel.

## Your Environment Variables

Based on your app, you need these 3 variables:

1. `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
2. `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
3. `EXPO_PUBLIC_API_URL` - Your backend API URL

## Step-by-Step: Add to Vercel

### Option 1: Via Vercel Dashboard (Recommended)

1. Go to your Vercel project: https://vercel.com/dashboard
2. Click on your `joblink-mobile` project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:

   **Variable 1:**
   - Name: `EXPO_PUBLIC_SUPABASE_URL`
   - Value: (copy from your `.env.local`)
   - Environment: Production, Preview, Development (select all)

   **Variable 2:**
   - Name: `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - Value: (copy from your `.env.local`)
   - Environment: Production, Preview, Development (select all)

   **Variable 3:**
   - Name: `EXPO_PUBLIC_API_URL`
   - Value: `https://joblink-jade.vercel.app`
   - Environment: Production, Preview, Development (select all)

5. Click **Save** for each variable
6. **Redeploy** your project (Vercel will automatically redeploy when you add env vars)

### Option 2: Via Vercel CLI

If you have Vercel CLI installed:

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Add environment variables
vercel env add EXPO_PUBLIC_SUPABASE_URL
vercel env add EXPO_PUBLIC_SUPABASE_ANON_KEY
vercel env add EXPO_PUBLIC_API_URL
```

## Important Notes

### API URL for Production

⚠️ **Critical**: Your `EXPO_PUBLIC_API_URL` must be your **production backend URL**, not `localhost`!

- ❌ Wrong: `http://localhost:3000`
- ✅ Correct: `https://joblink-jade.vercel.app`

If your backend is also on Vercel, use that URL. If it's elsewhere, use that URL.

### Environment Variable Names

Make sure the names match exactly:
- `EXPO_PUBLIC_SUPABASE_URL` (not `NEXT_PUBLIC_SUPABASE_URL`)
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` (not `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `EXPO_PUBLIC_API_URL`

The `EXPO_PUBLIC_` prefix is required for Expo to expose these to your app.

## Verify Your Setup

After adding environment variables:

1. Go to your Vercel project
2. Click on a deployment
3. Check the build logs to ensure variables are being used
4. Visit your deployed app URL
5. Check browser console for any environment variable errors

## Troubleshooting

### Variables Not Working?

1. **Redeploy**: After adding env vars, trigger a new deployment
2. **Check Names**: Ensure exact spelling and `EXPO_PUBLIC_` prefix
3. **Check Build Logs**: Look for errors in Vercel deployment logs
4. **Clear Cache**: Vercel caches builds, try a new deployment

### Still Having Issues?

- Make sure all 3 variables are set
- Ensure `EXPO_PUBLIC_API_URL` is your production URL (not localhost)
- Check that values don't have extra spaces or quotes
- Verify your Supabase credentials are correct

