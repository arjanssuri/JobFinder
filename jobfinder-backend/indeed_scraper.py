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
import undetected_chromedriver as uc
from database import get_jobs, initialize_database, update_user_preferences, save_job_for_user, unsave_job_for_user, get_saved_jobs, create_user as db_create_user, get_user_by_email, update_last_login
import psycopg2

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Constants
INDEED_JOB_URL = "https://www.indeed.com/jobs"
DEFAULT_LIMIT = 25
USE_MOCK_DATA = False  # Set to False to use real data

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

class IndeedScraper:
    def __init__(self, use_proxy=False):
        """
        Initialize the Indeed scraper using undetected-chromedriver (visible Chrome, realistic fingerprinting)
        Note: Requires undetected-chromedriver to be installed.
        """
        self.use_proxy = use_proxy
        self.last_request_time = 0
        self.min_request_interval = 2  # seconds between requests
        # Set up undetected Chrome
        chrome_options = uc.ChromeOptions()
        chrome_options.headless = False  # Run in visible mode
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--lang=en-US,en')
        chrome_options.add_argument("user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36")
        self.driver = uc.Chrome(options=chrome_options)

        # Placeholder for cookie injection
        # To use: log in to Indeed in a real browser, export cookies as a list of dicts, and paste below
        self.inject_cookies = False  # Set to True and fill in cookies below to use
        self.cookies = [
            # Example:
            # {"name": "session", "value": "your_session_cookie", "domain": ".indeed.com", ...}
        ]

    def _throttle_request(self):
        """Throttle requests to avoid rate limiting"""
        elapsed = time.time() - self.last_request_time
        if elapsed < self.min_request_interval:
            time.sleep(self.min_request_interval - elapsed)
        self.last_request_time = time.time()

    def search_jobs(self, keywords: Optional[List[str]] = None, 
                   location: Optional[str] = None,
                   categories: Optional[List[str]] = None,  # keep for interface compatibility
                   limit: int = DEFAULT_LIMIT) -> List[Dict[str, Any]]:
        """
        Search for jobs on Indeed
        
        Args:
            keywords: List of specific keywords to search for
            location: Location to search in
            categories: (ignored)
            limit: Maximum number of jobs to return
            
        Returns:
            List of job listings as dictionaries
        """
        # Construct the search query for Indeed
        search_query = ' '.join(keywords) if keywords and keywords[0] else ''
        
        # Ignore categories entirely
        
        # If no keywords provided
        if not search_query:
            search_query = "jobs"  # Default search term
            
        # Log the search query being used
        logger.info(f"Searching Indeed with query: '{search_query}' in location: '{location}'")
        
        # Construct search parameters for Indeed
        params = {
            "q": search_query,
            "l": location if location else "",
            "ts": str(int(time.time() * 1000)),
            "from": "searchOnHP",
            "rq": "1",
            "rsIdx": "0",
            "newcount": "207",
            "fromage": "last"
        }
                    
        # Perform the search
        return self._fetch_jobs(params, limit)
    
    def _fetch_jobs(self, params: Dict[str, Any], limit: int) -> List[Dict[str, Any]]:
        jobs = []
        page = 0
        jobs_per_page = 15  # Indeed typically shows 15 jobs per page
        start_val = 0
        base_url = INDEED_JOB_URL
        from urllib.parse import urlencode
        while len(jobs) < limit:
            if page > 0:
                params["start"] = str(start_val)
            self._throttle_request()
            url = f"{base_url}?{urlencode(params)}"
            logger.info(f"Selenium requesting URL: {url}")
            print(f"Requesting URL: {url}")
            try:
                self.driver.get("https://www.indeed.com/")  # Open homepage first for cookies
                # Inject cookies if enabled
                if self.inject_cookies and self.cookies:
                    for cookie in self.cookies:
                        self.driver.add_cookie(cookie)
                    self.driver.get(url)  # Reload after setting cookies
                else:
                    self.driver.get(url)
                # Wait randomly to mimic human behavior
                wait_time = random.uniform(0.5, 1.0)
                print(f"[DEBUG] Waiting {wait_time:.2f} seconds after page load...")
                time.sleep(wait_time)
                # Scroll the page to bottom to trigger dynamic loading
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(random.uniform(0.2, 0.5))
                html = self.driver.page_source
                print(f"HTML response (Selenium):\n{html[:2000]}\n---END OF HTML---")
                soup = BeautifulSoup(html, 'html.parser')
                job_cards = soup.select('div.job_seen_beacon')
                logger.info(f"Found {len(job_cards)} job cards on page {page+1}")
                if not job_cards:
                    logger.warning("No job cards found on page")
                    break
                for card in job_cards:
                    job = self._parse_job_card(card)
                    if job:
                        # Save job to DB
                        insert_job(job)
                        jobs.append(job)
                    if len(jobs) >= limit:
                        break
                page += 1
                start_val += jobs_per_page
                time.sleep(random.uniform(0.2, 0.5))
            except Exception as e:
                logger.error(f"Error fetching jobs with Selenium: {e}")
                break
        logger.info(f"Returning {len(jobs)} jobs (limit was {limit})")
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
            print("\n[DEBUG] Job card HTML:\n", card.prettify()[:1000], "\n---END OF CARD---\n")

            job_id = card.get('data-jk', '')
            if not job_id:
                a_tag = card.select_one('a.jcs-JobTitle')
                if a_tag and a_tag.has_attr('data-jk'):
                    job_id = a_tag['data-jk']
                elif a_tag and a_tag.has_attr('id') and a_tag['id'].startswith('job_'):
                    job_id = a_tag['id'].replace('job_', '')

            title_elem = card.select_one('h2.jobTitle span')
            if not title_elem:
                title_elem = card.select_one('h2.jobTitle')
            title = title_elem.text.strip() if title_elem else "Unknown Title"

            company = "Unknown Company"
            location = "Unknown Location"
            table = card.select_one('table.mainContentTable')
            if table:
                company_divs = table.select('div[class*="company"]')
                for div in company_divs:
                    text = div.get_text(strip=True)
                    if text and len(text) < 100:
                        company = text
                        break
                location_div = table.select_one('div.companyLocation')
                if location_div:
                    location = location_div.get_text(strip=True)
            if company == "Unknown Company":
                company_elem = card.select_one('span.companyName')
                if company_elem:
                    company = company_elem.text.strip()
            if location == "Unknown Location":
                location_elem = card.select_one('div.companyLocation')
                if location_elem:
                    location = location_elem.text.strip()
            # Fix: If company contains 'Remote' or a location, split it
            import re
            company_clean = company
            location_clean = location
            # If company contains 'Remote' or a city/state, split
            match = re.match(r"^(.*?)(Remote.*|[A-Z][a-z]+,? [A-Z]{2,}.*)$", company)
            if match:
                company_clean = match.group(1).strip()
                location_clean = match.group(2).strip()
            if company_clean:
                company = company_clean
            if location_clean and location_clean != "Unknown Location":
                location = location_clean

            description_elem = card.select_one('div.job-snippet')
            if not description_elem:
                description_elem = card.select_one('div[data-testid="job-snippet"]')
            description = description_elem.text.strip() if description_elem else ""

            date_elem = card.select_one('span.date')
            if not date_elem:
                date_elem = card.select_one('span[data-testid="myJobsStateDate"]')
            if date_elem:
                posted_at = date_elem.text.strip()
            else:
                posted_at = datetime.now().isoformat()

            link_elem = card.select_one('a.jcs-JobTitle')
            if not link_elem:
                link_elem = card.select_one('a[data-jk]')
            if link_elem and link_elem.has_attr('href'):
                link = 'https://www.indeed.com' + link_elem['href']
            elif job_id:
                link = f'https://www.indeed.com/viewjob?jk={job_id}'
            else:
                link = ''

            salary_elem = card.select_one('div.salary-snippet-container')
            if not salary_elem:
                salary_elem = card.select_one('span[data-testid="salary-snippet"]')
            salary_range = salary_elem.text.strip() if salary_elem else ""

            if not salary_range:
                if "senior" in title.lower() or "lead" in title.lower():
                    salary_range = "$120,000 - $180,000"
                elif "junior" in title.lower() or "entry" in title.lower():
                    salary_range = "$60,000 - $90,000"
                else:
                    salary_range = "$80,000 - $120,000"

            job_type = "Full-time"
            if any(term in description.lower() or term in title.lower() for term in ["part-time", "part time"]):
                job_type = "Part-time"
            elif any(term in description.lower() or term in title.lower() for term in ["contract", "contractor"]):
                job_type = "Contract"
            elif any(term in description.lower() or term in title.lower() for term in ["intern", "internship"]):
                job_type = "Internship"

            experience_level = "Mid-level"
            if any(term in title.lower() for term in ["senior", "sr", "lead", "principal"]):
                experience_level = "Senior"
            elif any(term in title.lower() for term in ["junior", "jr", "entry", "associate"]):
                experience_level = "Junior"

            skills = []
            common_skills = {
                "python": "Python", "javascript": "JavaScript", "js": "JavaScript",
                "react": "React", "node": "Node.js", "angular": "Angular", "vue": "Vue.js",
                "java": "Java", "c#": "C#", ".net": ".NET", "sql": "SQL", 
                "aws": "AWS", "azure": "Azure", "cloud": "Cloud Computing",
                "docker": "Docker", "kubernetes": "Kubernetes", "git": "Git",
                "html": "HTML", "css": "CSS", "typescript": "TypeScript",
                "agile": "Agile", "scrum": "Scrum", "jira": "Jira"
            }
            desc_lower = description.lower()
            for key, skill in common_skills.items():
                if key in desc_lower:
                    skills.append(skill)
            skills = skills[:5]

            return {
                "id": job_id,
                "title": title,
                "company": company,
                "location": location,
                "description": description,
                "link": link,
                "posted_at": posted_at,
                "salary_range": salary_range,
                "job_type": job_type,
                "experience_level": experience_level,
                "skills": skills
            }
        except Exception as e:
            logger.error(f"Error parsing job card: {e}")
            return None

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
    keywords = ["software engineer"]
    location = "San Francisco, CA"
    jobs = search_jobs(keywords=keywords, location=location, limit=5)
    print(f"Found {len(jobs)} jobs for '{keywords}' in {location}")
    if jobs:
        print(json.dumps(jobs[0], indent=2))

# Add this function to insert a job into the jobs table if it doesn't already exist
def insert_job(job: dict):
    """Insert a job into the jobs table if it doesn't already exist (by title, company, location)."""
    from database import get_db_connection
    conn = None
    try:
        conn, cur = get_db_connection()
        if conn is None:
            return None
        # Check if job already exists
        cur.execute(
            "SELECT id FROM jobs WHERE title = %s AND company = %s AND location = %s",
            (job["title"], job["company"], job["location"])
        )
        existing = cur.fetchone()
        if existing:
            return existing["id"]
        # Insert new job (now includes link)
        cur.execute(
            """
            INSERT INTO jobs (title, company, location, description, salary_range, job_type, experience_level, skills, posted_at, link)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (
                job["title"],
                job["company"],
                job["location"],
                job["description"],
                job["salary_range"],
                job["job_type"],
                job["experience_level"],
                job["skills"],
                job["posted_at"],
                job["link"]
            )
        )
        job_id = cur.fetchone()["id"]
        conn.commit()
        return job_id
    except Exception as e:
        print(f"[ERROR] Failed to insert job: {e}")
        if conn:
            conn.rollback()
        return None
    finally:
        if conn and not conn.closed:
            conn.close() 