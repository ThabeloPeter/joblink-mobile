# Connecting Mobile App to Your Web App Backend

This guide explains how your mobile app connects to the same Supabase database and Next.js backend as your web app.

## Architecture Overview

```
┌─────────────────┐         ┌──────────────┐         ┌─────────────┐
│   Mobile App    │────────▶│   Supabase   │────────▶│  Database   │
│  (React Native) │  Auth   │  (Auth + DB) │         │             │
└─────────────────┘         └──────────────┘         └─────────────┘
         │                           │
         │                           │
         │ JWT Token                 │
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌──────────────┐
│  Next.js API    │────────▶│   Supabase   │
│    Backend      │  Query  │   Database   │
└─────────────────┘         └──────────────┘
```

### How It Works

1. **Authentication**: Mobile app authenticates directly with Supabase (same as web app)
2. **API Calls**: Mobile app sends requests to your Next.js backend API with JWT token
3. **Backend**: Next.js backend validates the token and queries Supabase database
4. **Shared Data**: Both web and mobile apps access the same Supabase database

## Step 1: Get Your Web App's Credentials

From your web app's `.env.local` file, you need these values:

### Supabase Credentials
- `NEXT_PUBLIC_SUPABASE_URL` → Use as `EXPO_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Use as `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Backend API URL
- **Your Production Backend**: `https://joblink-jade.vercel.app` ✅
- For local development: `http://localhost:3000` (only works when backend is running locally)

## Step 2: Configure Mobile App Environment Variables

### For Local Development

Create or update `.env.local` in your mobile app root:

```env
# Copy these from your web app's .env.local
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Your Next.js backend URL
# For local dev (when backend is running on your machine):
# EXPO_PUBLIC_API_URL=http://localhost:3000

# For production (your deployed backend):
EXPO_PUBLIC_API_URL=https://joblink-jade.vercel.app
```

### For Vercel Deployment

Add these same variables in Vercel dashboard:
- `EXPO_PUBLIC_SUPABASE_URL` - Same as web app
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Same as web app  
- `EXPO_PUBLIC_API_URL` - Your production backend URL (not localhost!)

## Step 3: Verify the Connection

### Authentication Flow

1. **Mobile app** → User logs in via Supabase
2. **Supabase** → Returns JWT token (same token format as web app)
3. **Mobile app** → Stores token and includes it in API requests
4. **Next.js backend** → Validates token and accesses Supabase database

### API Request Example

```typescript
// Mobile app makes API call
const token = await getAuthToken() // Gets Supabase JWT token

const response = await fetch(`${EXPO_PUBLIC_API_URL}/api/provider/job-cards`, {
  headers: {
    Authorization: `Bearer ${token}`, // Same token format as web app
  },
})
```

## Step 4: Ensure Backend Accepts Mobile Requests

Your Next.js backend should already work, but verify:

### CORS Configuration

Make sure your Next.js backend allows requests from your mobile app:

```typescript
// In your Next.js API route or middleware
export async function middleware(request: NextRequest) {
  // Allow requests from mobile app
  const response = NextResponse.next()
  response.headers.set('Access-Control-Allow-Origin', '*') // Or specific domain
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  response.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  return response
}
```

### Token Validation

Your backend should validate Supabase JWT tokens:

```typescript
// In your Next.js API route
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Validate token from mobile app
const authHeader = request.headers.get('authorization')
const token = authHeader?.replace('Bearer ', '')

const { data: { user }, error } = await supabase.auth.getUser(token)
if (error || !user) {
  return new Response('Unauthorized', { status: 401 })
}
```

## Step 5: Test the Connection

### 1. Test Authentication

```bash
# In mobile app, try logging in with same credentials as web app
# Should work if Supabase credentials are correct
```

### 2. Test API Calls

```bash
# Check if mobile app can fetch data from backend
# Verify token is being sent correctly
```

### 3. Verify Shared Data

- Create a job card in web app
- Check if it appears in mobile app
- Update from mobile app
- Verify change appears in web app

## Common Issues & Solutions

### Issue: "Missing Supabase environment variables"

**Solution**: Make sure `.env.local` has all three variables:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_API_URL`

### Issue: "Unauthorized" errors

**Solution**: 
- Verify Supabase credentials match your web app
- Check that token is being sent in Authorization header
- Ensure backend validates Supabase JWT tokens correctly

### Issue: "Network request failed"

**Solution**:
- For local dev: Ensure backend is running on `http://localhost:3000`
- For production: Use production backend URL (not localhost)
- Check CORS settings in backend

### Issue: "Can't connect to localhost from phone"

**Solution**:
- Use your computer's local IP address instead of `localhost`
- Example: `http://192.168.1.100:3000`
- Or deploy backend to Vercel and use production URL

## Architecture Benefits

✅ **Single Source of Truth**: Both apps use the same Supabase database
✅ **Shared Authentication**: Users can log in on web or mobile with same credentials
✅ **Consistent Data**: Changes sync between web and mobile instantly
✅ **Unified Backend**: Same business logic and API endpoints

## Next Steps

1. ✅ Copy Supabase credentials from web app to mobile app
2. ✅ Set backend API URL (local or production)
3. ✅ Test authentication
4. ✅ Test API calls
5. ✅ Verify data syncs between web and mobile

Your mobile app is now connected to the same backend as your web app! 🎉

