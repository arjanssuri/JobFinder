"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Briefcase, MapPin } from "lucide-react"
import { getCurrentUser, isLoggedIn } from "@/utils/auth"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  
  useEffect(() => {
    // Redirect if not logged in
    if (!isLoggedIn()) {
      router.push('/auth/login?redirect=/profile')
      return
    }
    
    // Get user from localStorage
    const currentUser = getCurrentUser()
    setUser(currentUser)
  }, [router])
  
  if (!user) {
    return (
      <div className="container py-12">
        <div className="flex justify-center items-center h-40">
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      
      <div className="grid gap-8 md:grid-cols-3">
        {/* Profile Info */}
        <Card className="col-span-2 bg-blue-950/30 border-border/40">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="h-5 w-5 text-cyan-400" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Manage your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  value={user.first_name || ''} 
                  className="bg-background/50"
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={user.last_name || ''} 
                  className="bg-background/50"
                  readOnly
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-cyan-400" />
                <Input 
                  id="email" 
                  value={user.email || ''} 
                  className="bg-background/50"
                  readOnly
                />
              </div>
            </div>
            
            <div className="pt-4">
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-black">
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Profile Stats */}
        <Card className="bg-blue-950/30 border-border/40">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-cyan-400" />
              Job Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-border/40">
              <span>Saved Jobs</span>
              <Button 
                variant="link" 
                className="text-cyan-400 p-0"
                onClick={() => router.push('/search?tab=saved')}
              >
                View All
              </Button>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b border-border/40">
              <span>Applications</span>
              <Button variant="link" className="text-cyan-400 p-0">View All</Button>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b border-border/40">
              <span>Profile Views</span>
              <span className="font-medium">0</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 