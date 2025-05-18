"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, Briefcase, Search, X, Plus, Save } from "lucide-react"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [skills, setSkills] = useState<string[]>([])
  const [currentSkill, setCurrentSkill] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      router.push("/search")
    }, 1500)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0])
    }
  }

  const handleAddSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()])
      setCurrentSkill("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddSkill()
    }
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
        <p className="text-muted-foreground">
          Help us understand your skills and preferences to find you the perfect job matches.
        </p>
      </div>

      <Tabs defaultValue="resume" className="space-y-8">
        <TabsList className="bg-blue-950/30 w-full justify-start">
          <TabsTrigger value="resume" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Resume
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Skills & Experience
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Job Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="space-y-6">
          <Card className="bg-blue-950/30 border-border/40">
            <CardHeader>
              <CardTitle>Upload Your Resume</CardTitle>
              <CardDescription>We'll analyze your resume to understand your skills and experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-border/40 rounded-lg p-8 text-center hover:border-cyan-500/50 transition-colors bg-gradient-to-b from-blue-950/30 to-transparent">
                <div className="flex flex-col items-center justify-center gap-4">
                  {resumeFile ? (
                    <>
                      <div className="rounded-full bg-cyan-500/10 w-16 h-16 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-cyan-400" />
                      </div>
                      <div>
                        <p className="font-medium">{resumeFile.name}</p>
                        <p className="text-sm text-muted-foreground">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <Button
                        variant="outline"
                        className="border-cyan-500/20 hover:bg-cyan-500/10"
                        onClick={() => setResumeFile(null)}
                      >
                        Remove File
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="rounded-full bg-cyan-500/10 w-16 h-16 flex items-center justify-center">
                        <Upload className="h-8 w-8 text-cyan-400" />
                      </div>
                      <div>
                        <p className="font-medium">Drag and drop your resume here</p>
                        <p className="text-sm text-muted-foreground">Supports PDF, DOCX, TXT (Max 5MB)</p>
                      </div>
                      <div className="relative">
                        <Input
                          id="resume-upload"
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept=".pdf,.docx,.txt"
                          onChange={handleFileChange}
                        />
                        <Button className="bg-cyan-500 hover:bg-cyan-600 text-black">Browse Files</Button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="resume-prompt">Tell us more about your ideal job</Label>
                  <Textarea
                    id="resume-prompt"
                    placeholder="Describe your ideal role, work environment, and any specific requirements you have..."
                    className="mt-2 bg-background/50 min-h-[120px]"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="border-cyan-500/20 hover:bg-cyan-500/10">
                Skip for now
              </Button>
              <Button
                className="bg-cyan-500 hover:bg-cyan-600 text-black"
                onClick={() => document.querySelector('[data-value="skills"]')?.click()}
              >
                Continue
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card className="bg-blue-950/30 border-border/40">
            <CardHeader>
              <CardTitle>Skills & Experience</CardTitle>
              <CardDescription>Tell us about your skills and professional experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="skills-input">Skills</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="skills-input"
                      placeholder="Add a skill (e.g., JavaScript, Project Management)"
                      className="bg-background/50 flex-1"
                      value={currentSkill}
                      onChange={(e) => setCurrentSkill(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <Button type="button" onClick={handleAddSkill} className="bg-cyan-500 hover:bg-cyan-600 text-black">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {skills.map((skill) => (
                      <Badge
                        key={skill}
                        className="bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border-cyan-500/20 flex items-center gap-1"
                      >
                        {skill}
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-1 rounded-full hover:bg-cyan-500/20 p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {skills.length === 0 && (
                      <p className="text-sm text-muted-foreground">Add your skills to help us find relevant jobs</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="experience-level">Experience Level</Label>
                  <Select defaultValue="mid">
                    <SelectTrigger id="experience-level" className="mt-2 bg-background/50">
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                      <SelectItem value="senior">Senior Level (6-9 years)</SelectItem>
                      <SelectItem value="expert">Expert (10+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="education">Highest Education</Label>
                  <Select defaultValue="bachelors">
                    <SelectTrigger id="education" className="mt-2 bg-background/50">
                      <SelectValue placeholder="Select your highest education" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="highschool">High School</SelectItem>
                      <SelectItem value="associates">Associate's Degree</SelectItem>
                      <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                      <SelectItem value="masters">Master's Degree</SelectItem>
                      <SelectItem value="phd">PhD or Doctorate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="experience-prompt">Describe your work experience</Label>
                  <Textarea
                    id="experience-prompt"
                    placeholder="Briefly describe your most relevant work experience..."
                    className="mt-2 bg-background/50 min-h-[120px]"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                className="border-cyan-500/20 hover:bg-cyan-500/10"
                onClick={() => document.querySelector('[data-value="resume"]')?.click()}
              >
                Back
              </Button>
              <Button
                className="bg-cyan-500 hover:bg-cyan-600 text-black"
                onClick={() => document.querySelector('[data-value="preferences"]')?.click()}
              >
                Continue
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card className="bg-blue-950/30 border-border/40">
            <CardHeader>
              <CardTitle>Job Preferences</CardTitle>
              <CardDescription>Tell us what you're looking for in your next role.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="job-title">Desired Job Title</Label>
                  <Input
                    id="job-title"
                    placeholder="e.g., Frontend Developer, Product Manager"
                    className="mt-2 bg-background/50"
                  />
                </div>

                <div>
                  <Label htmlFor="job-type">Job Type</Label>
                  <Select defaultValue="full-time">
                    <SelectTrigger id="job-type" className="mt-2 bg-background/50">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Preferred Location</Label>
                  <Input id="location" placeholder="e.g., San Francisco, Remote" className="mt-2 bg-background/50" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="salary-range">Minimum Salary Expectation</Label>
                    <span className="text-sm text-muted-foreground">$100k</span>
                  </div>
                  <Slider defaultValue={[100]} max={300} step={10} className="py-4" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="remote" />
                    <Label htmlFor="remote">Open to remote work</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="relocation" />
                    <Label htmlFor="relocation">Open to relocation</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="preferences-prompt">Additional preferences</Label>
                  <Textarea
                    id="preferences-prompt"
                    placeholder="Tell us about your ideal company culture, benefits, or any other preferences..."
                    className="mt-2 bg-background/50 min-h-[120px]"
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-black"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Saving profile..."
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Complete Profile & Start Searching
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-start">
              <Button
                variant="outline"
                className="border-cyan-500/20 hover:bg-cyan-500/10"
                onClick={() => document.querySelector('[data-value="skills"]')?.click()}
              >
                Back
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
