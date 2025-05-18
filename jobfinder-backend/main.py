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
    get_jobs, 
    update_user_preferences, 
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
    location: Optional[str] = None
    job_type: Optional[str] = None
    experience_level: Optional[str] = None
    
class UserPreferences(BaseModel):
    email_notifications: Optional[bool] = None
    saved_searches: Optional[List[Dict[str, Any]]] = None
    preferred_job_types: Optional[List[str]] = None

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
    location: Optional[str] = None,
    job_type: Optional[str] = None,
    experience_level: Optional[str] = None
):
    """
    Retrieve matching jobs based on query parameters
    """
    filters = {}
    
    if keywords:
        filters["keywords"] = keywords
    
    if location:
        filters["location"] = location
    
    if job_type:
        filters["job_type"] = job_type
    
    if experience_level:
        filters["experience_level"] = experience_level
    
    # Call database function to get jobs
    jobs = get_jobs(filters)
    
    return jobs

@app.post("/api/search")
async def submit_search(search_params: SearchParams):
    """
    Submit search parameters and return matching jobs
    """
    filters = search_params.dict(exclude_none=True)
    jobs = get_jobs(filters)
    
    return jobs

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

@app.get("/")
async def root():
    return {"message": "Welcome to JobFinder API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 