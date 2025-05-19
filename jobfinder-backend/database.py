import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import os
from typing import Dict, List, Optional, Any
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Load environment variables from .env
load_dotenv()

# Database connection URL with fallback
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/jobfinder")

# Mock database mode if needed
MOCK_DB = os.getenv("MOCK_DB", "false").lower() == "true"

# Connection pool
connection = None
cursor = None

# Mock data for development when real database is not available
MOCK_JOBS = [
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
    {
        "id": 2,
        "title": "Data Scientist",
        "company": "Data Insights",
        "location": "Remote",
        "description": "Analyzing large datasets and building ML models",
        "salary_range": "$130,000 - $160,000",
        "job_type": "Full-time",
        "experience_level": "Senior",
        "skills": ["Python", "SQL", "Machine Learning"],
        "posted_at": "2023-05-17T10:00:00Z"
    },
    {
        "id": 3,
        "title": "Frontend Developer",
        "company": "WebUI",
        "location": "New York, NY",
        "description": "Building responsive user interfaces with React",
        "salary_range": "$100,000 - $130,000",
        "job_type": "Contract",
        "experience_level": "Junior",
        "skills": ["HTML", "CSS", "JavaScript", "React"],
        "posted_at": "2023-05-16T14:00:00Z"
    }
]

MOCK_USERS = {}
MOCK_PREFERENCES = {}

def get_db_connection():
    """
    Get a connection to the PostgreSQL database.
    If a connection already exists, returns it; otherwise creates a new one.
    """
    global connection, cursor, MOCK_DB
    
    if MOCK_DB:
        # Return None for both if in mock mode
        logger.info("Using mock database connection")
        return None, None
    
    try:
        if connection is None or connection.closed:
            # Create a new connection using the DATABASE_URL
            connection = psycopg2.connect(DATABASE_URL)
            connection.autocommit = False
            logger.info("Database connection established")
            
        if cursor is None or cursor.closed:
            # Create a cursor that returns results as dictionaries
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            
        return connection, cursor
    
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        logger.info("Falling back to mock database")
        MOCK_DB = True
        return None, None

def close_db_connection():
    """
    Close the database connection and cursor if they exist.
    """
    global connection, cursor
    
    if MOCK_DB:
        return
    
    try:
        if cursor and not cursor.closed:
            cursor.close()
            logger.info("Database cursor closed")
        
        if connection and not connection.closed:
            connection.close()
            logger.info("Database connection closed")
    
    except Exception as e:
        logger.error(f"Error closing database connection: {e}")
    
    finally:
        cursor = None
        connection = None

def initialize_database():
    """
    Initialize database by creating necessary tables if they don't exist.
    This should be called when the application starts.
    """
    global MOCK_DB
    
    if MOCK_DB:
        logger.info("Using mock database - no initialization needed")
        return
    
    conn = None
    try:
        conn, cur = get_db_connection()
        
        if conn is None:
            logger.warning("Could not initialize database - using mock data")
            return
        
        # Create users table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP WITH TIME ZONE
            );
        """)
        
        # Create jobs table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS jobs (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                company VARCHAR(255) NOT NULL,
                location VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                salary_range VARCHAR(100),
                job_type VARCHAR(50),
                experience_level VARCHAR(50),
                skills TEXT[],
                posted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Create user_preferences table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS user_preferences (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                email_notifications BOOLEAN DEFAULT FALSE,
                new_job_alerts BOOLEAN DEFAULT FALSE,
                application_updates BOOLEAN DEFAULT FALSE,
                marketing_emails BOOLEAN DEFAULT FALSE,
                saved_searches JSONB,
                preferred_job_types TEXT[],
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Create saved_jobs table (for jobs saved by users)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS saved_jobs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
                saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, job_id)
            );
        """)
        
        # Create job_applications table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS job_applications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
                status VARCHAR(50) DEFAULT 'applied',
                applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, job_id)
            );
        """)
        
        # Insert sample jobs if there are none
        cur.execute("SELECT COUNT(*) FROM jobs")
        job_count = cur.fetchone()["count"]
        
        if job_count == 0:
            logger.info("Adding sample job data")
            for job in MOCK_JOBS:
                cur.execute(
                    """
                    INSERT INTO jobs 
                    (title, company, location, description, salary_range, job_type, experience_level, skills)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        job["title"],
                        job["company"],
                        job["location"],
                        job["description"],
                        job["salary_range"],
                        job["job_type"],
                        job["experience_level"],
                        job["skills"]
                    )
                )
        
        conn.commit()
        logger.info("Database tables initialized successfully")
        
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        # Rollback only if connection exists
        if conn is not None:
            try:
                conn.rollback()
            except Exception:
                pass
        
        # Enable mock mode if database initialization fails
        MOCK_DB = True
        logger.info("Falling back to mock database")
    
    finally:
        if conn is not None and not conn.closed:
            conn.close()

# Database access methods

def get_jobs(filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Get jobs with optional filtering.
    
    Args:
        filters: Dictionary of filters to apply (keywords, location, job_type, experience_level, min_salary)
    
    Returns:
        List of jobs as dictionaries
    """
    # Use mock data if in mock mode
    if MOCK_DB:
        filtered_jobs = MOCK_JOBS.copy()
        
        if filters:
            if filters.get("keywords"):
                keywords = filters["keywords"].lower()
                filtered_jobs = [
                    job for job in filtered_jobs 
                    if (keywords in job["title"].lower() or 
                        keywords in job["description"].lower() or
                        any(keywords in skill.lower() for skill in job["skills"]))
                ]
                
            if filters.get("location"):
                location = filters["location"].lower()
                filtered_jobs = [
                    job for job in filtered_jobs 
                    if location in job["location"].lower()
                ]
                
            if filters.get("job_type"):
                job_type = filters["job_type"]
                filtered_jobs = [
                    job for job in filtered_jobs 
                    if job["job_type"] == job_type
                ]
                
            if filters.get("experience_level"):
                exp_level = filters["experience_level"]
                filtered_jobs = [
                    job for job in filtered_jobs 
                    if job["experience_level"] == exp_level
                ]
                
            if filters.get("min_salary"):
                # Convert k to actual value (10k = 10,000)
                min_salary_k = int(filters["min_salary"])
                
                # For mock data, don't filter out results if min_salary is very low
                if min_salary_k > 10:  # Only filter if salary requirement is above 10k
                    min_salary = min_salary_k * 1000
                    filtered_jobs = [
                        job for job in filtered_jobs 
                        if job.get("salary_range") and extract_min_salary(job["salary_range"]) >= min_salary
                    ]
        
        return filtered_jobs
    
    # Otherwise, use database
    conn = None
    try:
        conn, cur = get_db_connection()
        
        if conn is None:
            return MOCK_JOBS
        
        query = "SELECT * FROM jobs WHERE 1=1"
        params = []
        
        if filters:
            if filters.get("keywords"):
                query += " AND (title ILIKE %s OR description ILIKE %s OR %s = ANY(skills))"
                keyword_param = f"%{filters['keywords']}%"
                # For skills, we need exact match
                skills_param = filters['keywords']
                params.extend([keyword_param, keyword_param, skills_param])
                
            if filters.get("location"):
                query += " AND location ILIKE %s"
                params.append(f"%{filters['location']}%")
                
            if filters.get("job_type"):
                query += " AND job_type = %s"
                params.append(filters["job_type"])
                
            if filters.get("experience_level"):
                query += " AND experience_level = %s"
                params.append(filters["experience_level"])
                
            # Only apply salary filter if it's meaningful (above 10k)
            if filters.get("min_salary") and int(filters["min_salary"]) > 10:
                # This is a simplified approach - in a real app, you'd use a numeric salary field
                # The pattern uses a more lenient approach to match salary ranges in text format
                query += " AND REGEXP_REPLACE(salary_range, '[^0-9]', '', 'g')::text ~ %s"
                # Create pattern that looks for numbers >= min_salary
                min_salary = int(filters["min_salary"]) * 1000
                # Convert to string with optional thousands separator for pattern matching
                min_salary_str = str(min_salary)
                params.append(min_salary_str[:1] + ".*" + min_salary_str[1:])  # Match first digit followed by any chars and then the rest
        
        query += " ORDER BY posted_at DESC"
        
        cur.execute(query, params)
        results = cur.fetchall()
        
        return results
        
    except Exception as e:
        logger.error(f"Error fetching jobs: {e}")
        return MOCK_JOBS
    
    finally:
        if conn and not conn.closed:
            conn.close()

# Helper function to extract minimum salary from a salary range string
def extract_min_salary(salary_range: str) -> int:
    """
    Extract the minimum salary from a salary range string like "$120,000 - $150,000"
    
    Args:
        salary_range: Salary range as a string
        
    Returns:
        Minimum salary as an integer
    """
    try:
        # Handle various formats
        # If there's no salary range, default to a high value to pass filters
        if not salary_range or salary_range.lower() == "competitive" or salary_range.lower() == "negotiable":
            return 100000  # Default value for ranges like "Competitive" or "Negotiable"
            
        # Format: "$120,000 - $150,000"
        if " - " in salary_range:
            min_part = salary_range.split(" - ")[0]
        else:
            min_part = salary_range
        
        # Extract only numbers from the string (remove $, commas, etc)
        min_salary_digits = ''.join(char for char in min_part if char.isdigit())
        
        # If no digits found, return default
        if not min_salary_digits:
            return 100000
            
        # Convert to int
        min_salary = int(min_salary_digits)
        
        # Handle cases where the number might not have enough digits (e.g. just "120" instead of "120000")
        if min_salary < 1000:
            min_salary *= 1000  # Assuming k format
            
        return min_salary
    except (ValueError, TypeError, IndexError):
        # Default to a reasonable value if we can't parse
        return 100000

def update_user_preferences(user_id: int, preferences: Dict[str, Any]) -> Dict[str, Any]:
    """
    Update user preferences.
    
    Args:
        user_id: ID of the user
        preferences: Dictionary of preferences to update
        
    Returns:
        Updated preferences as a dictionary
    """
    # Use mock data if in mock mode
    if MOCK_DB:
        if str(user_id) not in MOCK_PREFERENCES:
            MOCK_PREFERENCES[str(user_id)] = {
                "email_notifications": False,
                "new_job_alerts": False,
                "application_updates": False,
                "marketing_emails": False,
                "saved_searches": [],
                "preferred_job_types": []
            }
        
        for key, value in preferences.items():
            if key in ["email_notifications", "new_job_alerts", "application_updates", 
                      "marketing_emails", "saved_searches", "preferred_job_types"]:
                MOCK_PREFERENCES[str(user_id)][key] = value
        
        return {
            "id": 1,
            "user_id": user_id,
            **MOCK_PREFERENCES[str(user_id)],
            "created_at": "2023-05-18T12:00:00Z",
            "updated_at": "2023-05-18T12:00:00Z"
        }
    
    # Otherwise, use database
    conn = None
    try:
        conn, cur = get_db_connection()
        
        if conn is None:
            # Fall back to mock data
            return update_user_preferences(user_id, preferences)
        
        # Check if user preferences exist
        cur.execute("SELECT * FROM user_preferences WHERE user_id = %s", (user_id,))
        existing_preferences = cur.fetchone()
        
        if existing_preferences:
            # Update existing preferences
            set_clauses = []
            params = []
            
            for key, value in preferences.items():
                # Map frontend keys to database columns if needed
                db_key = key
                if key in ["email_notifications", "new_job_alerts", "application_updates", 
                          "marketing_emails", "saved_searches", "preferred_job_types"]:
                    set_clauses.append(f"{db_key} = %s")
                    
                    # Convert dict to JSON string for JSONB fields
                    if key == "saved_searches" and isinstance(value, dict):
                        value = json.dumps(value)
                    
                    params.append(value)
            
            if set_clauses:
                set_clauses.append("updated_at = CURRENT_TIMESTAMP")
                query = f"UPDATE user_preferences SET {', '.join(set_clauses)} WHERE user_id = %s RETURNING *"
                params.append(user_id)
                
                cur.execute(query, params)
                result = cur.fetchone()
                conn.commit()
                
                return result
            
        else:
            # Create new preferences
            # Convert saved_searches to JSON if it's a dict
            saved_searches = preferences.get("saved_searches", {})
            if isinstance(saved_searches, dict):
                saved_searches = json.dumps(saved_searches)
                
            columns = ["user_id", "email_notifications"]
            values = [user_id, preferences.get("email_notifications", False)]
            placeholders = ["%s", "%s"]
            
            # Add additional fields if present
            optional_fields = [
                ("new_job_alerts", False),
                ("application_updates", False),
                ("marketing_emails", False),
                ("saved_searches", "{}"),
                ("preferred_job_types", [])
            ]
            
            for field, default in optional_fields:
                if field in preferences:
                    columns.append(field)
                    values.append(preferences.get(field, default))
                    placeholders.append("%s")
            
            query = f"""
            INSERT INTO user_preferences ({', '.join(columns)})
            VALUES ({', '.join(placeholders)})
            RETURNING *
            """
            
            cur.execute(query, values)
            result = cur.fetchone()
            conn.commit()
            
            return result
        
    except Exception as e:
        logger.error(f"Error updating user preferences: {e}")
        if conn:
            conn.rollback()
        
        # Fall back to mock data
        return update_user_preferences(user_id, preferences)
    
    finally:
        if conn and not conn.closed:
            conn.close()

# Authentication methods

def create_user(email: str, password_hash: str, first_name: str = None, last_name: str = None) -> Dict[str, Any]:
    """
    Create a new user.
    
    Args:
        email: User email
        password_hash: Hashed password
        first_name: User's first name (optional)
        last_name: User's last name (optional)
        
    Returns:
        New user as a dictionary
    """
    # Use mock data if in mock mode
    if MOCK_DB:
        user_id = len(MOCK_USERS) + 1
        user = {
            "id": user_id,
            "email": email,
            "password_hash": password_hash,
            "first_name": first_name,
            "last_name": last_name,
            "created_at": "2023-05-18T12:00:00Z"
        }
        MOCK_USERS[email] = user
        return user
    
    # Otherwise, use database
    conn = None
    try:
        conn, cur = get_db_connection()
        
        if conn is None:
            # Fall back to mock data
            return create_user(email, password_hash, first_name, last_name)
        
        cur.execute(
            """
            INSERT INTO users (email, password_hash, first_name, last_name)
            VALUES (%s, %s, %s, %s)
            RETURNING id, email, first_name, last_name, created_at
            """,
            (email, password_hash, first_name, last_name)
        )
        
        user = cur.fetchone()
        conn.commit()
        
        return user
        
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        if conn:
            conn.rollback()
        
        # Fall back to mock data
        return create_user(email, password_hash, first_name, last_name)
    
    finally:
        if conn and not conn.closed:
            conn.close()

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """
    Get user by email.
    
    Args:
        email: User email
        
    Returns:
        User as a dictionary or None if not found
    """
    # Use mock data if in mock mode
    if MOCK_DB:
        return MOCK_USERS.get(email)
    
    # Otherwise, use database
    conn = None
    try:
        conn, cur = get_db_connection()
        
        if conn is None:
            # Fall back to mock data
            return get_user_by_email(email)
        
        cur.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cur.fetchone()
        
        return user
        
    except Exception as e:
        logger.error(f"Error fetching user by email: {e}")
        # Fall back to mock data
        return get_user_by_email(email)
    
    finally:
        if conn and not conn.closed:
            conn.close()

def update_last_login(user_id: int) -> None:
    """
    Update user's last login timestamp.
    
    Args:
        user_id: ID of the user
    """
    # No action needed in mock mode
    if MOCK_DB:
        return
    
    conn = None
    try:
        conn, cur = get_db_connection()
        
        if conn is None:
            return
        
        cur.execute(
            "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = %s",
            (user_id,)
        )
        
        conn.commit()
        
    except Exception as e:
        logger.error(f"Error updating last login: {e}")
        if conn:
            conn.rollback()
    
    finally:
        if conn and not conn.closed:
            conn.close()

def save_job_for_user(user_id: int, job_id: int) -> Dict[str, Any]:
    """
    Save a job for a user.
    
    Args:
        user_id: ID of the user
        job_id: ID of the job
        
    Returns:
        Saved job as a dictionary
    """
    # Use mock data if in mock mode
    if MOCK_DB:
        saved_job = {
            "id": 1,
            "user_id": user_id,
            "job_id": job_id,
            "saved_at": "2023-05-18T12:00:00Z"
        }
        return saved_job
    
    # Otherwise, use database
    conn = None
    try:
        conn, cur = get_db_connection()
        
        if conn is None:
            # Fall back to mock data
            return save_job_for_user(user_id, job_id)
        
        # Check if already saved
        cur.execute(
            "SELECT * FROM saved_jobs WHERE user_id = %s AND job_id = %s",
            (user_id, job_id)
        )
        existing = cur.fetchone()
        
        if existing:
            return existing
            
        # Insert new saved job
        cur.execute(
            """
            INSERT INTO saved_jobs (user_id, job_id)
            VALUES (%s, %s)
            RETURNING *
            """,
            (user_id, job_id)
        )
        
        result = cur.fetchone()
        conn.commit()
        
        return result
        
    except Exception as e:
        logger.error(f"Error saving job: {e}")
        if conn:
            conn.rollback()
        
        # Fall back to mock data
        return save_job_for_user(user_id, job_id)
    
    finally:
        if conn and not conn.closed:
            conn.close()

def get_saved_jobs(user_id: int) -> List[Dict[str, Any]]:
    """
    Get saved jobs for a user.
    
    Args:
        user_id: ID of the user
        
    Returns:
        List of saved jobs as dictionaries
    """
    # Use mock data if in mock mode
    if MOCK_DB:
        # Just return the first job from mock data as saved
        if MOCK_JOBS:
            return [
                {
                    **MOCK_JOBS[0],
                    "saved_at": "2023-05-18T12:00:00Z"
                }
            ]
        return []
    
    # Otherwise, use database
    conn = None
    try:
        conn, cur = get_db_connection()
        
        if conn is None:
            # Fall back to mock data
            return get_saved_jobs(user_id)
        
        # Get saved jobs with job details
        cur.execute(
            """
            SELECT j.*, sj.saved_at 
            FROM jobs j 
            JOIN saved_jobs sj ON j.id = sj.job_id 
            WHERE sj.user_id = %s 
            ORDER BY sj.saved_at DESC
            """,
            (user_id,)
        )
        
        results = cur.fetchall()
        return results
        
    except Exception as e:
        logger.error(f"Error fetching saved jobs: {e}")
        # Fall back to mock data
        return get_saved_jobs(user_id)
    
    finally:
        if conn and not conn.closed:
            conn.close()

def unsave_job_for_user(user_id: int, job_id: int) -> Dict[str, Any]:
    """
    Remove a job from user's saved jobs.
    
    Args:
        user_id: ID of the user
        job_id: ID of the job
        
    Returns:
        Status information as a dictionary
    """
    # Use mock data if in mock mode
    if MOCK_DB:
        return {
            "removed": True,
            "user_id": user_id,
            "job_id": job_id
        }
    
    # Otherwise, use database
    conn = None
    try:
        conn, cur = get_db_connection()
        
        if conn is None:
            # Fall back to mock data
            return unsave_job_for_user(user_id, job_id)
        
        # Delete the saved job
        cur.execute(
            "DELETE FROM saved_jobs WHERE user_id = %s AND job_id = %s RETURNING job_id",
            (user_id, job_id)
        )
        
        result = cur.fetchone()
        conn.commit()
        
        if result:
            return {
                "removed": True,
                "user_id": user_id,
                "job_id": job_id
            }
        else:
            return {
                "removed": False,
                "user_id": user_id,
                "job_id": job_id,
                "message": "Job was not saved"
            }
        
    except Exception as e:
        logger.error(f"Error unsaving job: {e}")
        if conn:
            conn.rollback()
        
        # Fall back to mock data
        return unsave_job_for_user(user_id, job_id)
    
    finally:
        if conn and not conn.closed:
            conn.close()

# Initialize database if this file is run directly
if __name__ == "__main__":
    try:
        initialize_database()
        print("Database initialized successfully!")
        
        if not MOCK_DB:
            # Test connection
            conn, cur = get_db_connection()
            if conn:
                cur.execute("SELECT NOW();")
                result = cur.fetchone()
                print(f"Current time from database: {result['now']}")
        else:
            print("Using mock database")
        
    except Exception as e:
        print(f"Error: {e}")
    
    finally:
        close_db_connection() 