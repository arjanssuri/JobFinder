from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr
import os
from dotenv import load_dotenv

# Import our modules
from database import (
    initialize_database, 
    update_user_preferences, 
    save_job_for_user,
    unsave_job_for_user,
    get_saved_jobs,
    create_user as db_create_user,
    get_user_by_email,
    update_last_login
)
from auth import (
    Token, 
    UserCreate, 
    UserOut, 
    UserLogin,
    get_password_hash, 
    authenticate_user, 
    create_access_token, 
    get_current_user
)
# Import our Indeed scraper
from indeed_scraper import search_jobs as indeed_search_jobs, SEARCH_TERM_DICT

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="JobFinder API")

# CORS settings
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class SearchParams(BaseModel):
    keywords: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    experience_level: Optional[str] = None
    min_salary: Optional[int] = None
    remote_only: Optional[bool] = False
    recent_only: Optional[bool] = False
    categories: Optional[List[str]] = None

class UserPreferences(BaseModel):
    email_notifications: Optional[bool] = None
    saved_searches: Optional[List[Dict[str, Any]]] = None
    preferred_job_types: Optional[List[str]] = None

class SaveJobRequest(BaseModel):
    job_id: int

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    initialize_database()

# Authentication endpoints
@app.post("/api/auth/register", response_model=Dict[str, Any])
async def register_user(user_data: UserCreate):
    # Check if user already exists
    existing_user = get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash the password
    hashed_password = get_password_hash(user_data.password)
    
    # Create the user in the database
    new_user = db_create_user(
        email=user_data.email,
        password_hash=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name
    )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(new_user["id"]), "email": new_user["email"]}
    )
    
    # Return user data and token
    return {
        "id": new_user["id"],
        "email": new_user["email"],
        "first_name": new_user["first_name"],
        "last_name": new_user["last_name"],
        "access_token": access_token,
        "token_type": "bearer"
    }

@app.post("/api/auth/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    # Authenticate user
    user = authenticate_user(form_data.username, form_data.password, get_user_by_email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login timestamp
    update_last_login(user["id"])
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(user["id"]), "email": user["email"]}
    )
    
    # Return token and user data
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "first_name": user["first_name"],
            "last_name": user["last_name"]
        }
    }

# Job endpoints
@app.get("/api/jobs")
async def get_jobs_endpoint(
    keywords: Optional[str] = None,
    role: Optional[str] = None,
    location: Optional[str] = None,
    job_type: Optional[str] = None,
    experience_level: Optional[str] = None,
    min_salary: Optional[int] = None,
    remote_only: Optional[bool] = False,
    recent_only: Optional[bool] = False,
    categories: Optional[str] = None
):
    """
    Retrieve matching jobs from Indeed
    """
    # Process search keywords
    search_keywords = []
    if keywords:
        search_keywords.extend(keywords.split())
    if role:
        search_keywords.extend(role.split())
    
    # Process categories
    search_categories = []
    if categories:
        search_categories = categories.split(',')
    
    # Add remote category if specified
    if remote_only:
        search_categories.append("remote")
    
    # Add experience level category if specified
    if experience_level:
        if experience_level.lower() in ["junior", "entry-level", "entry level"]:
            search_categories.append("entry_level")
        elif experience_level.lower() in ["senior", "expert"]:
            search_categories.append("senior")
    
    # Call Indeed scraper
    jobs = indeed_search_jobs(
        keywords=search_keywords,
        location=location, 
        categories=search_categories,
        limit=25
    )
    
    # Apply filters that Indeed API doesn't support
    if job_type or min_salary:
        filtered_jobs = []
        for job in jobs:
            # Filter by job type if specified
            if job_type and job.get("job_type") != job_type:
                continue
            
            # Filter by minimum salary if specified
            if min_salary:
                # Extract minimum salary from range
                salary_range = job.get("salary_range", "")
                try:
                    min_salary_str = salary_range.split("-")[0].strip()
                    min_salary_value = int(min_salary_str.replace("$", "").replace(",", ""))
                    if min_salary_value < min_salary * 1000:
                        continue
                except (ValueError, IndexError):
                    # Skip this job if we can't parse the salary
                    pass
            
            filtered_jobs.append(job)
        
        return filtered_jobs
    
    return jobs

@app.post("/api/search")
async def submit_search(search_params: SearchParams):
    """
    Submit search parameters and return matching jobs from Indeed
    """
    # Process search keywords
    search_keywords = []
    if search_params.keywords:
        search_keywords.extend(search_params.keywords.split())
    if search_params.role:
        search_keywords.extend(search_params.role.split())
    
    # Process categories
    search_categories = search_params.categories or []
    
    # Add remote category if specified
    if search_params.remote_only:
        search_categories.append("remote")
    
    # Add experience level category if specified
    if search_params.experience_level:
        if search_params.experience_level.lower() in ["junior", "entry-level", "entry level"]:
            search_categories.append("entry_level")
        elif search_params.experience_level.lower() in ["senior", "expert"]:
            search_categories.append("senior")
    
    # Call Indeed scraper
    jobs = indeed_search_jobs(
        keywords=search_keywords,
        location=search_params.location, 
        categories=search_categories,
        limit=25
    )
    
    # Apply filters that Indeed API doesn't support
    if search_params.job_type or search_params.min_salary:
        filtered_jobs = []
        for job in jobs:
            # Filter by job type if specified
            if search_params.job_type and job.get("job_type") != search_params.job_type:
                continue
            
            # Filter by minimum salary if specified
            if search_params.min_salary:
                # Extract minimum salary from range
                salary_range = job.get("salary_range", "")
                try:
                    min_salary_str = salary_range.split("-")[0].strip()
                    min_salary_value = int(min_salary_str.replace("$", "").replace(",", ""))
                    if min_salary_value < search_params.min_salary * 1000:
                        continue
                except (ValueError, IndexError):
                    # Skip this job if we can't parse the salary
                    pass
            
            filtered_jobs.append(job)
        
        return filtered_jobs
    
    return jobs

@app.get("/api/categories")
async def get_categories():
    """
    Get available search categories
    """
    return {
        "categories": list(SEARCH_TERM_DICT.keys()),
        "term_details": SEARCH_TERM_DICT
    }

# User preferences endpoint
@app.get("/api/preferences")
async def get_preferences(current_user = Depends(get_current_user)):
    """
    Get current user preferences (requires authentication)
    """
    # This would typically get the preferences from the database
    # For now, return empty preferences
    return {
        "email_notifications": False,
        "saved_searches": [],
        "preferred_job_types": []
    }

@app.put("/api/preferences")
async def update_preferences(
    preferences: UserPreferences,
    current_user = Depends(get_current_user)
):
    """
    Update user preferences (requires authentication)
    """
    user_id = current_user.user_id
    updated_prefs = update_user_preferences(user_id, preferences.dict(exclude_none=True))
    
    return {
        "status": "success", 
        "message": "Preferences updated", 
        "data": updated_prefs
    }

# Saved Jobs endpoints
@app.post("/api/jobs/save")
async def save_job(job_request: SaveJobRequest, current_user = Depends(get_current_user)):
    """
    Save a job for the current user (requires authentication)
    """
    user_id = int(current_user.user_id)
    job_id = job_request.job_id
    
    saved_job = save_job_for_user(user_id, job_id)
    
    return {
        "status": "success",
        "message": "Job saved successfully",
        "data": saved_job
    }

@app.delete("/api/jobs/save/{job_id}")
async def unsave_job(job_id: int, current_user = Depends(get_current_user)):
    """
    Remove a job from user's saved jobs (requires authentication)
    """
    user_id = int(current_user.user_id)
    
    result = unsave_job_for_user(user_id, job_id)
    
    if result["removed"]:
        return {
            "status": "success",
            "message": "Job removed from saved jobs",
            "data": result
        }
    else:
        return {
            "status": "error",
            "message": "Job was not saved",
            "data": result
        }

@app.get("/api/jobs/saved")
async def get_user_saved_jobs(current_user = Depends(get_current_user)):
    """
    Get all jobs saved by the current user (requires authentication)
    """
    user_id = int(current_user.user_id)
    
    jobs = get_saved_jobs(user_id)
    
    return jobs

@app.get("/")
async def root():
    return {"message": "Welcome to JobFinder API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 