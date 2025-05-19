import requests
from bs4 import BeautifulSoup
import re
import json
import time
import random
# Try to import fake-useragent, but provide a fallback if it's not available
try:
    from fake_useragent import UserAgent
    HAS_FAKE_UA = True
except ImportError:
    HAS_FAKE_UA = False
    # Simple UserAgent class fallback
    class SimpleUserAgent:
        @property
        def random(self):
            agents = [
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.101 Safari/537.36"
            ]
            return random.choice(agents)
    UserAgent = SimpleUserAgent

import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
import os

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Constants
INDEED_JOB_URL = "https://www.indeed.com/jobs"
DEFAULT_LIMIT = 25
USE_MOCK_DATA = True  # Set to True to use mock data only

# Dictionary of search terms by category
SEARCH_TERM_DICT = {
    "tech": ["software", "developer", "engineer", "programmer", "coding", "tech", "IT", "data", 
             "python", "javascript", "react", "node", "fullstack", "frontend", "backend", "devops", 
             "cloud", "AWS", "Azure", "machine learning", "AI", "artificial intelligence"],
    "finance": ["finance", "accounting", "bookkeeper", "financial", "analyst", "banking", "investment", 
                "accountant", "CFO", "controller", "budget", "tax", "audit"],
    "marketing": ["marketing", "SEO", "content", "social media", "digital marketing", "brand", 
                 "advertising", "PR", "public relations", "growth", "market research"],
    "design": ["design", "UX", "UI", "user experience", "graphic", "creative", "product design",
               "visual", "art director", "web design"],
    "healthcare": ["healthcare", "medical", "doctor", "nurse", "physician", "pharma", "clinical",
                  "health", "therapy", "caregiver", "dental", "veterinary"],
    "education": ["education", "teacher", "professor", "instructor", "tutor", "academic", 
                 "curriculum", "teaching", "school", "university", "college", "training"],
    "remote": ["remote", "work from home", "WFH", "telecommute", "virtual", "distributed"],
    "entry_level": ["entry level", "entry-level", "junior", "graduate", "internship", "trainee", "associate"],
    "senior": ["senior", "lead", "principal", "staff", "manager", "director", "head", "chief", "vp", "executive"]
}

# Generate mock job data
def generate_mock_jobs(search_terms, location=None, limit=DEFAULT_LIMIT):
    """Generate mock job data based on search terms"""
    jobs = []
    companies = [
        "TechNova", "DataWave", "CloudSphere", "CodeCraft", "QuantumLogic", 
        "NexaAI", "ByteForge", "DigitalDynamics", "InnovateSoft", "PixelPerfect",
        "AgileStack", "CyberShield", "FusionTech", "LogicLeap", "MindMeld",
        "NetworX", "OptimizeIQ", "ProtonWorks", "QuantumQuill", "RoboticsEdge"
    ]
    locations = [
        "San Francisco, CA", "New York, NY", "Seattle, WA", "Austin, TX", 
        "Boston, MA", "Chicago, IL", "Remote", "Los Angeles, CA", "Denver, CO",
        "Portland, OR", "Atlanta, GA", "Miami, FL", "Nashville, TN", "Remote USA"
    ]
    
    # Use provided location if available
    if location:
        locations = [location, f"{location} Area", f"Remote - {location}", "Remote"]
    
    for i in range(1, limit + 1):
        # Randomly select components for the job
        company = random.choice(companies)
        job_location = random.choice(locations)
        
        # Determine job title based on search terms
        title = generate_title_from_terms(search_terms)
        
        # Generate other job details
        description = generate_description(title, company)
        salary_range = generate_salary_for_title(title)
        job_type = determine_job_type(title)
        experience_level = determine_experience_level(title)
        skills = extract_skills_from_title(title)
        
        # Create job object
        job = {
            "id": f"mock-{i}",
            "title": title,
            "company": company,
            "location": job_location,
            "description": description,
            "salary_range": salary_range,
            "job_type": job_type,
            "experience_level": experience_level,
            "skills": skills,
            "link": f"https://example.com/jobs/{i}",
            "posted_at": generate_recent_date()
        }
        
        jobs.append(job)
    
    return jobs

def generate_title_from_terms(search_terms):
    """Generate a realistic job title based on search terms"""
    # Title patterns
    patterns = [
        "{role} {level}",
        "{level} {role}",
        "{role} ({level})",
        "{level} {role} - {specialty}",
        "{specialty} {role}",
        "{role} {specialty} {level}"
    ]
    
    # Extract potential role, level, and specialty from search terms
    roles = ["Developer", "Engineer", "Designer", "Analyst", "Manager", "Specialist", "Consultant"]
    levels = ["Junior", "Mid-level", "Senior", "Lead", "Principal", "Staff"]
    specialties = ["Frontend", "Backend", "Full Stack", "Mobile", "Cloud", "DevOps", "Data", "UI/UX", "AI/ML", "Product"]
    
    # Find matching terms
    matched_role = None
    matched_level = None
    matched_specialty = None
    
    for term in search_terms:
        term_lower = term.lower()
        
        # Check for roles
        if "develop" in term_lower or "coder" in term_lower or "programmer" in term_lower:
            matched_role = "Developer"
        elif "engineer" in term_lower:
            matched_role = "Engineer"
        elif "design" in term_lower or "ui" in term_lower or "ux" in term_lower:
            matched_role = "Designer"
        elif "analy" in term_lower or "data" in term_lower:
            matched_role = "Analyst"
        elif "manage" in term_lower or "director" in term_lower or "head" in term_lower:
            matched_role = "Manager"
        
        # Check for levels
        if "junior" in term_lower or "entry" in term_lower:
            matched_level = "Junior"
        elif "senior" in term_lower or "sr" in term_lower:
            matched_level = "Senior"
        elif "lead" in term_lower:
            matched_level = "Lead"
        elif "principal" in term_lower:
            matched_level = "Principal"
            
        # Check for specialties
        if "front" in term_lower:
            matched_specialty = "Frontend"
        elif "back" in term_lower:
            matched_specialty = "Backend"
        elif "full" in term_lower:
            matched_specialty = "Full Stack"
        elif "mobile" in term_lower or "android" in term_lower or "ios" in term_lower:
            matched_specialty = "Mobile"
        elif "cloud" in term_lower or "aws" in term_lower or "azure" in term_lower:
            matched_specialty = "Cloud"
        elif "devops" in term_lower:
            matched_specialty = "DevOps"
        elif "data" in term_lower:
            matched_specialty = "Data"
        elif "ui" in term_lower or "ux" in term_lower or "user" in term_lower:
            matched_specialty = "UI/UX"
        elif "ai" in term_lower or "ml" in term_lower or "machine" in term_lower:
            matched_specialty = "AI/ML"
        elif "product" in term_lower:
            matched_specialty = "Product"
    
    # Provide defaults if nothing matched
    if not matched_role:
        matched_role = random.choice(roles)
    if not matched_level:
        matched_level = random.choice(levels)
    if not matched_specialty:
        matched_specialty = random.choice(specialties)
    
    # Pick a pattern and fill it
    pattern = random.choice(patterns)
    title = pattern.format(role=matched_role, level=matched_level, specialty=matched_specialty)
    
    # Add specific technology if in search terms
    techs = ["Python", "JavaScript", "React", "Node.js", "AWS", "Docker", "Kubernetes"]
    for tech in techs:
        if tech.lower() in " ".join(search_terms).lower():
            # 50% chance to add the tech to the title
            if random.random() > 0.5:
                title = f"{title} ({tech})"
                break
    
    return title

def generate_description(title, company):
    """Generate a job description based on title and company"""
    intro_templates = [
        f"{company} is seeking a talented {title} to join our growing team.",
        f"Join {company} as a {title} and help us build the next generation of products.",
        f"Exciting opportunity for a {title} to make an impact at {company}.",
        f"{company} is looking for an experienced {title} to join our innovative team.",
        f"Are you a passionate {title}? {company} wants to hear from you!"
    ]
    
    responsibility_templates = [
        "Design and implement new features and functionality.",
        "Collaborate with cross-functional teams to define and implement innovative solutions.",
        "Write clean, maintainable code with comprehensive test coverage.",
        "Participate in code reviews and contribute to technical documentation.",
        "Troubleshoot and resolve complex technical issues.",
        "Mentor junior team members and contribute to team growth.",
        "Optimize applications for maximum speed and scalability.",
        "Stay up-to-date with emerging technologies and industry trends."
    ]
    
    requirement_templates = [
        "Strong problem-solving abilities and attention to detail.",
        "Excellent communication and collaboration skills.",
        "Ability to work independently and as part of a team.",
        "Strong understanding of software development methodologies.",
        "Bachelor's degree in Computer Science or related field, or equivalent experience.",
        "Passion for learning and applying new technologies.",
        "Experience with agile development methodologies."
    ]
    
    # Build description
    description = random.choice(intro_templates) + "\n\n"
    
    # Add responsibilities
    description += "Responsibilities:\n"
    for _ in range(random.randint(3, 5)):
        description += "• " + random.choice(responsibility_templates) + "\n"
    
    description += "\nRequirements:\n"
    for _ in range(random.randint(3, 5)):
        description += "• " + random.choice(requirement_templates) + "\n"
    
    return description

def generate_salary_for_title(title):
    """Generate a plausible salary range based on job title"""
    title_lower = title.lower()
    
    # Base ranges
    ranges = {
        "intern": (40, 70),
        "junior": (60, 90),
        "associate": (75, 110),
        "senior": (120, 180),
        "lead": (140, 200),
        "manager": (130, 190),
        "director": (160, 250),
        "vp": (180, 300),
        "chief": (200, 350)
    }
    
    # Field modifiers
    field_modifiers = {
        "software": 1.2,
        "data": 1.15,
        "engineer": 1.1,
        "developer": 1.1,
        "designer": 0.9,
        "marketing": 0.85,
        "content": 0.8,
        "assistant": 0.7
    }
    
    # Default base range
    base_range = (80, 120)
    
    # Find matching level
    for level, range_val in ranges.items():
        if level in title_lower:
            base_range = range_val
            break
    
    # Apply field modifier
    modifier = 1.0
    for field, field_mod in field_modifiers.items():
        if field in title_lower:
            modifier = field_mod
            break
    
    # Calculate min and max
    min_salary = int(base_range[0] * modifier)
    max_salary = int(base_range[1] * modifier)
    
    # Format as string
    return f"${min_salary},000 - ${max_salary},000"

def determine_job_type(title):
    """Determine job type from title"""
    title_lower = title.lower()
    
    if "part-time" in title_lower or "part time" in title_lower:
        return "Part-time"
    elif "contract" in title_lower or "contractor" in title_lower:
        return "Contract"
    elif "freelance" in title_lower:
        return "Freelance"
    elif "intern" in title_lower or "internship" in title_lower:
        return "Internship"
    else:
        return "Full-time"

def determine_experience_level(title):
    """Determine experience level from title"""
    title_lower = title.lower()
    
    if any(term in title_lower for term in ["intern", "internship", "graduate", "entry-level", "entry level", "junior"]):
        return "Junior"
    elif any(term in title_lower for term in ["senior", "sr.", "lead", "principal", "staff"]):
        return "Senior"
    elif any(term in title_lower for term in ["manager", "director", "head", "chief", "vp", "vice president", "executive"]):
        return "Executive"
    else:
        return "Mid-level"

def extract_skills_from_title(title):
    """Extract likely skills from job title"""
    # Common tech skills to match
    common_skills = {
        "python": "Python",
        "javascript": "JavaScript", 
        "js": "JavaScript",
        "react": "React",
        "node": "Node.js",
        "node.js": "Node.js",
        "angular": "Angular",
        "vue": "Vue.js",
        "java": "Java",
        "c#": "C#",
        ".net": ".NET",
        "sql": "SQL",
        "nosql": "NoSQL",
        "aws": "AWS",
        "azure": "Azure",
        "google cloud": "Google Cloud",
        "gcp": "Google Cloud",
        "docker": "Docker",
        "kubernetes": "Kubernetes",
        "k8s": "Kubernetes",
        "php": "PHP",
        "ruby": "Ruby",
        "rails": "Ruby on Rails",
        "golang": "Go",
        "typescript": "TypeScript",
        "ts": "TypeScript",
        "html": "HTML",
        "css": "CSS",
        "ui": "UI Design",
        "ux": "UX Design",
        "seo": "SEO",
        "devops": "DevOps",
        "machine learning": "Machine Learning",
        "ml": "Machine Learning",
        "ai": "AI"
    }
    
    title_lower = title.lower()
    skills = []
    
    # Look for skills in the title
    for skill_key, skill_name in common_skills.items():
        if re.search(r'\b' + skill_key + r'\b', title_lower):
            skills.append(skill_name)
    
    # If no skills found, make an educated guess based on job type
    if not skills:
        if "software" in title_lower or "developer" in title_lower:
            skills = random.sample(["JavaScript", "Python", "SQL", "Git"], 3)
        elif "data" in title_lower:
            skills = random.sample(["SQL", "Python", "Excel", "Tableau"], 3)
        elif "design" in title_lower:
            skills = random.sample(["Figma", "Sketch", "UI Design", "UX Research"], 3)
        elif "marketing" in title_lower:
            skills = random.sample(["SEO", "Content Strategy", "Social Media", "Analytics"], 3)
        else:
            # Generic professional skills
            skills = random.sample(["Communication", "Project Management", "Microsoft Office", "Team Leadership"], 3)
    
    return skills

def generate_recent_date():
    """Generate a recent date within the last week"""
    days_ago = random.randint(0, 6)
    date = datetime.now() - timedelta(days=days_ago, hours=random.randint(0, 23))
    return date.isoformat()

class IndeedScraper:
    def __init__(self, use_proxy=False):
        """
        Initialize the Indeed scraper
        
        Args:
            use_proxy: Whether to use proxies for requests (not implemented yet)
        """
        self.session = requests.Session()
        self.ua = UserAgent()
        self.use_proxy = use_proxy
        self.last_request_time = 0
        self.min_request_interval = 2  # seconds between requests
        
    def _get_random_header(self) -> Dict[str, str]:
        """
        Generate random headers to avoid detection
        
        Returns:
            Dictionary of headers for requests
        """
        return {
            'User-Agent': self.ua.random,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://www.indeed.com/',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0',
            'TE': 'Trailers',
        }
    
    def _throttle_request(self):
        """Throttle requests to avoid rate limiting"""
        elapsed = time.time() - self.last_request_time
        if elapsed < self.min_request_interval:
            time.sleep(self.min_request_interval - elapsed)
        self.last_request_time = time.time()
    
    def search_jobs(self, keywords: Optional[List[str]] = None, 
                   location: Optional[str] = None,
                   categories: Optional[List[str]] = None,
                   limit: int = DEFAULT_LIMIT) -> List[Dict[str, Any]]:
        """
        Search for jobs on Indeed
        
        Args:
            keywords: List of specific keywords to search for
            location: Location to search in
            categories: List of categories from SEARCH_TERM_DICT to include
            limit: Maximum number of jobs to return
            
        Returns:
            List of job listings as dictionaries
        """
        # If USE_MOCK_DATA is True, return mock data
        if USE_MOCK_DATA:
            # Start with empty search terms
            search_terms = []
            
            # Add keywords if provided
            if keywords:
                search_terms.extend(keywords)
            
            # Add terms from categories if provided
            if categories:
                for category in categories:
                    if category in SEARCH_TERM_DICT:
                        # Add a random selection of terms from each category
                        category_terms = SEARCH_TERM_DICT[category]
                        # Take 2-5 random terms from each category
                        num_terms = min(len(category_terms), random.randint(2, 5))
                        selected_terms = random.sample(category_terms, num_terms)
                        search_terms.extend(selected_terms)
            
            # If no terms specified, use generic job search
            if not search_terms:
                # Default to a mix of tech and general terms
                search_terms = random.sample(SEARCH_TERM_DICT["tech"], 3)
                
            return generate_mock_jobs(search_terms, location, limit)
        
        # Construct the search query for Indeed
        search_query = ' '.join(keywords) if keywords else ''
        
        # Add terms from categories if provided
        if categories:
            category_terms = []
            for category in categories:
                if category in SEARCH_TERM_DICT:
                    # Take a few random terms from each category
                    num_terms = min(len(SEARCH_TERM_DICT[category]), random.randint(1, 3))
                    selected_terms = random.sample(SEARCH_TERM_DICT[category], num_terms)
                    category_terms.extend(selected_terms)
            
            if category_terms:
                if search_query:
                    search_query += ' ' + ' '.join(category_terms)
                else:
                    search_query = ' '.join(category_terms)
        
        # Construct search parameters for Indeed
        params = {
            "q": search_query,
            "l": location if location else "",
            "sort": "date",  # Sort by most recent
            "fromage": "1"  # From last 24 hours
        }
                    
        # Perform the search
        logger.info(f"Searching Indeed jobs with query: {search_query}")
        return self._fetch_jobs(params, limit)
    
    def _fetch_jobs(self, params: Dict[str, Any], limit: int) -> List[Dict[str, Any]]:
        """
        Fetch job listings from Indeed
        
        Args:
            params: Search parameters
            limit: Maximum number of jobs to return
            
        Returns:
            List of job listings
        """
        jobs = []
        page = 0
        jobs_per_page = 15  # Indeed typically shows 15 jobs per page
        start_val = 0
        
        while len(jobs) < limit:
            # Update start parameter for pagination
            if page > 0:
                params["start"] = str(start_val)
            
            # Throttle request
            self._throttle_request()
            
            try:
                # Make request with random headers
                response = self.session.get(
                    INDEED_JOB_URL,
                    params=params,
                    headers=self._get_random_header()
                )
                
                # Break if the request failed
                if response.status_code != 200:
                    logger.error(f"Failed to fetch jobs: {response.status_code}")
                    break
                
                # Parse the HTML
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Extract job listings - Indeed uses a different structure
                job_cards = soup.select('div.job_seen_beacon')
                
                if not job_cards:
                    # No more job cards found
                    break
                
                # Process each job card
                for card in job_cards:
                    job = self._parse_job_card(card)
                    if job:
                        jobs.append(job)
                    
                    # Break if we've reached the limit
                    if len(jobs) >= limit:
                        break
                
                # Go to next page
                page += 1
                start_val += jobs_per_page
                
                # Add a small delay between pages
                time.sleep(random.uniform(1.5, 3.0))
                
            except Exception as e:
                logger.error(f"Error fetching jobs: {e}")
                break
        
        # If no jobs found or error occurred, return mock data
        if not jobs:
            search_terms = []
            if 'q' in params and params['q']:
                search_terms = params['q'].split()
            return generate_mock_jobs(search_terms, params.get('l'), limit)
            
        return jobs[:limit]
    
    def _parse_job_card(self, card) -> Optional[Dict[str, Any]]:
        """
        Parse a job card from Indeed
        
        Args:
            card: BeautifulSoup element for the job card
            
        Returns:
            Job information as a dictionary or None if parsing failed
        """
        try:
            # Extract job ID - Indeed has a different structure
            job_id = card.get('data-jk', '')
            if not job_id:
                job_id = card.get('id', '').replace('job_', '')
            
            # Extract job title
            title_elem = card.select_one('h2.jobTitle span')
            title = title_elem.text.strip() if title_elem else "Unknown Title"
            
            # Extract company
            company_elem = card.select_one('span.companyName')
            company = company_elem.text.strip() if company_elem else "Unknown Company"
            
            # Extract location
            location_elem = card.select_one('div.companyLocation')
            location = location_elem.text.strip() if location_elem else "Unknown Location"
            
            # Extract description snippet
            description_elem = card.select_one('div.job-snippet')
            description = description_elem.text.strip() if description_elem else self._get_description_snippet(title, company)
            
            # Extract posting date
            date_elem = card.select_one('span.date')
            if date_elem:
                posted_at = date_elem.text.strip()
            else:
                posted_at = datetime.now().isoformat()
            
            # Extract link
            link_elem = card.select_one('a.jcs-JobTitle')
            base_link = "https://www.indeed.com/viewjob?jk="
            link = base_link + job_id if job_id else ""
            
            # Extract salary if available
            salary_elem = card.select_one('div.salary-snippet-container')
            salary_range = salary_elem.text.strip() if salary_elem else self._generate_salary_for_title(title)
            
            # Create job dictionary
            return {
                "id": job_id,
                "title": title,
                "company": company,
                "location": location,
                "description": description,
                "link": link,
                "posted_at": posted_at,
                # Add estimated fields
                "salary_range": salary_range,
                "job_type": self._determine_job_type(title, description),
                "experience_level": self._determine_experience_level(title, description),
                "skills": self._extract_skills_from_title(title)
            }
            
        except Exception as e:
            logger.error(f"Error parsing job card: {e}")
            return None
    
    def _get_description_snippet(self, title: str, company: str) -> str:
        """Generate a plausible description snippet when real data isn't accessible"""
        descriptions = [
            f"Join {company} as a {title} and work with a talented team on cutting-edge projects.",
            f"Exciting opportunity at {company} for a {title} position with competitive benefits.",
            f"{company} is looking for a {title} to help drive business growth and innovation.",
            f"Great career advancement opportunity as a {title} at {company}.",
            f"{company} seeks a {title} to join our diverse and inclusive team."
        ]
        return random.choice(descriptions)
    
    def _generate_salary_for_title(self, title: str) -> str:
        """Generate a plausible salary range based on job title"""
        title_lower = title.lower()
        
        # Base ranges
        ranges = {
            "intern": (40, 70),
            "junior": (60, 90),
            "associate": (75, 110),
            "senior": (120, 180),
            "lead": (140, 200),
            "manager": (130, 190),
            "director": (160, 250),
            "vp": (180, 300),
            "chief": (200, 350)
        }
        
        # Field modifiers
        field_modifiers = {
            "software": 1.2,
            "data": 1.15,
            "engineer": 1.1,
            "developer": 1.1,
            "designer": 0.9,
            "marketing": 0.85,
            "content": 0.8,
            "assistant": 0.7
        }
        
        # Default base range
        base_range = (80, 120)
        
        # Find matching level
        for level, range_val in ranges.items():
            if level in title_lower:
                base_range = range_val
                break
        
        # Apply field modifier
        modifier = 1.0
        for field, field_mod in field_modifiers.items():
            if field in title_lower:
                modifier = field_mod
                break
        
        # Calculate min and max
        min_salary = int(base_range[0] * modifier)
        max_salary = int(base_range[1] * modifier)
        
        # Format as string
        return f"${min_salary},000 - ${max_salary},000"
    
    def _determine_job_type(self, title: str, description: str) -> str:
        """Determine job type from title and description"""
        text = (title + " " + description).lower()
        
        if "part-time" in text or "part time" in text:
            return "Part-time"
        elif "contract" in text or "contractor" in text:
            return "Contract"
        elif "freelance" in text:
            return "Freelance"
        elif "intern" in text or "internship" in text:
            return "Internship"
        else:
            return "Full-time"
    
    def _determine_experience_level(self, title: str, description: str) -> str:
        """Determine experience level from title and description"""
        text = (title + " " + description).lower()
        
        if any(term in text for term in ["intern", "internship", "graduate", "entry-level", "entry level", "junior"]):
            return "Junior"
        elif any(term in text for term in ["senior", "sr.", "lead", "principal", "staff"]):
            return "Senior"
        elif any(term in text for term in ["manager", "director", "head", "chief", "vp", "vice president", "executive"]):
            return "Executive"
        else:
            return "Mid-level"
    
    def _extract_skills_from_title(self, title: str) -> List[str]:
        """Extract likely skills from job title"""
        # Common tech skills to match
        common_skills = {
            "python": "Python",
            "javascript": "JavaScript", 
            "js": "JavaScript",
            "react": "React",
            "node": "Node.js",
            "node.js": "Node.js",
            "angular": "Angular",
            "vue": "Vue.js",
            "java": "Java",
            "c#": "C#",
            ".net": ".NET",
            "sql": "SQL",
            "nosql": "NoSQL",
            "aws": "AWS",
            "azure": "Azure",
            "google cloud": "Google Cloud",
            "gcp": "Google Cloud",
            "docker": "Docker",
            "kubernetes": "Kubernetes",
            "k8s": "Kubernetes",
            "php": "PHP",
            "ruby": "Ruby",
            "rails": "Ruby on Rails",
            "golang": "Go",
            "typescript": "TypeScript",
            "ts": "TypeScript",
            "html": "HTML",
            "css": "CSS",
            "ui": "UI Design",
            "ux": "UX Design",
            "seo": "SEO",
            "devops": "DevOps",
            "machine learning": "Machine Learning",
            "ml": "Machine Learning",
            "ai": "AI"
        }
        
        title_lower = title.lower()
        skills = []
        
        # Look for skills in the title
        for skill_key, skill_name in common_skills.items():
            if re.search(r'\b' + skill_key + r'\b', title_lower):
                skills.append(skill_name)
        
        # If no skills found, make an educated guess based on job type
        if not skills:
            if "software" in title_lower or "developer" in title_lower:
                skills = random.sample(["JavaScript", "Python", "SQL", "Git"], 3)
            elif "data" in title_lower:
                skills = random.sample(["SQL", "Python", "Excel", "Tableau"], 3)
            elif "design" in title_lower:
                skills = random.sample(["Figma", "Sketch", "UI Design", "UX Research"], 3)
            elif "marketing" in title_lower:
                skills = random.sample(["SEO", "Content Strategy", "Social Media", "Analytics"], 3)
            else:
                # Generic professional skills
                skills = random.sample(["Communication", "Project Management", "Microsoft Office", "Team Leadership"], 3)
        
        return skills

# Singleton instance
_scraper = None

def get_scraper() -> IndeedScraper:
    """Get or create singleton scraper instance"""
    global _scraper
    if _scraper is None:
        _scraper = IndeedScraper()
    return _scraper

def search_jobs(keywords=None, location=None, categories=None, limit=DEFAULT_LIMIT):
    """Convenience function to search jobs"""
    scraper = get_scraper()
    return scraper.search_jobs(keywords, location, categories, limit)

# For testing
if __name__ == "__main__":
    # Test the scraper
    jobs = search_jobs(categories=["tech", "remote"])
    print(f"Found {len(jobs)} jobs")
    if jobs:
        print(json.dumps(jobs[0], indent=2)) 