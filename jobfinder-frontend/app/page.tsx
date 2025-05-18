import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 to-black z-0"></div>
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1600')] opacity-10 mix-blend-overlay"></div>
        <div className="container relative z-10">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div className="flex flex-col gap-6">
              <div className="inline-block rounded-full bg-cyan-500/10 px-3 py-1 text-sm text-cyan-400 backdrop-blur">
                Launching Soon
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Find Your <span className="text-cyan-400">Perfect Job</span> Match
              </h1>
              <p className="text-xl text-muted-foreground">
                Our intelligent job-scraping platform matches you with relevant positions based on your skills and
                preferences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-black">
                    Get Started
                  </Button>
                </Link>
                <Link href="/search">
                  <Button size="lg" variant="outline" className="border-cyan-500/20 hover:bg-cyan-500/10">
                    Try Demo
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-[400px] w-full rounded-lg overflow-hidden border border-border/40 shadow-xl shadow-cyan-500/5">
              <Image
                src="/placeholder.svg?height=800&width=800&text=JobFinder+Dashboard"
                alt="JobFinder Dashboard Preview"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-[600px] h-[350px] bg-blue-950/80 rounded-lg border border-cyan-500/30 shadow-lg shadow-cyan-500/20 overflow-hidden">
                  <div className="h-12 bg-black/50 border-b border-cyan-500/20 flex items-center px-4">
                    <div className="w-3 h-3 rounded-full bg-cyan-500 mr-2"></div>
                    <div className="text-white text-sm font-medium">JobFinder Dashboard</div>
                  </div>
                  <div className="flex h-[calc(100%-3rem)]">
                    <div className="w-1/4 border-r border-cyan-500/20 bg-black/30 p-3">
                      <div className="h-8 w-full bg-blue-950/80 rounded mb-3"></div>
                      <div className="h-8 w-full bg-blue-950/80 rounded mb-3"></div>
                      <div className="h-8 w-full bg-cyan-500/30 rounded mb-3"></div>
                      <div className="h-8 w-full bg-blue-950/80 rounded mb-3"></div>
                      <div className="h-8 w-full bg-blue-950/80 rounded"></div>
                    </div>
                    <div className="w-3/4 p-3">
                      <div className="flex justify-between mb-4">
                        <div className="h-8 w-1/2 bg-blue-950/80 rounded"></div>
                        <div className="h-8 w-1/4 bg-blue-950/80 rounded"></div>
                      </div>
                      <div className="h-24 w-full bg-blue-950/80 rounded mb-3 border border-cyan-500/20 p-2 flex justify-between">
                        <div className="w-3/4">
                          <div className="h-4 w-1/2 bg-white/20 rounded mb-2"></div>
                          <div className="h-3 w-1/3 bg-white/10 rounded mb-4"></div>
                          <div className="h-3 w-2/3 bg-white/10 rounded"></div>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-cyan-500 flex items-center justify-center text-xs text-black font-bold">
                          95%
                        </div>
                      </div>
                      <div className="h-24 w-full bg-blue-950/80 rounded mb-3 border border-cyan-500/20 p-2 flex justify-between">
                        <div className="w-3/4">
                          <div className="h-4 w-1/2 bg-white/20 rounded mb-2"></div>
                          <div className="h-3 w-1/3 bg-white/10 rounded mb-4"></div>
                          <div className="h-3 w-2/3 bg-white/10 rounded"></div>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-cyan-500 flex items-center justify-center text-xs text-black font-bold">
                          88%
                        </div>
                      </div>
                      <div className="h-24 w-full bg-blue-950/80 rounded border border-cyan-500/20 p-2 flex justify-between">
                        <div className="w-3/4">
                          <div className="h-4 w-1/2 bg-white/20 rounded mb-2"></div>
                          <div className="h-3 w-1/3 bg-white/10 rounded mb-4"></div>
                          <div className="h-3 w-2/3 bg-white/10 rounded"></div>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-cyan-500 flex items-center justify-center text-xs text-black font-bold">
                          82%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border/40 bg-gradient-to-r from-blue-950/50 to-black/50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl md:text-4xl font-bold text-cyan-400">10K+</span>
              <span className="text-sm text-muted-foreground">Jobs Scraped Daily</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl md:text-4xl font-bold text-cyan-400">95%</span>
              <span className="text-sm text-muted-foreground">Match Accuracy</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl md:text-4xl font-bold text-cyan-400">200+</span>
              <span className="text-sm text-muted-foreground">Job Boards</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl md:text-4xl font-bold text-cyan-400">5K+</span>
              <span className="text-sm text-muted-foreground">Happy Users</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section with Sticky Scroll */}
      <section className="py-20 relative">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform makes finding your next job simple and efficient.
            </p>
          </div>

          <div className="relative h-[80vh] overflow-hidden">
            <div className="sticky-container">
              {/* Step 1 */}
              <div className="sticky-section h-screen flex items-center">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="order-2 md:order-1">
                    <div className="rounded-full bg-cyan-500/10 w-16 h-16 flex items-center justify-center mb-6">
                      <span className="text-2xl font-bold text-cyan-400">1</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">Upload Your Resume</h3>
                    <p className="text-lg text-muted-foreground mb-6">
                      Our AI analyzes your resume to understand your skills, experience, and career goals.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                        PDF Support
                      </Badge>
                      <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                        DOCX Support
                      </Badge>
                      <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                        AI Analysis
                      </Badge>
                      <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                        Skill Extraction
                      </Badge>
                    </div>
                  </div>
                  <div className="order-1 md:order-2 relative h-[300px] md:h-[400px] rounded-lg overflow-hidden border border-border/40 shadow-xl shadow-cyan-500/5">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full max-w-[500px] h-[350px] bg-blue-950/80 rounded-lg border border-cyan-500/30 shadow-lg shadow-cyan-500/20 p-6">
                        <div className="border-2 border-dashed border-cyan-500/30 rounded-lg p-8 text-center h-[200px] flex flex-col items-center justify-center bg-black/20">
                          <div className="rounded-full bg-cyan-500/10 w-16 h-16 flex items-center justify-center mb-4">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-cyan-400"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="17 8 12 3 7 8"></polyline>
                              <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                          </div>
                          <p className="text-white font-medium mb-1">Drag and drop your resume here</p>
                          <p className="text-white/60 text-sm">Supports PDF, DOCX, TXT (Max 5MB)</p>
                        </div>
                        <div className="mt-4 flex justify-center">
                          <div className="bg-cyan-500 text-black px-4 py-2 rounded-md font-medium text-sm">
                            Browse Files
                          </div>
                        </div>
                        <div className="mt-6">
                          <div className="text-white text-sm mb-2">Tell us more about your ideal job</div>
                          <div className="h-12 bg-black/30 rounded-md border border-cyan-500/20"></div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none"></div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="sticky-section h-screen flex items-center">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden border border-border/40 shadow-xl shadow-cyan-500/5">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full max-w-[500px] h-[350px] bg-blue-950/80 rounded-lg border border-cyan-500/30 shadow-lg shadow-cyan-500/20 p-6">
                        <div className="mb-4">
                          <div className="text-white text-sm mb-2">Job Role</div>
                          <div className="h-10 bg-black/30 rounded-md border border-cyan-500/20 flex items-center px-3">
                            <span className="text-white/70 text-sm">Frontend Developer</span>
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="text-white text-sm mb-2">Skills</div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-full px-3 py-1 text-cyan-400 text-xs">
                              React
                            </div>
                            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-full px-3 py-1 text-cyan-400 text-xs">
                              TypeScript
                            </div>
                            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-full px-3 py-1 text-cyan-400 text-xs">
                              Next.js
                            </div>
                            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-full px-3 py-1 text-cyan-400 text-xs">
                              UI/UX
                            </div>
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="text-white text-sm mb-2">Location</div>
                          <div className="h-10 bg-black/30 rounded-md border border-cyan-500/20 flex items-center px-3">
                            <span className="text-white/70 text-sm">Remote, San Francisco</span>
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="text-white text-sm mb-2">Experience Level</div>
                          <div className="h-10 bg-black/30 rounded-md border border-cyan-500/20 flex items-center px-3">
                            <span className="text-white/70 text-sm">Mid Level (3-5 years)</span>
                          </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                          <div className="bg-cyan-500 text-black px-4 py-2 rounded-md font-medium text-sm">
                            Continue
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none"></div>
                  </div>
                  <div>
                    <div className="rounded-full bg-cyan-500/10 w-16 h-16 flex items-center justify-center mb-6">
                      <span className="text-2xl font-bold text-cyan-400">2</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">Customize Your Search</h3>
                    <p className="text-lg text-muted-foreground mb-6">
                      Fine-tune your job preferences with our intuitive interface to find exactly what you're looking
                      for.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                        Role Filtering
                      </Badge>
                      <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                        Skill Matching
                      </Badge>
                      <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                        Location Options
                      </Badge>
                      <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                        Salary Range
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="sticky-section h-screen flex items-center">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="order-2 md:order-1">
                    <div className="rounded-full bg-cyan-500/10 w-16 h-16 flex items-center justify-center mb-6">
                      <span className="text-2xl font-bold text-cyan-400">3</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">Get Matched</h3>
                    <p className="text-lg text-muted-foreground mb-6">
                      Our AI algorithm matches you with the most relevant job opportunities based on your profile and
                      preferences.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                        AI Matching
                      </Badge>
                      <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                        Match Scores
                      </Badge>
                      <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                        Real-time Updates
                      </Badge>
                      <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                        One-Click Apply
                      </Badge>
                    </div>
                  </div>
                  <div className="order-1 md:order-2 relative h-[300px] md:h-[400px] rounded-lg overflow-hidden border border-border/40 shadow-xl shadow-cyan-500/5">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full max-w-[500px] h-[350px] bg-blue-950/80 rounded-lg border border-cyan-500/30 shadow-lg shadow-cyan-500/20 p-6 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                          <div className="text-white font-medium">Best Matches</div>
                          <div className="text-white/60 text-sm">4 results</div>
                        </div>

                        {/* Job Card 1 */}
                        <div className="bg-black/30 rounded-lg border border-cyan-500/20 p-3 mb-3 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-1/3 h-1 bg-gradient-to-r from-transparent to-cyan-500"></div>
                          <div className="flex justify-between">
                            <div>
                              <div className="text-white font-medium">Senior Frontend Developer</div>
                              <div className="text-white/60 text-xs mt-1">TechCorp Inc. • San Francisco (Remote)</div>
                            </div>
                            <div className="bg-cyan-500 text-black text-xs font-bold rounded-full h-6 px-2 flex items-center">
                              95%
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-full px-2 py-0.5 text-cyan-400 text-xs">
                              React
                            </div>
                            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-full px-2 py-0.5 text-cyan-400 text-xs">
                              Next.js
                            </div>
                          </div>
                        </div>

                        {/* Job Card 2 */}
                        <div className="bg-black/30 rounded-lg border border-cyan-500/20 p-3 mb-3 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-1/3 h-1 bg-gradient-to-r from-transparent to-cyan-500"></div>
                          <div className="flex justify-between">
                            <div>
                              <div className="text-white font-medium">Full Stack Engineer</div>
                              <div className="text-white/60 text-xs mt-1">InnovateTech • New York (Hybrid)</div>
                            </div>
                            <div className="bg-cyan-500 text-black text-xs font-bold rounded-full h-6 px-2 flex items-center">
                              88%
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-full px-2 py-0.5 text-cyan-400 text-xs">
                              React
                            </div>
                            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-full px-2 py-0.5 text-cyan-400 text-xs">
                              Node.js
                            </div>
                          </div>
                        </div>

                        {/* Job Card 3 */}
                        <div className="bg-black/30 rounded-lg border border-cyan-500/20 p-3 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-1/3 h-1 bg-gradient-to-r from-transparent to-cyan-500"></div>
                          <div className="flex justify-between">
                            <div>
                              <div className="text-white font-medium">UI/UX Designer</div>
                              <div className="text-white/60 text-xs mt-1">DesignHub • Remote</div>
                            </div>
                            <div className="bg-cyan-500 text-black text-xs font-bold rounded-full h-6 px-2 flex items-center">
                              82%
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-full px-2 py-0.5 text-cyan-400 text-xs">
                              Figma
                            </div>
                            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-full px-2 py-0.5 text-cyan-400 text-xs">
                              UI/UX
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-center">
                          <div className="bg-cyan-500 text-black px-4 py-2 rounded-md font-medium text-sm w-full text-center">
                            View All Matches
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="rounded-2xl bg-gradient-to-r from-blue-950 to-black p-8 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1200')] opacity-10 mix-blend-overlay"></div>
            <div className="relative z-10 max-w-2xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Find Your Dream Job?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of job seekers who have found their perfect match with JobFinder.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-black">
                    Get Started for Free
                  </Button>
                </Link>
                <Link href="/search">
                  <Button size="lg" variant="outline" className="border-cyan-500/20 hover:bg-cyan-500/10">
                    Try Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
