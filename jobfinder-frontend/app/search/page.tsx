"use client"

import type React from "react"

import { useState, FormEvent, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Briefcase, MapPin, Building, Clock, BookmarkPlus, ExternalLink, SearchIcon, CheckCircle } from "lucide-react"
import { fetchWithAuth, isLoggedIn } from "@/utils/auth"
import { toast } from "@/components/ui/use-toast"

// Define types
interface Job {
  id: string | number
  title: string
  company: string
  location: string
  description: string
  salary_range?: string
  job_type?: string
  experience_level?: string
  // UI-specific properties added when processing API results
  matchScore?: number
  posted?: string
  skills?: string[]
  salary?: string
  saved?: boolean
}

interface SearchForm {
  role: string
  keywords: string
  location: string
  jobType: string
  experienceLevel: string
  salary: number
  remoteOnly: boolean
  recentOnly: boolean
  categories: string[]
}

export default function SearchPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<Job[]>([])
  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isSavingJob, setIsSavingJob] = useState<Record<string | number, boolean>>({})
  const [isUnsavingJob, setIsUnsavingJob] = useState<Record<string | number, boolean>>({})
  const [activeTab, setActiveTab] = useState("matches")
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [searchForm, setSearchForm] = useState<SearchForm>({
    role: "",
    keywords: "",
    location: "",
    jobType: "all",
    experienceLevel: "all",
    salary: 100,
    remoteOnly: false,
    recentOnly: false,
    categories: []
  })

  // Fetch saved jobs on component mount
  useEffect(() => {
    if (isLoggedIn()) {
      fetchSavedJobs();
    }
    
    // Check for tab query parameter
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam && ['matches', 'recent', 'saved'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
    
    // Fetch available categories
    fetchCategories();
  }, []);

  // Fetch saved jobs from the API
  const fetchSavedJobs = async () => {
    try {
      const response = await fetchWithAuth('/api/jobs/saved');
      
      if (!response.ok) {
        throw new Error('Failed to fetch saved jobs');
      }
      
      const data = await response.json();
      
      // Process jobs for display
      const processedJobs = data.map((job: Job, index: number) => ({
        ...job,
        matchScore: Math.floor(95 - index * 5),
        posted: ["Just now", "1 day ago", "2 days ago", "1 week ago"][index % 4],
        skills: job.skills || extractSkills(job.description),
        salary: job.salary_range || "$100,000 - $130,000",
        saved: true
      }));
      
      setSavedJobs(processedJobs);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      // Show toast or handle error
      toast({
        title: "Error",
        description: "Failed to fetch saved jobs",
        variant: "destructive"
      });
    }
  };

  // Fetch available categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      setAvailableCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Handle saving a job
  const handleSaveJob = async (job: Job) => {
    if (!isLoggedIn()) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save jobs",
        variant: "destructive"
      });
      return;
    }
    
    // Set loading state for this specific job
    setIsSavingJob(prev => ({ ...prev, [job.id]: true }));
    
    try {
      const response = await fetchWithAuth('/api/jobs/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          job_id: job.id
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save job');
      }
      
      // Mark this job as saved
      setSearchResults(prev => 
        prev.map(j => 
          j.id === job.id ? { ...j, saved: true } : j
        )
      );
      
      // Add to saved jobs if not already there
      const jobInSaved = savedJobs.some(j => j.id === job.id);
      if (!jobInSaved) {
        setSavedJobs(prev => [...prev, { ...job, saved: true }]);
      }
      
      // Show success toast
      toast({
        title: "Success",
        description: "Job saved successfully",
        variant: "default"
      });
      
    } catch (error) {
      console.error('Error saving job:', error);
      toast({
        title: "Error",
        description: "Failed to save job",
        variant: "destructive"
      });
    } finally {
      // Clear loading state for this job
      setIsSavingJob(prev => ({ ...prev, [job.id]: false }));
    }
  };

  // Handle unsaving a job
  const handleUnsaveJob = async (job: Job) => {
    if (!isLoggedIn()) {
      toast({
        title: "Authentication Required",
        description: "Please log in to manage saved jobs",
        variant: "destructive"
      });
      return;
    }
    
    // Set loading state for this specific job
    setIsUnsavingJob(prev => ({ ...prev, [job.id]: true }));
    
    try {
      const response = await fetchWithAuth(`/api/jobs/save/${job.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to unsave job');
      }
      
      // Remove from saved jobs
      setSavedJobs(prev => prev.filter(j => j.id !== job.id));
      
      // Update search results to mark as unsaved
      setSearchResults(prev => 
        prev.map(j => 
          j.id === job.id ? { ...j, saved: false } : j
        )
      );
      
      // Show success toast
      toast({
        title: "Success",
        description: "Job removed from saved jobs",
        variant: "default"
      });
      
    } catch (error) {
      console.error('Error unsaving job:', error);
      toast({
        title: "Error",
        description: "Failed to remove job from saved jobs",
        variant: "destructive"
      });
    } finally {
      // Clear loading state for this job
      setIsUnsavingJob(prev => ({ ...prev, [job.id]: false }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setSearchForm({
      ...searchForm,
      [id]: value
    })
  }

  const handleSelectChange = (id: string, value: string) => {
    setSearchForm({
      ...searchForm,
      [id]: value
    })
  }

  const handleSwitchChange = (id: string, checked: boolean) => {
    setSearchForm({
      ...searchForm,
      [id]: checked
    })
  }

  const handleSliderChange = (value: number[]) => {
    setSearchForm({
      ...searchForm,
      salary: value[0]
    })
  }

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Construct search parameters
      const searchParams = {
        keywords: searchForm.keywords,
        role: searchForm.role,
        location: searchForm.location,
        job_type: searchForm.jobType !== "all" ? searchForm.jobType : undefined,
        experience_level: searchForm.experienceLevel !== "all" ? searchForm.experienceLevel : undefined,
        min_salary: searchForm.salary,
        remote_only: searchForm.remoteOnly || undefined,
        recent_only: searchForm.recentOnly || undefined,
        categories: searchForm.categories.length > 0 ? searchForm.categories : undefined
      };
      
      // Remove undefined values
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key as keyof typeof searchParams] === undefined) {
          delete searchParams[key as keyof typeof searchParams];
        }
      });
      
      // Call our backend API through our Next.js API route using our auth utility
      const response = await fetchWithAuth('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchParams)
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      
      const jobs = await response.json()
      
      // Process jobs for display (add match score based on relevance)
      const processedJobs = jobs.map((job: Job, index: number) => {
        // Check if job is already saved
        const isSaved = savedJobs.some(savedJob => savedJob.id === job.id);
        
        return {
          ...job,
          // Generate a realistic match score
          matchScore: Math.floor(95 - index * 5),
          // Add additional UI-specific properties
          posted: job.posted || ["Just now", "1 day ago", "2 days ago", "1 week ago"][index % 4],
          // Calculate skills based on job description
          skills: job.skills || extractSkills(job.description),
          // Format salary for UI
          salary: job.salary_range || "$100,000 - $130,000",
          // Mark as saved if in savedJobs
          saved: isSaved
        }
      })
      
      setSearchResults(processedJobs)
    } catch (error) {
      console.error("Error fetching jobs:", error)
      // In case of error, show empty results
      setSearchResults([])
    } finally {
      setIsLoading(false)
      setHasSearched(true)
    }
  }

  // Reset all search filters to default values
  const resetFilters = () => {
    setSearchForm({
      role: "",
      keywords: "",
      location: "",
      jobType: "all",
      experienceLevel: "all",
      salary: 100,
      remoteOnly: false,
      recentOnly: false,
      categories: []
    });
  }

  // Helper function to extract skills from job description
  const extractSkills = (description: string): string[] => {
    const commonSkills = ["React", "JavaScript", "TypeScript", "HTML", "CSS", "Node.js", 
                          "Python", "AWS", "Docker", "Kubernetes", "SQL", "NoSQL", 
                          "Git", "REST API", "GraphQL", "CI/CD", "Agile", "Scrum"]
    
    // Extract 3-5 skills that appear in the description
    return commonSkills
      .filter(skill => description.toLowerCase().includes(skill.toLowerCase()))
      .slice(0, 5) || ["JavaScript", "React", "Node.js"]
  }

  // Handle category selection
  const handleCategoryChange = (category: string, checked: boolean) => {
    setSearchForm(prev => {
      if (checked) {
        return {
          ...prev,
          categories: [...prev.categories, category]
        };
      } else {
        return {
          ...prev,
          categories: prev.categories.filter(c => c !== category)
        };
      }
    });
  };

  // Render a job card (to avoid duplication)
  const renderJobCard = (job: Job) => (
    <Card
      key={job.id}
      className="bg-blue-950/30 border-border/40 hover:border-cyan-500/50 transition-colors overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-1/3 h-1 bg-gradient-to-r from-transparent to-cyan-500 opacity-70"></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{job.title}</CardTitle>
            <div className="flex items-center gap-1 mt-1 text-muted-foreground">
              <Building className="h-4 w-4" />
              <span>{job.company}</span>
            </div>
          </div>
          <Badge className="bg-cyan-500 text-black hover:bg-cyan-600">{job.matchScore}% Match</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Briefcase className="h-4 w-4 flex-shrink-0" />
            <span>{job.job_type || "Full-time"}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>Posted {job.posted}</span>
          </div>
        </div>

        <p className="text-sm mb-4">{job.description}</p>

        <div className="flex flex-wrap gap-2">
          {job.skills && job.skills.map((skill: string) => (
            <Badge
              key={skill}
              variant="outline"
              className="bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border-cyan-500/20"
            >
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 border-t border-border/20">
        <div className="text-sm font-medium">{job.salary}</div>
        <div className="flex gap-2">
          {job.saved ? (
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-cyan-500/20 text-cyan-400"
              onClick={() => handleUnsaveJob(job)}
              disabled={!!isUnsavingJob[job.id]}
            >
              {isUnsavingJob[job.id] ? (
                "Removing..."
              ) : (
                <>
                  <BookmarkPlus className="h-4 w-4 mr-1" />
                  Unsave
                </>
              )}
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="outline" 
              className="border-cyan-500/20 hover:bg-cyan-500/10"
              onClick={() => handleSaveJob(job)}
              disabled={!!isSavingJob[job.id]}
            >
              {isSavingJob[job.id] ? (
                "Saving..."
              ) : (
                <>
                  <BookmarkPlus className="h-4 w-4 mr-1" />
                  Save
                </>
              )}
            </Button>
          )}
          <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-black">
            <ExternalLink className="h-4 w-4 mr-1" />
            Apply
          </Button>
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Search Filters */}
        <div className="w-full md:w-80 space-y-6">
          <Card className="bg-blue-950/30 border-border/40 sticky top-20">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <SearchIcon className="h-5 w-5 text-cyan-400" />
                Search Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="role">Job Role</Label>
                  <Input 
                    id="role" 
                    placeholder="e.g. Frontend Developer" 
                    className="bg-background/50" 
                    value={searchForm.role}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input 
                    id="keywords" 
                    placeholder="e.g. React, TypeScript" 
                    className="bg-background/50" 
                    value={searchForm.keywords}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    placeholder="e.g. San Francisco, Remote" 
                    className="bg-background/50" 
                    value={searchForm.location}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobType">Job Type</Label>
                  <Select 
                    defaultValue="all" 
                    value={searchForm.jobType}
                    onValueChange={(value) => handleSelectChange("jobType", value)}
                  >
                    <SelectTrigger id="jobType" className="bg-background/50">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experienceLevel">Experience Level</Label>
                  <Select 
                    defaultValue="all" 
                    value={searchForm.experienceLevel}
                    onValueChange={(value) => handleSelectChange("experienceLevel", value)}
                  >
                    <SelectTrigger id="experienceLevel" className="bg-background/50">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="Junior">Entry Level</SelectItem>
                      <SelectItem value="Mid-level">Mid Level</SelectItem>
                      <SelectItem value="Senior">Senior Level</SelectItem>
                      <SelectItem value="Executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="salary-range">Salary Range</Label>
                    <span className="text-sm text-muted-foreground">${searchForm.salary}k+</span>
                  </div>
                  <Slider 
                    defaultValue={[100]} 
                    max={300} 
                    step={10} 
                    className="py-4" 
                    value={[searchForm.salary]}
                    onValueChange={handleSliderChange}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="remoteOnly" 
                      checked={searchForm.remoteOnly}
                      onCheckedChange={(checked) => handleSwitchChange("remoteOnly", checked)}
                    />
                    <Label htmlFor="remoteOnly">Remote Only</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="recentOnly"
                      checked={searchForm.recentOnly}
                      onCheckedChange={(checked) => handleSwitchChange("recentOnly", checked)}
                    />
                    <Label htmlFor="recentOnly">Posted in last 24 hours</Label>
                  </div>
                </div>

                {availableCategories.length > 0 && (
                  <div className="space-y-4 border-t border-border/20 pt-4 mt-4">
                    <Label>Job Categories</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {availableCategories.map(category => (
                        <div key={category} className="flex items-center space-x-2">
                          <Switch 
                            id={`category-${category}`}
                            checked={searchForm.categories.includes(category)}
                            onCheckedChange={(checked) => handleCategoryChange(category, checked)}
                          />
                          <Label htmlFor={`category-${category}`} className="capitalize">
                            {category.replace('_', ' ')}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Select categories to fine-tune your Indeed job search
                    </p>
                  </div>
                )}

                <div className="flex gap-2 w-full">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 border-cyan-500/20 hover:bg-cyan-500/10"
                    onClick={resetFilters}
                  >
                    Reset Filters
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black" 
                    disabled={isLoading}
                  >
                  {isLoading ? "Searching..." : "Search Jobs"}
                </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Search Results */}
        <div className="flex-1">
          <Tabs 
            defaultValue="matches" 
            value={activeTab} 
            onValueChange={(value) => {
              setActiveTab(value);
              if (value === "saved" && isLoggedIn()) {
                fetchSavedJobs();
              }
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <TabsList className="bg-blue-950/30">
                <TabsTrigger value="matches">Best Matches</TabsTrigger>
                <TabsTrigger value="recent">Most Recent</TabsTrigger>
                <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
              </TabsList>

              <Select defaultValue="relevance">
                <SelectTrigger className="w-[180px] bg-blue-950/30 border-border/40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="salary-high">Salary (High to Low)</SelectItem>
                  <SelectItem value="salary-low">Salary (Low to High)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="matches" className="mt-0">
              {!hasSearched ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="rounded-full bg-cyan-500/10 w-16 h-16 flex items-center justify-center mb-4">
                    <SearchIcon className="h-8 w-8 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Start Your Job Search</h3>
                  <p className="text-muted-foreground max-w-md">
                    Use the search filters to find your perfect job match. Our AI will analyze job listings to find the
                    best fit for you.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing <span className="font-medium">{searchResults.length}</span> results
                    </p>
                  </div>

                  {searchResults.length > 0 ? (
                    searchResults.map((job) => renderJobCard(job))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <h3 className="text-xl font-bold mb-2">No matching jobs found</h3>
                      <p className="text-muted-foreground max-w-md">
                        Try adjusting your search criteria to see more results.
                      </p>
                            </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="recent" className="mt-0">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-cyan-500/10 w-16 h-16 flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Most Recent Jobs</h3>
                <p className="text-muted-foreground max-w-md">
                  Search to see the most recently posted jobs matching your criteria.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="saved" className="mt-0">
              {!isLoggedIn() ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-cyan-500/10 w-16 h-16 flex items-center justify-center mb-4">
                  <BookmarkPlus className="h-8 w-8 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Sign In to Save Jobs</h3>
                  <p className="text-muted-foreground max-w-md">
                    You need to be signed in to save jobs and view them here.
                  </p>
                  <Button 
                    className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-black"
                    onClick={() => window.location.href = '/auth/login'}
                  >
                    Sign In
                  </Button>
                </div>
              ) : savedJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="rounded-full bg-cyan-500/10 w-16 h-16 flex items-center justify-center mb-4">
                    <BookmarkPlus className="h-8 w-8 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No Saved Jobs</h3>
                <p className="text-muted-foreground max-w-md">
                  You haven't saved any jobs yet. Save jobs to view them here later.
                </p>
              </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      You have <span className="font-medium">{savedJobs.length}</span> saved jobs
                    </p>
                  </div>
                  {savedJobs.map((job) => renderJobCard(job))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
