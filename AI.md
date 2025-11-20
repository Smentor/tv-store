# MaxPlayer IPTV Dashboard - AI Context

## Project Overview
This is a Next.js 16 application for managing IPTV subscriptions. It provides a customer dashboard for viewing plans, billing, credentials, and settings, plus an admin panel for managing users and subscriptions.

## Tech Stack
- **Framework:** Next.js 16.0.0 (App Router, Turbopack)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4.1.9
- **UI Components:** Radix UI (shadcn/ui pattern)
- **Database/Auth:** Supabase (with SSR support)
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Package Manager:** pnpm

## Project Structure

```
iptv/
├── app/
│   ├── actions/           # Server actions
│   ├── admin/             # Admin panel routes
│   ├── auth/              # Authentication pages (login, sign-up)
│   ├── protected/         # Protected dashboard route
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Root page (redirects based on auth)
│   └── globals.css        # Global styles
├── components/
│   ├── admin/             # Admin-specific components
│   ├── ui/                # Reusable UI components (shadcn/ui)
│   ├── dashboard-*.tsx    # Dashboard sections
│   ├── header-nav.tsx     # Navigation header
│   └── theme-provider.tsx # Theme context
├── hooks/
│   ├── use-auth.ts        # Authentication hook
│   ├── use-subscription.ts # Subscription data hook
│   └── ...                # Other custom hooks
├── lib/
│   ├── supabase/
│   │   ├── client.ts      # Browser Supabase client (SSR)
│   │   └── server.ts      # Server Supabase client (SSR)
│   └── utils.ts           # Utility functions
├── scripts/               # Database migration scripts
│   ├── 001_create_tables.sql
│   ├── 002_insert_dummy_data.sql
│   └── ...                # Sequential migrations
├── middleware.ts          # Auth middleware
└── next.config.mjs        # Next.js configuration
```

## Key Features

### Customer Dashboard (`/protected`)
- **Home:** Overview of subscription status, billing dates, connected devices
- **Plans:** View and upgrade subscription plans
- **Billing:** Invoice history and payment methods
- **Credentials:** IPTV access credentials (username, password, URLs)
- **Settings:** Profile management, device management, notifications

### Admin Panel (`/admin`)
- User management (create, edit, delete users)
- Subscription management
- Plan configuration
- Notifications system
- User activity logs

## Database Schema

### Main Tables
- `profiles` - User profile information
- `subscriptions` - Active user subscriptions
- `plans` - Available IPTV plans
- `credentials` - IPTV access credentials per user
- `invoices` - Billing history
- `notifications` - User notifications
- `user_logs` - Activity tracking
- `promotions` - Active promotions

## Authentication Flow

1. User visits root `/` → redirects to `/auth/login` or `/protected` based on auth status
2. Login via Supabase Auth (email/password)
3. Middleware checks auth on protected routes
4. Session stored in cookies (SSR-compatible)

## Important Implementation Details

### Supabase SSR Pattern
- **Client-side:** Uses `createBrowserClient` from `@supabase/ssr`
- **Server-side:** Uses `createServerClient` with Next.js cookies
- **Middleware:** Uses `createServerClient` for route protection

### State Management
- React hooks for local state
- Supabase real-time subscriptions for live updates
- No external state management library

### Styling Conventions
- Tailwind utility classes
- CSS variables for theming (defined in `globals.css`)
- Dark mode support via `next-themes`

## Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

## Common Issues & Solutions

### Infinite Rendering Loop
- **Cause:** Improper useEffect dependencies or Supabase client recreation
- **Solution:** Use `useCallback` for async functions, stable Supabase client instances

### Hydration Errors
- **Cause:** Browser extensions or SSR/client mismatch
- **Solution:** Add `suppressHydrationWarning` to affected components

### Authentication Issues
- **Cause:** Cookie sync problems between client/server
- **Solution:** Ensure using `@supabase/ssr` clients correctly

## Code Patterns

### Custom Hooks
```typescript
// Always use useCallback for async functions
const fetchData = useCallback(async () => {
  // fetch logic
}, [dependencies])

useEffect(() => {
  fetchData()
}, [fetchData])
```

### Server Components
```typescript
// Use server-side Supabase client
import { createClient } from "@/lib/supabase/server"

export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.from('table').select()
  // ...
}
```

### Client Components
```typescript
"use client"
import { createClient } from "@/lib/supabase/client"

export function Component() {
  const supabase = createClient()
  // ...
}
```

## Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Database Setup
1. Create Supabase project
2. Run SQL scripts in order (001-017) in Supabase SQL Editor
3. Configure Row Level Security policies
4. Add environment variables to deployment

## Notes for AI Assistants

- Always use TypeScript strict mode
- Follow existing code patterns for consistency
- Use Tailwind classes, avoid inline styles
- Prefer server components unless client interactivity needed
- Use `@supabase/ssr` clients, not vanilla `@supabase/supabase-js`
- Test authentication flows thoroughly
- Check for infinite loops when using useEffect
- Maintain accessibility (ARIA labels, semantic HTML)
