# Quick Setup Guide

## 1. Install Expo Go on Your iPhone

1. Open App Store on your iPhone
2. Search for "Expo Go"
3. Install the official Expo Go app

## 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EXPO_PUBLIC_API_URL=http://localhost:3000
```

**Note**: Get these values from your web app's `.env.local` file:
- `NEXT_PUBLIC_SUPABASE_URL` → `EXPO_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## 3. Start Development Server

```bash
cd joblink-mobile
npm start
```

## 4. Connect Your iPhone

1. Make sure your iPhone and computer are on the same Wi-Fi network
2. Open Expo Go app on your iPhone
3. Scan the QR code from the terminal
4. The app will load on your phone!

## 5. Troubleshooting

### Can't Connect?
- Press `s` in the terminal to switch to tunnel mode
- Or manually enter the URL shown in Expo Go

### Styles Not Working?
- Clear cache: `npx expo start -c`
- Make sure `global.css` is imported in `app/_layout.tsx`

### API Errors?
- Verify your Next.js backend is running on port 3000
- Check `EXPO_PUBLIC_API_URL` in `.env` file

## Next Steps

1. Test login with a provider account
2. Start building the job cards list screen
3. Implement photo upload functionality
4. Add push notifications

See `README.md` for full documentation.

