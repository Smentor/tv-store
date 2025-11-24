# MaxPlayer IPTV Dashboard - AI Context Documentation DEV

## Project Overview
MaxPlayer IPTV Dashboard is a comprehensive Next.js 16 application for managing IPTV subscriptions. It provides a modern, responsive customer dashboard for viewing plans, billing, credentials, and settings, plus a powerful admin panel for managing users, subscriptions, and system operations.

## Tech Stack

### Core Framework
- **Framework:** Next.js 16.0.0 (App Router with Turbopack)
- **Language:** TypeScript 5
- **Runtime:** Node.js 22.21.0
- **Package Manager:** pnpm

### Styling & UI
- **CSS Framework:** Tailwind CSS 4.1.9
- **UI Components:** Radix UI primitives (shadcn/ui pattern)
- **Icons:** Lucide React
- **Theme:** next-themes (dark/light mode support)

### Backend & Database
- **Database/Auth:** Supabase (PostgreSQL)
- **Auth Pattern:** Supabase SSR (@supabase/ssr)
- **Real-time:** Supabase Realtime subscriptions

### Forms & Validation
- **Forms:** React Hook Form
- **Validation:** Zod schemas
- **Date Handling:** date-fns

### Data Visualization
- **Charts:** Recharts

## Project Structure

```
iptv/
├── app/
│   ├── actions/
│   │   ├── admin-actions.ts      # Admin server actions (user/subscription management)
│   │   └── auth-actions.ts       # Public registration server action
│   ├── admin/
│   │   └── page.tsx              # Admin panel entry (role-based access)
│   ├── auth/
│   │   ├── login/page.tsx        # Login page
│   │   └── sign-up/page.tsx      # Public registration page
│   ├── dashboard/
│   │   └── page.tsx              # Customer dashboard (dashboard route)
│   ├── layout.tsx                # Root layout (fonts, analytics, toaster)
│   ├── page.tsx                  # Root redirect (auth-based routing)
│   └── globals.css               # Global styles & CSS variables
├── components/
│   ├── admin/
│   │   ├── admin-dashboard.tsx   # Admin panel main component
│   │   ├── users-management.tsx  # User management (CRUD, bulk ops)
│   │   ├── users/
│   │   │   ├── user-details-modal.tsx  # Extracted user details modal
│   │   │   └── types.ts                # Shared types for user management
│   │   ├── analytics.tsx         # Admin analytics dashboard
│   │   └── admin-overview.tsx    # Admin overview stats
│   ├── settings/
│   │   ├── profile-settings.tsx       # User profile management
│   │   ├── notification-settings.tsx  # Notification preferences
│   │   ├── security-settings.tsx      # Password & account deletion
│   │   └── device-settings.tsx        # Device management
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   └── ...                   # Other UI primitives
│   ├── dashboard-home.tsx        # Customer dashboard home
│   ├── plans-section.tsx         # Plan selection & upgrade
│   ├── billing-section.tsx       # Invoice history & payments
│   ├── credentials-section.tsx   # IPTV credentials display
│   ├── settings-section.tsx      # User settings orchestrator (refactored)
│   ├── header-nav.tsx            # Navigation header
│   └── theme-provider.tsx        # Theme context provider
├── hooks/
│   ├── use-auth.ts               # Authentication state hook
│   ├── use-subscription.ts       # Subscription data hook (with plan JOIN)
│   ├── use-plans.ts              # Plans fetching hook
│   ├── use-invoices.ts           # Invoices fetching hook
│   └── use-toast.ts              # Toast notifications hook
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client (SSR)
│   │   └── server.ts             # Server Supabase client (SSR)
│   ├── utils/
│   │   └── subscription.ts       # Subscription status utilities (centralized)
│   ├── constants.ts              # Shared constants (countryCodes, etc.)
│   └── utils.ts                  # Utility functions (cn, etc.)
├── scripts/
│   ├── 001_create_tables.sql     # Initial schema
│   ├── ...                       # Sequential migrations
│   ├── 018_add_admin_update_policies.sql # Admin RLS policies
│   ├── verify-supabase.js        # Connection verification script
│   └── create-test-users.js      # Test user creation script
├── middleware.ts                 # Auth middleware (route protection)
├── next.config.mjs               # Next.js config (TypeScript ignore, image optimization)
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── .env.local                    # Environment variables (not in repo)
```

## Database Schema

### Core Tables

#### `profiles`
User profile information linked to Supabase Auth users.
```sql
- id: uuid (FK to auth.users)
- email: text
- first_name: text
- last_name: text
- whatsapp: text
- role: text (default: 'user', can be 'admin')
- created_at: timestamp
- updated_at: timestamp
```

#### `subscriptions`
Active user subscriptions.
```sql
- id: uuid (PK)
- user_id: uuid (FK to profiles)
- plan_id: uuid (FK to plans)
- plan_name: text
- status: text ('active', 'inactive', 'cancelled')
- price: numeric
- next_billing_date: timestamp
- created_at: timestamp
- updated_at: timestamp
```

#### `plans`
Available IPTV subscription plans.
```sql
- id: uuid (PK)
- name: text
- description: text
- price: numeric
- features: jsonb (array of feature strings)
- max_screens: integer (device limit)
- created_at: timestamp
```

#### `credentials`
IPTV access credentials per user.
```sql
- id: uuid (PK)
- user_id: uuid (FK to profiles)
- username: text
- password: text
- server_url: text
- created_at: timestamp
- updated_at: timestamp
```

#### `invoices`
Billing history and payment records.
```sql
- id: uuid (PK)
- user_id: uuid (FK to profiles)
- amount: numeric
- status: text ('paid', 'pending', 'failed')
- description: text
- invoice_date: timestamp
- created_at: timestamp
```

#### `user_logs`
Activity tracking for audit trail.
```sql
- id: uuid (PK)
- user_id: uuid (FK to profiles)
- action: text
- details: text
- created_at: timestamp
```

#### `promotions`
Active promotional campaigns.
```sql
- id: uuid (PK)
- name: text
- description: text
- discount_percentage: numeric (nullable)
- discount_amount: numeric (nullable)
- start_date: timestamp (nullable)
- end_date: timestamp (nullable)
- active: boolean
```

#### `coupons`
Discount coupons for users.
```sql
- id: uuid (PK)
- code: text (unique)
- discount_percentage: numeric (nullable)
- discount_amount: numeric (nullable)
- max_uses: integer (nullable)
- current_uses: integer (default: 0)
- start_date: timestamp (nullable)
- end_date: timestamp (nullable)
- active: boolean
```

#### `notification_batches`
Batch notifications sent to users.
```sql
- id: uuid (PK)
- title: text
- message: text
- type: text
- user_ids: text[] (array of user IDs)
- created_at: timestamp
```

## Key Features

### Customer Dashboard (`/dashboard`)

#### 1. Home Section
- **Subscription Overview:** Current plan, status badge, renewal date
- **Quick Stats Cards:**
  - Next payment amount and date (real data from subscription)
  - Connected devices with real limit from plan's `max_screens`
  - Active services count
- **Recent Activity:** Latest user actions and notifications

#### 2. Plans Section
- **Plan Cards:** Display all available plans with features
- **Current Plan Highlight:** Visual indicator for active plan
- **Promotions:** Active promotions banner with discount details
- **Coupon System:** Apply discount coupons with validation
- **Price Calculation:** Real-time price updates with discounts
- **Plan Upgrade:** Seamless plan change with confirmation modal
- **Responsive Design:** Compact cards optimized for all screen sizes

#### 3. Billing Section
- **Invoice History:** Paginated list of all invoices
- **Payment Status:** Visual indicators (paid, pending, failed)
- **Invoice Details:** Amount, date, description
- **Next Payment Card:** Upcoming billing information
- **Download Invoices:** (Future feature)

#### 4. Credentials Section
- **IPTV Access Info:** Username, password, server URL
- **Copy to Clipboard:** One-click credential copying
- **QR Code:** (Future feature for easy device setup)
- **Connection Guide:** Help documentation

#### 5. Settings Section
- **Profile Management:** Edit name, email, WhatsApp
- **Device Management:** View and manage connected devices (respects plan limits)
- **Notification Preferences:** Email/WhatsApp notification settings
- **Security:** Password change, 2FA (future)
- **Theme Toggle:** Dark/light mode switcher

### Admin Panel (`/admin`)

#### 1. Users Management
- **User Table:** Searchable, filterable, sortable user list
- **User Details Modal:** Comprehensive user information with tabs:
  - **Personal Info:** Edit name, email, WhatsApp, role
  - **Subscription Info:** 
    - Edit plan, price, billing date
    - Unified "Save Changes" button (not repetitive)
    - Create subscription if user has none
    - Change subscription status (active/inactive/cancelled)
  - **IPTV Credentials:** Edit username, password with generator
  - **Security:** 
    - Manual password reset
    - Send password reset email
  - **Billing:** Invoice history
  - **Communications:** Notification history
- **Bulk Operations:**
  - Bulk notify users
  - Bulk change plan
  - Bulk change status
  - Bulk change billing date
  - Bulk delete users
- **User Creation:** 
  - Create new users with auto-confirmed email
  - Set initial plan and credentials
  - Client-side validation (email, password min 6 chars)
- **User Deletion:** Soft delete with confirmation

#### 2. Analytics Dashboard
- **Revenue Metrics:** Total revenue, MRR, growth rate
- **User Metrics:** Total users, active subscriptions, churn rate
- **Plan Distribution:** Visual breakdown of users per plan
- **Charts:** Revenue trends, user growth, plan popularity

#### 3. System Settings
- **Plan Management:** Create, edit, delete plans
- **Promotion Management:** Configure active promotions
- **Coupon Management:** Create and manage discount coupons
- **Notification Templates:** Customize notification messages

## Authentication Flow

### Public Registration (`/auth/sign-up`)
1. User fills form: email, password, first name, last name, WhatsApp
2. Client-side validation (email format, password min 6 chars)
3. Server Action `registerUser` called:
   - Creates user in Supabase Auth with `email_confirm: true`
   - Forces email confirmation via `updateUserById`
   - Creates profile record
   - No email verification required (auto-confirmed)
4. Redirect to `/auth/login` with success message
5. User can login immediately

### Login (`/auth/login`)
1. User enters email and password
2. Supabase `signInWithPassword` called
3. Session stored in cookies (SSR-compatible)
4. Redirect to `/dashboard` (customer) or `/admin` (admin role)

### Admin Access
1. Middleware checks authentication on `/admin` route
2. `app/admin/page.tsx` checks user role from `profiles` table
3. Non-admin users redirected to `/dashboard`
4. Admin users see full admin panel

### Session Management
- Sessions stored in HTTP-only cookies
- Middleware refreshes session on each request
- Auto-logout on session expiration
- Supabase handles token refresh

## Server Actions

### Admin Actions (`app/actions/admin-actions.ts`)

#### `createUser(data)`
Creates a new user with auto-confirmed email.
- **Input:** email, password, first_name, last_name, whatsapp, plan_id, plan_name, price, iptv_username, iptv_password
- **Process:**
  1. Validates service role key presence
  2. Validates email and password (min 6 chars)
  3. Creates auth user with `email_confirm: true`
  4. Forces email confirmation via `updateUserById`
  5. Creates/updates profile
  6. Creates subscription if plan provided
  7. Creates IPTV credentials
- **Returns:** `{ success: boolean, error?: string }`

#### `createSubscription(data)`
Manually creates a subscription for a user.
- **Input:** user_id, plan_id, plan_name, price
- **Process:**
  1. Calculates next billing date (30 days from now)
  2. Inserts subscription with status 'active'
  3. Revalidates `/admin` path
- **Returns:** `{ success: boolean, error?: string }`

#### `updateUserPassword(data)`
Manually sets a new password for a user (admin override).
- **Input:** user_id, new_password
- **Process:**
  1. Uses `auth.admin.updateUserById` to set password
  2. Logs action to `user_logs`
- **Returns:** `{ success: boolean, error?: string }`

#### `deleteUsers(userIds)`
Deletes multiple users and their related data.
- **Input:** userIds (array of UUIDs)
- **Process:**
  1. Deletes from `credentials`, `subscriptions`, `invoices`, `user_logs`, `profiles`
  2. Deletes from `auth.users` via admin API
  3. Revalidates `/admin` path
- **Returns:** `{ success: boolean, error?: string }`

### Auth Actions (`app/actions/auth-actions.ts`)

#### `registerUser(data)`
Public user registration with auto-confirmation.
- **Input:** email, password, first_name, last_name, whatsapp
- **Process:**
  1. Creates auth user with `email_confirm: true`
  2. Forces email confirmation
  3. Creates profile with role 'user'
- **Returns:** `{ success: boolean, error?: string }`

## Important Implementation Details

### Supabase SSR Pattern

#### Client-Side (`lib/supabase/client.ts`)
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

#### Server-Side (`lib/supabase/server.ts`)
```typescript
import { createServerClient } from '@supabase/supabase-js'

export function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

#### Server Actions (Admin)
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Admin privileges
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

### State Management
- **Local State:** React `useState` for component state
- **Server State:** Custom hooks with Supabase queries
- **Real-time Updates:** Supabase subscriptions for live data
- **No Redux/Zustand:** Keeping it simple with React hooks

### Styling Conventions
- **Utility-First:** Tailwind CSS classes for all styling
- **CSS Variables:** Theme colors defined in `globals.css`
- **Responsive:** Mobile-first approach with `sm:`, `md:`, `lg:` breakpoints
- **Dark Mode:** Automatic theme switching via `next-themes`
- **Component Variants:** Using `cn()` utility for conditional classes

### Design System
- **Colors:** Primary (purple), Accent (coral/pink), Muted (gray)
- **Typography:** Geist Sans (default), Geist Mono (code)
- **Spacing:** Consistent use of Tailwind spacing scale
- **Shadows:** Subtle shadows for depth, stronger for modals
- **Borders:** Rounded corners (`rounded-lg`, `rounded-xl`)
- **Animations:** Smooth transitions, subtle hover effects

## Environment Variables

### Required Variables
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Admin Operations (Server-side only)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
```

### Security Notes
- `NEXT_PUBLIC_*` variables are exposed to the browser
- `SUPABASE_SERVICE_ROLE_KEY` must NEVER be exposed to client
- Service role key bypasses RLS - use only in server actions
- Store sensitive keys in Vercel environment variables for production

## Development Workflow

### Setup
```bash
# Clone repository
git clone <repo-url>
cd iptv

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
pnpm dev
```

### Database Setup
1. Create Supabase project at https://supabase.com
2. Run SQL migrations in order (001-018) in Supabase SQL Editor
3. Verify RLS policies are enabled
4. Create test users with `node scripts/create-test-users.js`

### Development Commands
```bash
# Development server (Turbopack)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Type check
pnpm tsc --noEmit
```

## Recent Updates & Fixes (November 2024)

### Authentication & User Management
- ✅ **Auto-Confirmed Registration:** Public sign-up now auto-confirms email
- ✅ **Manual Password Reset:** Admins can set user passwords directly
- ✅ **User Creation Form:** Enhanced with validation and required field indicators
- ✅ **Email Confirmation Fix:** Removed `start_date` column causing errors

### Admin Panel Improvements
- ✅ **Unified Subscription Editing:** Single "Save Changes" button instead of multiple
- ✅ **Manual Subscription Creation:** Admins can add subscriptions to users without one
- ✅ **Compact Password Change UI:** Redesigned to match subscription section style
- ✅ **Profile Update Fix:** Resolved `full_name` vs `first_name`/`last_name` mismatch
- ✅ **RLS Policies:** Added admin update permissions via SQL migration
- ✅ **Responsive Modal:** Improved user details modal for mobile devices

### Dashboard Enhancements
- ✅ **Real Connected Devices:** Uses `max_screens` from plan data
- ✅ **Next Payment Card:** Shows actual renewal date and amount
- ✅ **Plan Cards Redesign:** More compact, aligned buttons, coherent styling
- ✅ **Coupon System:** Apply discount coupons with real-time price updates
- ✅ **Promotion Banners:** Display active promotions prominently
- ✅ **Confirmation Modal Fix:** Proper spacing and clickable buttons

### UI/UX Improvements
- ✅ **Consistent Design:** Unified color scheme and component styles
- ✅ **Better Spacing:** Reduced card sizes, improved button alignment
- ✅ **Mobile Responsive:** All components work well on small screens
- ✅ **Loading States:** Proper loading indicators throughout
- ✅ **Error Handling:** User-friendly error messages with toast notifications

## Common Issues & Solutions

### Issue: Infinite Rendering Loop
**Cause:** Improper `useEffect` dependencies or Supabase client recreation
**Solution:**
```typescript
// ❌ Bad - Creates new client on every render
const Component = () => {
  const supabase = createClient()
  useEffect(() => {
    supabase.from('table').select()
  }, [supabase]) // supabase changes every render!
}

// ✅ Good - Stable client reference
const Component = () => {
  const supabase = useMemo(() => createClient(), [])
  useEffect(() => {
    supabase.from('table').select()
  }, [supabase])
}
```

### Issue: Hydration Errors
**Cause:** Browser extensions or SSR/client mismatch
**Solution:**
```typescript
// Add suppressHydrationWarning to affected elements
<input suppressHydrationWarning />
```

### Issue: Authentication Not Persisting
**Cause:** Cookie sync problems between client/server
**Solution:**
- Ensure using `@supabase/ssr` clients, not vanilla `@supabase/supabase-js`
- Check middleware is properly configured
- Verify cookies are not blocked by browser

### Issue: RLS Policy Blocking Admin Updates
**Cause:** Row Level Security preventing admin operations
**Solution:**
- Use `SUPABASE_SERVICE_ROLE_KEY` in server actions
- Or add specific RLS policies for admin role (see migration 018)

### Issue: "Column not found" Errors
**Cause:** Schema mismatch between code and database
**Solution:**
- Run latest migrations
- Check column names match exactly (case-sensitive)
- Verify foreign key relationships

## Code Patterns & Best Practices

### Custom Hooks Pattern
```typescript
export function useSubscription() {
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const fetchSubscription = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return
    
    const { data } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plan:plans!subscriptions_plan_id_fkey (
          id,
          name,
          max_screens,
          price
        )
      `)
      .eq('user_id', user.id)
      .single()
    
    setSubscription(data)
    setLoading(false)
  }, [])
  
  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])
  
  return { subscription, loading, refetch: fetchSubscription }
}
```

### Server Action Pattern
```typescript
'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function updateUserProfile(data: any) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', data.id)
    
    if (error) throw error
    
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### Component with Toast Pattern
```typescript
'use client'

import { useToast } from '@/hooks/use-toast'

export function Component() {
  const { toast } = useToast()
  
  const handleAction = async () => {
    try {
      const result = await serverAction()
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Action completed successfully'
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred'
      })
    }
  }
  
  return <Button onClick={handleAction}>Action</Button>
}
```

### Supabase Join Pattern
```typescript
// Fetch subscription with plan details
const { data } = await supabase
  .from('subscriptions')
  .select(`
    *,
    plan:plans!subscriptions_plan_id_fkey (
      id,
      name,
      description,
      price,
      max_screens,
      features
    )
  `)
  .eq('user_id', userId)
  .single()

// Access nested data
console.log(data.plan.max_screens)
```

## Deployment

### Vercel (Recommended)
1. Push code to GitHub repository
2. Import project in Vercel dashboard
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy automatically on push to main branch

### Database Setup (Supabase)
1. Create new project at https://supabase.com
2. Navigate to SQL Editor
3. Run migrations in order:
   - `001_create_tables.sql` - Initial schema
   - `002_add_rls_policies.sql` - Row Level Security
   - ... (all migrations sequentially)
   - `018_add_admin_update_policies.sql` - Latest admin policies
4. Verify tables and policies in Table Editor
5. Create test data or use `create-test-users.js` script

### Production Checklist
- [ ] All environment variables set in Vercel
- [ ] Database migrations run successfully
- [ ] RLS policies enabled and tested
- [ ] Admin user created with correct role
- [ ] Test plans created in `plans` table
- [ ] Email templates configured (if using email notifications)
- [ ] Domain configured (if custom domain)
- [ ] Analytics enabled (Vercel Analytics)
- [ ] Error tracking configured (optional: Sentry)

## Testing

### Manual Testing Checklist
- [ ] User registration flow
- [ ] User login/logout
- [ ] Plan selection and upgrade
- [ ] Coupon application
- [ ] Invoice viewing
- [ ] Credentials display
- [ ] Profile editing
- [ ] Admin user creation
- [ ] Admin subscription management
- [ ] Admin bulk operations
- [ ] Mobile responsiveness
- [ ] Dark mode toggle

### Test Users
Use `scripts/create-test-users.js` to create test users:
```bash
node scripts/create-test-users.js
```

Creates:
- `admin@test.com` / `admin123` (admin role)
- `user@test.com` / `user123` (regular user)

## Notes for AI Assistants

### Code Style
- Always use TypeScript with strict mode
- Follow existing code patterns for consistency
- Use Tailwind utility classes, avoid inline styles
- Prefer server components unless client interactivity needed
- Use `@supabase/ssr` clients, not vanilla `@supabase/supabase-js`
- Use `cn()` utility for conditional class names

### Common Patterns
- Server Actions must have `'use server'` directive
- Client Components must have `'use client'` directive
- Use `useCallback` for async functions in useEffect
- Always handle loading and error states
- Use toast notifications for user feedback
- Validate inputs on both client and server

### Database Operations
- Use service role key only in server actions
- Always check for errors after Supabase operations
- Use transactions for multi-table operations
- Revalidate paths after mutations
- Use JOINs to fetch related data efficiently

### Security
- Never expose service role key to client
- Validate all user inputs
- Use RLS policies for data access control
- Log sensitive operations to `user_logs`
- Sanitize user-generated content

### Performance
- Use server components for static content
- Lazy load heavy components
- Optimize images with Next.js Image component
- Use Supabase indexes for frequently queried columns
- Implement pagination for large data sets

### Accessibility
- Use semantic HTML elements
- Add ARIA labels to interactive elements
- Ensure keyboard navigation works
- Maintain color contrast ratios
- Test with screen readers

### Debugging
- Check browser console for client errors
- Check server logs for server action errors
- Use Supabase logs for database errors
- Test authentication flows thoroughly
- Verify RLS policies in Supabase dashboard

## Future Enhancements

### Planned Features
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Email notification system
- [ ] WhatsApp notifications via API
- [ ] QR code for credential sharing
- [ ] Device management (track connected devices)
- [ ] Two-factor authentication
- [ ] Invoice PDF generation
- [ ] Advanced analytics dashboard
- [ ] Multi-language support (i18n)
- [ ] API for third-party integrations

### Technical Improvements
- [ ] Unit tests with Jest
- [ ] E2E tests with Playwright
- [ ] Storybook for component documentation
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Performance monitoring
- [ ] Error tracking with Sentry
- [ ] Database backup automation
- [ ] Rate limiting for API routes

## Recent Improvements (November 2024)

### Code Refactoring & Organization
- ✅ **Settings Section Modularization**: Extracted `SettingsSection` into 4 cohesive subcomponents:
  - `ProfileSettings`: User profile management with WhatsApp validation
  - `NotificationSettings`: Email and WhatsApp notification preferences
  - `SecuritySettings`: Password change and secure account deletion
  - `DeviceSettings`: Connected device management and reset
  
- ✅ **User Management Refactoring**: Extracted `UserDetailsModal` from `UsersManagement` (1500+ lines → modular structure)
  - Created `components/admin/users/` directory for user-related components
  - Centralized types in `components/admin/users/types.ts`
  - Improved maintainability and testability

### Code Quality & Deduplication
- ✅ **Centralized Utilities**:
  - Created `lib/utils/subscription.ts` for `getStatusColor` and `getStatusLabel` functions
  - Created `lib/constants.ts` for shared constants (`countryCodes`)
  - Eliminated ~52 lines of duplicated code

- ✅ **Dead Code Removal**:
  - Removed unused `formatLogDetails` function from `UsersManagement`
  - Removed unused `Tabs` import after modal extraction
  - Cleaned up orphaned state variables

### UI/UX Improvements
- ✅ **Enhanced User History**: 
  - Created `LogItem` component for structured, visual history logs
  - Replaced raw JSON dumps with readable "Before → After" comparisons
  - Added color-coded icons and badges for different action types
- ✅ **Secure Account Deletion**: 
  - Moved `handleDeleteAccount` from client-side to server action (`deleteUserAccount` in `auth-actions.ts`)
  - Now uses `SUPABASE_SERVICE_ROLE_KEY` securely on the server
  - Prevents exposure of admin credentials to the client

### Bug Fixes
- ✅ **Subscription Status Updates**: Fixed `onUpdateSubscriptionStatus` callback signature mismatch
  - Changed from `(status) => handleUpdateStatus(selectedUser.id, status)` to direct `handleUpdateStatus` reference
  - Ensures proper userId passing to the update function
  - Fixes "inactive", "active", and "cancelled" status changes in admin panel

### Server Actions
All server actions use `SUPABASE_SERVICE_ROLE_KEY` for security:
- `registerUser`: Public user registration with auto-confirmation
- `createUser`: Admin user creation with optional subscription
- `updateUserPassword`: Admin password reset
- `createSubscription`: Manual subscription creation
- `deleteUsers`: Bulk user deletion
- `deleteUserAccount`: **NEW** - Secure account self-deletion

---

**Last Updated:** November 22, 2024
**Version:** 1.1.0
**Maintainer:** Development Team
