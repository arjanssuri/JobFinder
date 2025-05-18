"use client"

import type React from "react"

import { useState } from "react"
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

export default function SearchPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  // Mock job data
  const mockJobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA (Remote)",
      salary: "$120,000 - $150,000",
      type: "Full-time",
      posted: "2 days ago",
      description:
        "We're looking for a Senior Frontend Developer with experience in React, Next.js, and TypeScript to join our growing team.",
      skills: ["React", "Next.js", "TypeScript", "CSS", "UI/UX"],
      matchScore: 95,
    },
    {
      id: 2,
      title: "Full Stack Engineer",
      company: "InnovateTech",
      location: "New York, NY (Hybrid)",
      salary: "$110,000 - $140,000",
      type: "Full-time",
      posted: "1 week ago",
      description: "Join our engineering team to build scalable web applications using modern technologies.",
      skills: ["JavaScript", "React", "Node.js", "MongoDB", "AWS"],
      matchScore: 88,
    },
    {
      id: 3,
      title: "UI/UX Designer",
      company: "DesignHub",
      location: "Remote",
      salary: "$90,000 - $120,000",
      type: "Contract",
      posted: "3 days ago",
      description:
        "Looking for a talented UI/UX Designer to create beautiful and intuitive user interfaces for our products.",
      skills: ["Figma", "Adobe XD", "Prototyping", "User Research"],
      matchScore: 82,
    },
    {
      id: 4,
      title: "DevOps Engineer",
      company: "CloudSystems",
      location: "Austin, TX",
      salary: "$130,000 - $160,000",
      type: "Full-time",
      posted: "Just now",
      description: "Help us build and maintain our cloud infrastructure and CI/CD pipelines.",
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
      matchScore: 75,
    },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setSearchResults(mockJobs)
      setIsLoading(false)
      setHasSearched(true)
    }, 1500)
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
                  <Input id="role" placeholder="e.g. Frontend Developer" className="bg-background/50" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input id="keywords" placeholder="e.g. React, TypeScript" className="bg-background/50" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="e.g. San Francisco, Remote" className="bg-background/50" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-type">Job Type</Label>
                  <Select defaultValue="all">
                    <SelectTrigger id="job-type" className="bg-background/50">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experience Level</Label>
                  <Select defaultValue="all">
                    <SelectTrigger id="experience" className="bg-background/50">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="salary-range">Salary Range</Label>
                    <span className="text-sm text-muted-foreground">$100k+</span>
                  </div>
                  <Slider defaultValue={[100]} max={300} step={10} className="py-4" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="remote" />
                    <Label htmlFor="remote">Remote Only</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="recent" />
                    <Label htmlFor="recent">Posted in last 24 hours</Label>
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

                  {searchResults.map((job) => (
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
                            <span>{job.type}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span>Posted {job.posted}</span>
                          </div>
                        </div>

                        <p className="text-sm mb-4">{job.description}</p>

                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((skill: string) => (
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
                  ))}
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
