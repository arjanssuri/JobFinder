# JobFinder Frontend

A Next.js application for searching and applying to jobs.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory with the following variables:
```
# Backend API URL (FastAPI)
BACKEND_API_URL=http://localhost:8000

# Supabase Configuration (Required for authentication)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. Replace `your-supabase-url` and `your-supabase-anon-key` with your actual Supabase project credentials from the Supabase dashboard.

## Development

Run the development server:
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Features

- Job search with filters
- Authentication (login, signup, OAuth)
- User preferences
- Job application tracking 