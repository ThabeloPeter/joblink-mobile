# JobLink Mobile App

A React Native mobile application built with Expo, NativeWind, and Supabase for managing job cards between companies and service providers.

## 📱 Project Overview

JobLink Mobile is the companion mobile app to the JobLink web application. It enables service providers to manage job cards on-the-go, including accepting/declining jobs, updating status, completing jobs with photo documentation, and receiving real-time notifications.

### Tech Stack

- **Framework**: React Native with Expo (SDK 54)
- **Routing**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: Zustand (client state) + TanStack Query (server state)
- **Backend**: Supabase (authentication, database, real-time)
- **Forms**: React Hook Form + Zod validation
- **Animations**: React Native Reanimated 3
- **Notifications**: Expo Notifications
- **Icons**: Lucide React Native

## 🏗️ Architecture

### User Roles

The app supports three user roles:

1. **Admin** - Manages companies, users, and system settings (web-only)
2. **Company** - Creates and assigns job cards to providers (web-only)
3. **Provider** - Accepts, manages, and completes job cards (mobile app primary users)

### Authentication Flow

1. User logs in with email/password via Supabase Auth
2. App fetches user profile from `/api/auth/me` endpoint
3. User role determines available features and navigation
4. Auth token stored in AsyncStorage for session persistence

### Data Flow

```
Mobile App → Supabase Client → Next.js API Routes → Supabase Database
```

- Mobile app uses Supabase client for authentication
- API calls go to Next.js backend (`/api/*` routes)
- Backend handles business logic and database operations
- Real-time updates via Supabase subscriptions

## 📂 Project Structure

```
joblink-mobile/
├── app/                      # Expo Router pages
│   ├── (auth)/              # Authentication screens
│   │   ├── login.tsx        # Login screen
│   │   └── _layout.tsx      # Auth layout
│   ├── (tabs)/              # Main app tabs
│   │   ├── index.tsx        # Dashboard
│   │   ├── job-cards.tsx    # Job cards list
│   │   ├── notifications.tsx # Notifications
│   │   ├── profile.tsx      # User profile
│   │   └── _layout.tsx      # Tabs layout
│   ├── _layout.tsx          # Root layout
│   ├── index.tsx            # Entry point (redirects)
│   └── +not-found.tsx       # 404 screen
├── components/              # Reusable components
│   ├── ui/                 # UI components
│   └── modals/             # Modal components
├── lib/                    # Utilities and helpers
│   ├── supabase/
│   │   └── client.ts       # Supabase client setup
│   ├── hooks/              # Custom React hooks
│   └── utils/             # Utility functions
│       ├── auth.ts        # Auth helpers
│       └── date.ts        # Date formatting
├── store/                 # Zustand stores
│   └── authStore.ts       # Auth state management
├── types/                 # TypeScript types
│   └── index.ts           # Shared types
├── global.css             # Tailwind CSS imports
├── tailwind.config.js     # Tailwind configuration
├── babel.config.js        # Babel configuration
├── metro.config.js        # Metro bundler config
└── app.json               # Expo configuration
```

## 🔑 Key Features

### For Service Providers (Mobile App)

1. **Job Card Management**
   - View all assigned job cards
   - Filter by status (pending, accepted, in_progress, completed, declined)
   - Search job cards
   - View job card details (title, description, location, due date, priority)

2. **Job Card Actions**
   - Accept/Decline pending job cards
   - Mark job as "In Progress"
   - Complete job with:
     - Photo upload (camera or gallery)
     - Completion notes
     - Location verification (GPS)

3. **Dashboard**
   - Quick stats (total, pending, in progress, completed)
   - Recent activity
   - Upcoming due dates

4. **Notifications**
   - Push notifications for new job assignments
   - In-app notification center
   - Real-time updates

5. **Profile Management**
   - View profile information
   - Change password
   - Sign out

### Job Card Status Flow

```
pending → accepted → in_progress → completed
   ↓
declined
```

- **pending**: Newly assigned, awaiting provider response
- **accepted**: Provider accepted the job
- **in_progress**: Provider started working
- **completed**: Job finished with photos and notes
- **declined**: Provider declined the job

## 🔌 API Endpoints

The mobile app communicates with the Next.js backend API. Base URL: `EXPO_PUBLIC_API_URL` (defaults to `http://localhost:3000`)

### Authentication

- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - User logout
- `POST /api/auth/change-password` - Change password

### Provider Endpoints

- `GET /api/provider/job-cards` - Get all job cards for provider
  - Returns: `{ jobCards: JobCard[] }`
  
- `PUT /api/provider/job-cards/[id]` - Update job card status
  - Body: `{ status: 'accepted' | 'declined' | 'in_progress' | 'completed', notes?: string, images?: string[] }`
  - Returns: `{ success: boolean, jobCard: JobCard }`

### Notifications

- `GET /api/notifications` - Get all notifications
- `PUT /api/notifications/[id]/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read

### Dashboard Stats

- `GET /api/dashboard/provider-stats` - Get provider statistics

## 📊 Database Schema

### Key Tables

**users**
- `id` (UUID, primary key, references auth.users)
- `email` (text)
- `role` ('admin' | 'company' | 'provider')
- `company_id` (UUID, references companies.id, nullable)

**companies**
- `id` (UUID, primary key)
- `name` (text)
- `email` (text)
- `status` ('pending' | 'approved' | 'rejected')

**service_providers**
- `id` (UUID, primary key, references auth.users)
- `name` (text)
- `email` (text)
- `company_id` (UUID, references companies.id)
- `status` ('active' | 'inactive')

**job_cards**
- `id` (UUID, primary key)
- `title` (text)
- `description` (text)
- `company_id` (UUID, references companies.id)
- `provider_id` (UUID, references service_providers.id)
- `status` ('pending' | 'accepted' | 'declined' | 'in_progress' | 'completed')
- `priority` ('low' | 'medium' | 'high')
- `location` (text)
- `due_date` (timestamp)
- `created_at` (timestamp)
- `completed_at` (timestamp, nullable)
- `audited_at` (timestamp, nullable)
- `completion_notes` (text, nullable)
- `completion_images` (text[], nullable)

**notifications**
- `id` (UUID, primary key)
- `user_id` (UUID, references users.id)
- `title` (text)
- `message` (text)
- `type` ('info' | 'success' | 'warning' | 'error')
- `read` (boolean)
- `job_card_id` (UUID, references job_cards.id, nullable)
- `created_at` (timestamp)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Expo Go app on iOS device (or Android)
- Supabase project with database set up
- Next.js backend running (for API calls)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env` file in the root:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Connect device**
   - Open Expo Go app on your phone
   - Scan QR code from terminal
   - Or enter URL manually

### Development Commands

```bash
npm start          # Start Expo dev server
npm run ios        # Start iOS simulator (requires macOS)
npm run android    # Start Android emulator
npm run web        # Run in web browser
```

## 🎨 Styling Guidelines

### NativeWind Usage

Use Tailwind CSS classes directly in JSX:

```tsx
<View className="flex-1 bg-white dark:bg-gray-900">
  <Text className="text-2xl font-bold text-gray-900 dark:text-white">
    Hello World
  </Text>
</View>
```

### Dark Mode

The app supports automatic dark mode based on system preferences. Use `dark:` prefix for dark mode styles.

### Color Scheme

- Primary: Gray scale (900 for dark, 100 for light)
- Status colors:
  - Success: Green
  - Warning: Yellow
  - Error: Red
  - Info: Blue

## 📱 Key Components to Build

### Job Cards List Screen
- Display job cards in a scrollable list
- Filter by status
- Search functionality
- Pull to refresh
- Empty state

### Job Card Detail Screen
- Full job card information
- Action buttons (Accept/Decline/Start/Complete)
- Location display
- Due date countdown

### Complete Job Modal
- Photo picker (camera/gallery)
- Multiple image upload
- Notes text input
- Location capture
- Submit button

### Notification Center
- List of notifications
- Mark as read
- Filter by type
- Real-time updates

## 🔐 Authentication

### Token Management

- Auth tokens stored in AsyncStorage via Supabase client
- Tokens automatically refreshed by Supabase
- Include token in API requests: `Authorization: Bearer ${token}`

### Getting Current User

```typescript
import { getCurrentUser } from '../lib/utils/auth'

const user = await getCurrentUser()
```

### Sign Out

```typescript
import { signOut } from '../lib/utils/auth'

await signOut()
```

## 📸 Image Handling

### Taking Photos

Use `expo-camera` or `expo-image-picker`:

```typescript
import * as ImagePicker from 'expo-image-picker'

const result = await ImagePicker.launchCameraAsync({
  allowsEditing: true,
  quality: 0.8,
})
```

### Uploading Images

Upload to Supabase Storage or your backend API:

```typescript
// Upload to backend API
const formData = new FormData()
formData.append('file', {
  uri: imageUri,
  type: 'image/jpeg',
  name: 'photo.jpg',
})

const response = await fetch('/api/storage/upload', {
  method: 'POST',
  body: formData,
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
```

## 🔔 Notifications

### Push Notifications Setup

1. Configure Expo notifications in `app.json`
2. Request permissions on app start
3. Set up notification handlers
4. Register device token with backend

### Local Notifications

```typescript
import * as Notifications from 'expo-notifications'

await Notifications.scheduleNotificationAsync({
  content: {
    title: "New Job Card",
    body: "You have a new job assignment",
  },
  trigger: null, // Immediate
})
```

## 🧪 Testing

### Testing on Device

1. Ensure phone and computer on same Wi-Fi
2. Start Expo dev server
3. Scan QR code with Expo Go
4. App loads with hot reload enabled

### Troubleshooting

- **Can't connect**: Check firewall, use tunnel mode (`s` in terminal)
- **Styles not working**: Clear cache (`npx expo start -c`)
- **API errors**: Verify `EXPO_PUBLIC_API_URL` is correct

## 📝 Development Notes

### State Management

- **Zustand**: For client-side state (auth, UI state)
- **TanStack Query**: For server state (API data, caching)

### API Calls Pattern

```typescript
import { useQuery, useMutation } from '@tanstack/react-query'
import { getAuthToken } from '../lib/utils/auth'

// Fetch data
const { data, isLoading } = useQuery({
  queryKey: ['jobCards'],
  queryFn: async () => {
    const token = await getAuthToken()
    const response = await fetch('/api/provider/job-cards', {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.json()
  },
})

// Mutate data
const mutation = useMutation({
  mutationFn: async (data) => {
    const token = await getAuthToken()
    const response = await fetch('/api/provider/job-cards/123', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return response.json()
  },
})
```

### Error Handling

Always handle errors in API calls:

```typescript
try {
  const response = await fetch(url, options)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Request failed')
  }
  return await response.json()
} catch (error) {
  Toast.show({
    type: 'error',
    text1: 'Error',
    text2: error.message,
  })
}
```

## 🚢 Deployment

### Building for Production

1. **Configure app.json** with production settings
2. **Build with EAS**:
   ```bash
   npx eas build --platform ios
   npx eas build --platform android
   ```
3. **Submit to stores**:
   ```bash
   npx eas submit --platform ios
   npx eas submit --platform android
   ```

### Environment Variables

For production, set environment variables in:
- EAS Secrets (for build-time)
- Expo Config Plugins (for runtime)

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Supabase Documentation](https://supabase.com/docs)

## 🤝 Contributing

When adding new features:

1. Follow the existing file structure
2. Use TypeScript for type safety
3. Use NativeWind for styling
4. Handle errors gracefully
5. Add loading states
6. Test on real device
7. Update this README if needed

## 📄 License

Private project - All rights reserved

---

**Last Updated**: November 2024
**Version**: 1.0.0

