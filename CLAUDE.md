# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nabta is an environmental volunteering platform built with Next.js 16, connecting volunteers with companies offering eco-friendly opportunities. The application features dual-dashboard architecture (volunteer and company views) with Supabase backend integration.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript with `strict: true`
- **Styling**: Tailwind CSS + Radix UI components
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth with SSR via @supabase/ssr
- **State Management**: React Context (UserProvider)
- **Forms**: react-hook-form with Zod validation
- **Charts**: Recharts

## Architecture

### Authentication Flow

The app uses a **three-layer authentication system**:

1. **Client-side**: `hooks/useUser.tsx` provides `UserProvider` context with real-time auth state
2. **Middleware**: `middleware.ts` handles route protection and session refresh for protected routes (`/company-dashboard`, `/volunteer-dashboard`)
3. **Component Guard**: `components/AuthGuard.tsx` wraps protected client components with loading states

**Key files**:
- `lib/supabaseClient.ts` - Client-side Supabase instance (uses implicit flow)
- `middleware.ts` - Server-side route protection with @supabase/ssr
- `hooks/useUser.tsx` - Global auth context provider

### Database Schema

Core tables (see `minimal-setup.sql` for schema):
- `companies` - Company profiles linked to auth.users
- `company_team_members` - Multi-user team access control with roles/permissions
- `events` - Volunteering opportunities with `company_id`, `created_by` foreign keys
- `event_images` - Separate image storage for events (references Supabase Storage bucket `images`)

**Important**: The database uses Row Level Security (RLS). Policies ensure users only access their own company data. See `COMPANY_DASHBOARD_INTEGRATION.md` for full setup steps.

### API Routes Structure

API routes use `@supabase/ssr` with Next.js cookies for server-side auth:

```typescript
// Pattern used in all API routes:
const cookieStore = await cookies();
const supabase = createServerClient(url, key, {
  cookies: {
    getAll() { return cookieStore.getAll(); },
    setAll(cookiesToSet) { /* ... */ }
  }
});

// Always verify user first:
const { data: { user }, error } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
```

**API Routes**:
- `app/api/companies/*` - Company profile and team management
- `app/api/companies/opportunities/*` - CRUD for events
- `app/api/upload/image/route.ts` - Image upload to Supabase Storage
- `app/api/calendar-events/*` - Volunteer dashboard calendar data
- `app/api/event-signup/route.ts` - Volunteer event registration

### Page Structure

- **Public pages**: `/` (home), `/opportunities`, `/for-companies`, `/login`
- **Protected dashboards**:
  - `/company-dashboard` - Company event management (uses AuthGuard)
  - `/volunteer-dashboard` - Volunteer opportunities view (uses AuthGuard)
- **Dynamic routes**: `/opportunities/[id]`, `/company-dashboard/participants/[id]`

### Component Organization

```
components/
├── ui/              # Radix UI primitives (shadcn/ui style)
├── layout/          # Navbar, Footer, ThemeToggle
├── home/            # Landing page sections
├── companies/       # For-companies page sections
├── opportunities/   # Public opportunity browser
├── company-dashboard/ # Company dashboard features
│   ├── EventEditorDialog.tsx  # Event CRUD with image upload
│   ├── opportunities.tsx      # Event list management
│   └── team.tsx              # Team member management
└── AuthGuard.tsx    # Client-side auth wrapper
```

## Important Patterns

### 1. Using Supabase in Different Contexts

**Client components** (pages, React components):
```typescript
import { supabase } from '@/lib/supabaseClient';
// Direct usage with useUser() hook for auth state
```

**Server-side API routes**:
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
// Create client with cookie handling (see API routes examples)
```

**Middleware**:
```typescript
// Already configured in middleware.ts
// Handles session refresh automatically
```

### 2. Protected Routes

**Always wrap protected client pages** with `AuthGuard`:
```tsx
export default function ProtectedPage() {
  return (
    <AuthGuard>
      <YourContent />
    </AuthGuard>
  );
}
```

### 3. Image Upload Flow

1. Client uploads to `/api/upload/image` with FormData
2. API route uploads to Supabase Storage bucket `images`
3. Returns public URL
4. Store URL in `event_images` table with event reference

**Note**: Storage bucket must be created manually in Supabase dashboard (see `COMPANY_DASHBOARD_INTEGRATION.md`)

### 4. Team Access Control

Companies can have multiple team members via `company_team_members` table:
- Roles: `owner`, `admin`, `member`
- Status: `pending`, `accepted`, `declined`
- Users are invited by email via `/api/companies/team` POST endpoint

## Configuration Notes

- **TypeScript**: `ignoreBuildErrors: true` in next.config.js (fix this for production)
- **Output**: Configured as `standalone` for Docker deployment
- **Images**: Unoptimized (may want to enable for production)
- **Path aliases**: `@/*` maps to project root (see tsconfig.json)

## Environment Variables Required

Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Database Setup

After forking/cloning, run SQL scripts in Supabase SQL editor:
1. Run `minimal-setup.sql` for basic table structure
2. Follow `FINAL_SETUP_GUIDE.md` for RLS policies and triggers
3. Create Storage bucket named `images` (public access)

## Key Gotchas

1. **Auth state timing**: Always check `loading` state from `useUser()` before redirecting
2. **Cookie handling**: API routes must use `@supabase/ssr` pattern, not `supabaseClient.ts`
3. **RLS policies**: If queries fail with empty results, check Supabase RLS policies first
4. **Next.js 16**: Uses React Server Components by default - mark interactive components with `"use client"`
5. **Middleware auth**: Protected routes are enforced at middleware level, AuthGuard is secondary UX layer

## Current Migration Status

The app recently migrated from mock data to Supabase backend:
- ✅ Company dashboard fully integrated
- ✅ Event CRUD operations with real DB
- ✅ Image upload to Supabase Storage
- ✅ Team member management
- ⚠️ Volunteer dashboard may still use mock data in some areas

See `COMPANY_DASHBOARD_INTEGRATION.md` for migration details.
