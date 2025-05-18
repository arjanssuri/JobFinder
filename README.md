# JobFinder
- An intelligent job-scraping platform that matches users with relevant positions based on specified roles and descriptions.

## Tech Stack
### Frontend: 
- Next.js + React 
- Dark blue & black UI with neon accents

### Backend:
- FastAPI
- Supabase
- PostgreSQL

## Features

- Automated web scraping for job listings
- Custom search by role and description
- Intelligent matching algorithm
- Real-time results dashboard

## API Routes

GET /api/jobs - Retrieve matching jobs
POST /api/search - Submit search parameters
PUT /api/preferences - Update user preferences

## Setup

-Clone repository

```
npm install
pip install -r requirements.txt
```

Configure environment variables (see .env.example)
Start services: npm run dev & uvicorn main:app --reload