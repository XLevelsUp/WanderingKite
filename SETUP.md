# Rental Management System Setup Instructions

## Prerequisites

1. Create a Supabase account at https://supabase.com
2. Create a new Supabase project

## Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/00001_initial_schema.sql`
4. Paste and run the migration in the SQL Editor

## Environment Variables

1. Copy `.env.local.example` to `.env.local`:

   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your Supabase credentials in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)

You can find these values in:

- Supabase Dashboard → Settings → API

## Running the Application

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Creating Your First Admin User

1. Go to Supabase Dashboard → Authentication → Users
2. Add a new user manually
3. After creation, go to SQL Editor and run:
   ```sql
   update public.profiles
   set role = 'SUPER_ADMIN'
   where email = 'your-admin-email@example.com';
   ```

## Next Steps

- Access the dashboard at `/dashboard`
- Create equipment categories
- Add equipment items
- Register clients
- Start creating rentals
