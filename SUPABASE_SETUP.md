# Supabase Authentication Setup

## Quick Setup Guide

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (usually takes 2-3 minutes)

### 2. Get Your Credentials
1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the **Project URL** and **anon public** key

### 3. Update Environment Variables
Update your `.env.local` file with your Supabase credentials:

```bash
# Backend API Base URL - Point to your local FastAPI server
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set Up Database Schema
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `database/schema.sql`
3. Click **Run** to create the tables and policies

### 5. Configure Authentication
1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Under **Site URL**, add: `http://localhost:3000`
3. Under **Redirect URLs**, add: `http://localhost:3000/**`

### 6. Backend Configuration (Optional)
If you want to verify JWT tokens in your backend, add these to your backend environment:

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_JWT_SECRET=your-jwt-secret-here
```

You can find the JWT secret in **Settings** → **API** → **JWT Secret**.

## Testing the Setup

1. Start your backend: `cd backend && uvicorn app.main:app --reload --port 8000`
2. Start your frontend: `npm run dev`
3. Visit `http://localhost:3000`
4. You should see the authentication form instead of the username/gender selection

## Features Included

- ✅ Email/password authentication
- ✅ User registration with username and gender
- ✅ Persistent sessions
- ✅ Protected API routes
- ✅ Same UI styling as before
- ✅ Automatic profile creation
- ✅ Sign out functionality

## Next Steps

- Add social login (Google, GitHub, etc.)
- Add password reset functionality
- Add email verification
- Add user profile management
