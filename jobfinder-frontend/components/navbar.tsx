"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { isLoggedIn } from "@/utils/auth"
import ProfileDropdown from "./profile-dropdown"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userLoggedIn, setUserLoggedIn] = useState(false)

  // Check if user is logged in
  useEffect(() => {
    setUserLoggedIn(isLoggedIn())
    
    // Add event listener for storage changes (for when user logs in/out in another tab)
    const handleStorageChange = () => {
      setUserLoggedIn(isLoggedIn())
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Search className="h-6 w-6 text-cyan-400" />
            <span className="text-xl font-bold tracking-tight">JobFinder</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/search">
            <Button variant="ghost" className="hover:text-cyan-400">
              <Search className="h-4 w-4 mr-1" />
              Search Jobs
            </Button>
          </Link>
          
          {userLoggedIn ? (
            <ProfileDropdown />
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" className="hover:text-cyan-400">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-black">Sign up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/40">
          <div className="container py-4 flex flex-col gap-4">
            <Link href="/search" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <Search className="h-4 w-4 mr-1" />
                Search Jobs
              </Button>
            </Link>
            
            {userLoggedIn ? (
              <>
                <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Profile
                  </Button>
                </Link>
                <Link href="/settings" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Settings
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-400 hover:text-red-300"
                  onClick={() => {
                    setIsMenuOpen(false);
                    import('@/utils/auth').then(({ logout }) => {
                      logout();
                    });
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start hover:text-cyan-400">
                    Log in
                  </Button>
                </Link>
                <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-black">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
