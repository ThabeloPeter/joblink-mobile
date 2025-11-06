# Deploying JobLink Mobile to Vercel

This guide will help you deploy your Expo app to Vercel so you can access it from your phone without running `npm start` locally.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your GitHub repository connected to Vercel
3. Environment variables set up in Vercel

## Step 1: Connect Your Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository: `ThabeloPeter/joblink-mobile`
4. Vercel will auto-detect the settings from `vercel.json`

## Step 2: Configure Environment Variables

In your Vercel project settings, add these environment variables:

- `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `EXPO_PUBLIC_API_URL` - Your backend API URL (e.g., `https://your-api.vercel.app`)

**Note:** Make sure to use the production API URL, not `http://localhost:3000`

## Step 3: Deploy

1. Vercel will automatically build and deploy when you push to your main branch
2. Or click "Deploy" in the Vercel dashboard

## Step 4: Access from Your Phone

Once deployed, you'll get a URL like: `https://joblink-mobile.vercel.app`

1. Open this URL in your phone's browser
2. The app will load as a Progressive Web App (PWA)
3. You can add it to your home screen for app-like experience

## Building Locally (Optional)

To test the web build locally:

```bash
npm run build:web
```

This creates a `web-build` folder that you can serve locally or deploy.

## Important Notes

- **Web vs Native**: This deploys the web version of your app. Some native features (camera, notifications) may have limited functionality on web.
- **API URL**: Make sure your `EXPO_PUBLIC_API_URL` points to your production backend, not localhost.
- **Performance**: The web version may feel different from the native app experience.

## Troubleshooting

### Build Fails
- Check that all environment variables are set in Vercel
- Ensure `vercel.json` is in the root directory
- Check build logs in Vercel dashboard

### App Not Loading
- Verify environment variables are correct
- Check browser console for errors
- Ensure your backend API is accessible from the internet

### Features Not Working
- Some native features require the actual mobile app (built with EAS)
- Camera, notifications, and location may have limited web support
- Consider building native apps for full feature support

## Alternative: Use Expo's Development Build

If you want a native app experience without running `npm start`:

1. Use **Expo Go** app and scan QR code from Expo's web dashboard
2. Use **EAS Build** to create a development build you can install on your phone
3. Use **Expo Updates** for over-the-air updates

See [Expo Documentation](https://docs.expo.dev/) for more details.

