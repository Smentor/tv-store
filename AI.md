# MaxPlayer IPTV Dashboard - AI Context Documentation

## Project Overview
MaxPlayer IPTV Dashboard is a Next.js 16 application for managing IPTV subscriptions with a customer dashboard and comprehensive admin panel.

## Tech Stack

- **Framework:** Next.js 16.0.0 (App Router + Turbopack), TypeScript 5, Node.js 22.21.0, pnpm
- **UI:** Tailwind CSS 4.1.9, Radix UI (shadcn/ui), Lucide React, next-themes
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Date Handling:** date-fns

## Project Structure

```
iptv/
├── app/
│   ├── actions/          # Server actions (admin + auth)
│   ├── admin/            # Admin panel route
│   ├── auth/             # Login + Sign-up pages
│   └── dashboard/        # Customer dashboard route
├── components/
│   ├── admin/            # Admin panel components
│   │   ├── users/        # User management (modal, types, history)
│   │   └── ...           # Analytics, plans, coupons, promotions
│   ├── settings/         # Modular settings components
│   └── ui/               # shadcn/ui primitives
├── hooks/                # Custom React hooks
├── lib/
│   ├── supabase/         # SSR clients (client.ts, server.ts)
│   ├── utils/            # Utilities (subscription helpers, constants)
│   └── utils.ts          # cn() utility
├── scripts/              # SQL migrations + utilities
└── middleware.ts         # Auth middleware
```

## Database Schema (Key Tables)

### Core Tables
- **profiles**: User info (id, email, first_name, last_name, whatsapp, role)
- **subscriptions**: Active subscriptions (user_id FK, plan_id FK, status, price, next_billing_date)
- **plans**: IPTV plans (name, price, features JSON, max_screens)
- **credentials**: IPTV access (user_id FK, username, password, server_url)
- **invoices**: Billing history (user_id FK, amount, status, invoice_date)
- **user_logs**: Activity audit trail (user_id FK, action, details)
- **promotions**: Active campaigns (name, discount_%, start/end dates)
- **coupons**: Discount codes (code, discount_%, max_uses, active)
- **notifications**: User notifications (user_id FK, title, message, type, read)
- **notification_batches**: Bulk notifications (title, message, user_ids[])

## Key Features

### Customer Dashboard (`/dashboard`)
1. **Home**: Subscription overview, next payment card, recent activity
2. **Plans**: Plan cards with promotions, coupon system, upgrades
3. **Billing**: Invoice history with pagination
4. **Credentials**: IPTV access with copy-to-clipboard
5. **Settings**: Profile, notifications, devices, security (modular components)

### Admin Panel (`/admin`)
1. **Users Management**:
   - User table (search, filter, sort, pagination)
   - User details modal (tabs: Personal, Subscription, IPTV, Security, Billing, Communications, History)
   - Bulk operations (notify, change plan/status/date, delete)
   - **Global History**: View all system logs or filter by selected users
   - Create users with auto-confirmed email

2. **Analytics**: Revenue metrics, user metrics, charts
3. **System**: Plan/Promotion/Coupon management

## Authentication Flow

### Public Registration (`/auth/sign-up`)
- Auto-confirmed email (no verification required)
- Server Action `registerUser` creates auth user + profile
- Immediate login capability

### Login (`/auth/login`)
- Supabase `signInWithPassword`
- Role-based redirect (admin → `/admin`, user → `/dashboard`)

### Admin Access
- Middleware + role check from `profiles.role`
- Non-admin users redirected to `/dashboard`

## Server Actions (`app/actions/admin-actions.ts`)

**User Management:**
- `createUser`: Create user with optional subscription + credentials
- `updateUserProfile`: Update name, email, whatsapp
- `updateIptvCredentials`: Update/create IPTV credentials
- `updateUserPassword`: Manual password reset
- `deleteUsers`: Bulk user deletion

**Subscription Management:**
- `createSubscription`: Manual subscription creation
- `updateSubscriptionDetails`: Modify plan, price, billing date
- `updateSubscriptionStatus`: Change status (active/inactive/cancelled)
- `sendPasswordReset`: Send reset email

**Bulk Actions (Optimized):**
- `bulkUpdatePlans`: Mass plan assignment (creates subscriptions for users without one)
  - Returns `updatedCount` and `createdCount`
  - Handles users with and without existing subscriptions
- `bulkUpdateStatus`: Mass status change with precise feedback
  - Returns `count` and `skipped` for accurate UI feedback
  - Skips users without subscriptions (status requires active plan)
- `bulkUpdateDates`: Mass billing date updates

**Auth Actions (`app/actions/auth-actions.ts`):**
- `registerUser`: Public sign-up with auto-confirmation
- `deleteUserAccount`: Secure self-deletion (moved from client-side)

## Important Implementation Details

### Supabase SSR Pattern
- **Client:** `createBrowserClient` from `@supabase/ssr`
- **Server:** `createServerClient` from `@supabase/ssr`
- **Admin Actions:** `createClient` with `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS)

### State Management
- React `useState` for component state
- Custom hooks for server state (`useAuth`, `useSubscription`, `usePlans`, etc.)
- Supabase Realtime for live data
- No Redux/Zustand needed

### Styling Conventions
- Utility-first Tailwind CSS
- CSS variables in `globals.css`
- Mobile-first responsive design
- Dark mode via `next-themes`
- `cn()` utility for conditional classes

### Toast Notification Standards
- `variant: 'success'`: Complete successful operations
- `variant: 'destructive'`: Errors and failures
- `variant: 'default'`: Informational messages, partial successes, neutral feedback
- Always provide clear titles and contextual descriptions

## Code Patterns & Best Practices

### Custom Hook Pattern
```typescript
export function useData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const fetchData = useCallback(async () => {
    const supabase = createClient()
    // Fetch logic
    setLoading(false)
  }, [])
  
  useEffect(() => { fetchData() }, [fetchData])
  
  return { data, loading, refetch: fetchData }
}
```

### Server Action Pattern
```typescript
'use server'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function action(data: any) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  
  const { error } = await supabase.from('table').insert(data)
  if (error) return { success: false, error: error.message }
  
  revalidatePath('/path')
  return { success: true }
}
```

### Toast Pattern
```typescript
const { toast } = useToast()

const result = await serverAction()
if (result.success) {
  toast({ variant: 'success', title: 'Success', description: 'Done!' })
} else {
  toast({ variant: 'destructive', title: 'Error', description: result.error })
}
```

## Recent Updates (November 2024)

### Code Organization & Performance
- **Settings Modularization**: Split into 4 components (Profile, Notifications, Security, Devices)
- **User Management Refactoring**: Extracted `UserDetailsModal` from 1500+ line `UsersManagement`
- **Optimized Hooks**: `useSettings` now loads faster (removed session check, uses `maybeSingle()`)
- **Centralized Utilities**: `lib/utils/subscription.ts`, `lib/constants.ts`

### Admin Panel Features
- **Global History Sheet**: View all system logs or filter by selected users
  - Two-step fetching strategy (logs → user/admin profiles)
  - Reuses `LogItem` component for consistency
- **Enhanced User Logs**: Replaced JSON dumps with visual, color-coded `LogItem` component
- **Improved Modal Integration**: `UserDetailsModal` loads data on demand

### Bulk Actions Improvements
- **Server-Side Refactoring**: All bulk operations moved to secure server actions
- **Intelligent Plan Assignment**: `bulkUpdatePlans` creates subscriptions for users without plans
- **Smart Status Updates**: `bulkUpdateStatus` provides precise feedback (count + skipped)
- **Contextual Toast Feedback**:
  - No changes: Neutral toast explaining why
  - Partial update: Breakdown of results
  - Complete success: Success toast only when all updated
- **User Education**: Added explanatory note in modals (e.g., status requires subscription)

### Bug Fixes & Security
- **Auto-Confirmed Registration**: Public sign-up auto-confirms email
- **Secure Account Deletion**: Moved to server action with service role key
- **Status Update Fixes**: Corrected callback signature mismatches
- **Database Error Fixes**: Removed `start_date` column reference (doesn't exist)
- **Modal Crash Prevention**: Added defensive `userLogs || []` check

## Environment Variables

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Admin Operations (Server-only, NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Deployment Checklist

### Vercel
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Auto-deploy on push

### Supabase
1. Create project
2. Run SQL migrations sequentially (001-019)
3. Verify RLS policies enabled
4. Create test data

### Production
- [ ] Environment variables set
- [ ] Migrations run successfully
- [ ] Admin user with correct role created
- [ ] Test plans in database
- [ ] Analytics enabled

## Common Issues & Solutions

**Infinite Loop:** Don't recreate Supabase client in render → use `useMemo`
**Hydration Errors:** Add `suppressHydrationWarning` to affected elements
**Auth Not Persisting:** Ensure using `@supabase/ssr` clients
**RLS Blocking Admin:** Use `SUPABASE_SERVICE_ROLE_KEY` in server actions
**Column Not Found:** Run latest migrations, check case-sensitivity

## Notes for AI Assistants

### Code Style
- TypeScript strict mode
- Tailwind utilities, avoid inline styles
- Server components by default, `'use client'` only when needed
- `'use server'` for all server actions
- `useCallback` for async functions in `useEffect`

### Security
- Never expose service role key to client
- Validate all inputs client + server
- RLS policies for data access control
- Log sensitive operations to `user_logs`

### Performance
- Server components for static content
- Lazy load heavy components
- Optimize images with Next.js Image
- Pagination for large data sets
- Use Supabase indexes

---

**Last Updated:** November 23, 2024  
**Version:** 1.2.0  
**Maintainer:** Development Team
