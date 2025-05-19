"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell } from "lucide-react"
import { isLoggedIn, fetchWithAuth } from "@/utils/auth"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  // Define settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    newJobs: true,
    applicationUpdates: true,
    marketingEmails: false
  })
  
  useEffect(() => {
    // Redirect if not logged in
    if (!isLoggedIn()) {
      router.push('/auth/login?redirect=/settings')
      return
    }
    
    // Fetch user settings from API
    fetchUserSettings()
  }, [router])
  
  // Fetch user settings from backend
  const fetchUserSettings = async () => {
    try {
      const response = await fetchWithAuth('/api/preferences')
      
      if (response.ok) {
        const data = await response.json()
        
        // Update state if we have settings
        if (data) {
          setNotificationSettings({
            emailAlerts: data.email_notifications || false,
            newJobs: data.new_job_alerts || false,
            applicationUpdates: data.application_updates || false,
            marketingEmails: data.marketing_emails || false
          })
        }
      }
    } catch (error) {
      console.error('Error fetching user settings:', error)
    }
  }
  
  // Handle switch changes
  const handleSwitchChange = (setting: string, checked: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: checked
    }))
  }
  
  // Handle saving settings
  const saveSettings = async () => {
    setIsLoading(true)
    try {
      // Convert to backend format
      const settingsData = {
        email_notifications: notificationSettings.emailAlerts,
        new_job_alerts: notificationSettings.newJobs,
        application_updates: notificationSettings.applicationUpdates,
        marketing_emails: notificationSettings.marketingEmails
      }
      
      const response = await fetchWithAuth('/api/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settingsData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to save settings')
      }
      
      toast({
        title: "Settings saved",
        description: "Your notification settings have been updated",
        variant: "default"
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

          <Card className="bg-blue-950/30 border-border/40">
            <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Bell className="h-5 w-5 text-cyan-400" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Manage how you receive notifications and alerts
          </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
                      <div>
                <Label htmlFor="emailAlerts" className="text-base">Email Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive important notifications via email
                </p>
              </div>
              <Switch 
                id="emailAlerts" 
                checked={notificationSettings.emailAlerts}
                onCheckedChange={(checked) => handleSwitchChange("emailAlerts", checked)}
                  />
                </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="newJobs" className="text-base">New Job Matches</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when new jobs match your preferences
                </p>
              </div>
              <Switch 
                id="newJobs" 
                checked={notificationSettings.newJobs}
                onCheckedChange={(checked) => handleSwitchChange("newJobs", checked)}
              />
                </div>

            <div className="flex items-center justify-between">
                <div>
                <Label htmlFor="applicationUpdates" className="text-base">Application Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates on your job applications
                </p>
              </div>
              <Switch 
                id="applicationUpdates" 
                checked={notificationSettings.applicationUpdates}
                onCheckedChange={(checked) => handleSwitchChange("applicationUpdates", checked)}
                  />
                </div>

            <div className="flex items-center justify-between">
                <div>
                <Label htmlFor="marketingEmails" className="text-base">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive tips, news and updates about JobFinder
                </p>
                </div>
              <Switch 
                id="marketingEmails" 
                checked={notificationSettings.marketingEmails}
                onCheckedChange={(checked) => handleSwitchChange("marketingEmails", checked)}
              />
                  </div>
                </div>

                <div className="pt-4">
                  <Button
              className="bg-cyan-500 hover:bg-cyan-600 text-black"
              onClick={saveSettings}
                    disabled={isLoading}
                  >
              {isLoading ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
            </CardContent>
          </Card>
    </div>
  )
}
