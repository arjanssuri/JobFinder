# JobFinder Backend API

This is the backend API for the JobFinder application built with FastAPI.

## Setup

1. Create a virtual environment:
```
python -m venv venv
```

2. Activate the virtual environment:
- Windows: `venv\Scripts\activate`
- macOS/Linux: `source venv/bin/activate`

3. Install dependencies:
```
pip install -r requirements.txt
```

4. Copy the .env.example file to .env and update the values as needed:
```
# API Configuration
API_PORT=8000
API_HOST=0.0.0.0

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=jobfinder

# Security
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION_MINUTES=60
ALGORITHM=HS256

# CORS
CORS_ORIGINS=http://localhost:3000
```

5. Initialize the database:
```
python database.py
```

## Running the API

Start the development server:
```
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

## API Endpoints and Schemas

### Authentication

#### `POST /api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

#### `POST /api/auth/login`
Login with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### Jobs

#### `GET /api/jobs`
Retrieve matching jobs with optional filtering.

**Query Parameters:**
- `keywords` (optional): Text to search in job title and description
- `location` (optional): Job location filter
- `job_type` (optional): Type of job (Full-time, Part-time, Contract, etc.)
- `experience_level` (optional): Experience level (Junior, Mid-level, Senior, etc.)

**Response:**
```json
[
  {
    "id": 1,
    "title": "Software Engineer",
    "company": "Tech Corp",
    "location": "San Francisco, CA",
    "description": "Developing web applications using modern frameworks",
    "salary_range": "$120,000 - $150,000",
    "job_type": "Full-time",
    "experience_level": "Mid-level",
    "skills": ["JavaScript", "React", "Node.js"],
    "posted_at": "2023-05-18T12:00:00Z"
  },
  ...
]
```

#### `POST /api/search`
Submit search parameters and return matching jobs.

**Request Body:**
```json
{
  "keywords": "frontend developer",
  "location": "Remote",
  "job_type": "Full-time",
  "experience_level": "Mid-level"
}
```

**Response:**
Same format as `GET /api/jobs`

### User Preferences

#### `GET /api/preferences`
Get current user preferences (requires authentication).

**Response:**
```json
{
  "email_notifications": true,
  "saved_searches": [
    {
      "id": 1,
      "keywords": "frontend developer",
      "location": "Remote"
    }
  ],
  "preferred_job_types": ["Full-time", "Contract"]
}
```

#### `PUT /api/preferences`
Update user preferences (requires authentication).

**Request Body:**
```json
{
  "email_notifications": true,
  "saved_searches": [
    {
      "id": 1,
      "keywords": "frontend developer",
      "location": "Remote"
    }
  ],
  "preferred_job_types": ["Full-time", "Contract"]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Preferences updated",
  "data": {
    "email_notifications": true,
    "saved_searches": [
      {
        "id": 1,
        "keywords": "frontend developer",
        "location": "Remote"
      }
    ],
    "preferred_job_types": ["Full-time", "Contract"]
  }
}
```

### Saved Jobs

#### `GET /api/saved-jobs`
Get jobs saved by the user (requires authentication).

**Response:**
```json
[
  {
    "id": 1,
    "job": {
      "id": 42,
      "title": "Frontend Developer",
      "company": "WebUI",
      "location": "Remote",
      "description": "Building responsive user interfaces with React",
      "salary_range": "$100,000 - $130,000",
      "job_type": "Full-time",
      "experience_level": "Mid-level"
    },
    "saved_at": "2023-05-18T15:30:00Z"
  },
  ...
]
```

#### `POST /api/saved-jobs`
Save a job for later (requires authentication).

**Request Body:**
```json
{
  "job_id": 42
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Job saved successfully"
}
```

#### `DELETE /api/saved-jobs/{job_id}`
Remove a saved job (requires authentication).

**Response:**
```json
{
  "status": "success",
  "message": "Job removed from saved jobs"
}
```

### Job Applications

#### `GET /api/applications`
Get job applications for the user (requires authentication).

**Response:**
```json
[
  {
    "id": 1,
    "job": {
      "id": 42,
      "title": "Frontend Developer",
      "company": "WebUI",
      "location": "Remote"
    },
    "status": "applied",
    "applied_at": "2023-05-18T14:30:00Z"
  },
  ...
]
```

#### `POST /api/applications`
Submit a job application (requires authentication).

**Request Body:**
```json
{
  "job_id": 42
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Application submitted successfully",
  "data": {
    "id": 1,
    "job_id": 42,
    "status": "applied",
    "applied_at": "2023-05-18T14:30:00Z"
  }
}
```

## Database Schema

The application uses PostgreSQL with the following tables:

1. **users** - User accounts
   - id (PK)
   - email (unique)
   - password_hash
   - first_name
   - last_name
   - created_at
   - last_login

2. **jobs** - Job listings
   - id (PK)
   - title
   - company
   - location
   - description
   - salary_range
   - job_type
   - experience_level
   - skills (array)
   - posted_at

3. **user_preferences** - User preferences
   - id (PK)
   - user_id (FK to users)
   - email_notifications
   - saved_searches (JSONB)
   - preferred_job_types (array)
   - created_at
   - updated_at

4. **saved_jobs** - Jobs saved by users
   - id (PK)
   - user_id (FK to users)
   - job_id (FK to jobs)
   - saved_at

5. **job_applications** - Job applications
   - id (PK)
   - user_id (FK to users)
   - job_id (FK to jobs)
   - status
   - applied_at
   - updated_at

## Interactive API Documentation

Once the server is running, you can access the interactive API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc 