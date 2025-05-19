"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { User, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { getCurrentUser, logout } from "@/utils/auth"

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const user = getCurrentUser()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsOpen(false)
    logout()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        className="hover:text-cyan-400 flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <User className="h-4 w-4" />
        <span>{user?.email?.split('@')[0] || 'Profile'}</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-blue-950/90 border border-border/40 overflow-hidden z-50">
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-cyan-400 border-b border-border/40">
              {user?.email}
            </div>

            <Link href="/profile" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-start rounded-none text-sm font-normal">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>

            <Link href="/settings" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-start rounded-none text-sm font-normal">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>

            <div className="border-t border-border/40 mt-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start rounded-none text-sm font-normal text-red-400 hover:text-red-300 hover:bg-red-950/30"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 