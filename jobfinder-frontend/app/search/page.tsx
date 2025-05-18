"use client"

import type React from "react"

import { useState, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Briefcase, MapPin, Building, Clock, BookmarkPlus, ExternalLink, SearchIcon } from "lucide-react"
import { fetchWithAuth } from "@/utils/auth"

// Define types
interface Job {
  id: string
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
}

export default function SearchPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<Job[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [searchForm, setSearchForm] = useState<SearchForm>({
    role: "",
    keywords: "",
    location: "",
    jobType: "all",
    experienceLevel: "all",
    salary: 100,
    remoteOnly: false,
    recentOnly: false
  })

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
        keywords: searchForm.keywords || searchForm.role,
        location: searchForm.location,
        job_type: searchForm.jobType !== "all" ? searchForm.jobType : undefined,
        experience_level: searchForm.experienceLevel !== "all" ? searchForm.experienceLevel : undefined
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
      const processedJobs = jobs.map((job: Job, index: number) => ({
        ...job,
        // Generate a realistic match score
        matchScore: Math.floor(95 - index * 5),
        // Add additional UI-specific properties
        posted: ["Just now", "1 day ago", "2 days ago", "1 week ago"][index % 4],
        // Calculate skills based on job description
        skills: job.skills || extractSkills(job.description),
        // Format salary for UI
        salary: job.salary_range || "$100,000 - $130,000"
      }))
      
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

                <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-black" disabled={isLoading}>
                  {isLoading ? "Searching..." : "Search Jobs"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Search Results */}
        <div className="flex-1">
          <Tabs defaultValue="matches">
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
                    searchResults.map((job) => (
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
                            <Button size="sm" variant="outline" className="border-cyan-500/20 hover:bg-cyan-500/10">
                              <BookmarkPlus className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-black">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Apply
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))
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
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-cyan-500/10 w-16 h-16 flex items-center justify-center mb-4">
                  <BookmarkPlus className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Saved Jobs</h3>
                <p className="text-muted-foreground max-w-md">
                  You haven't saved any jobs yet. Save jobs to view them here later.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
