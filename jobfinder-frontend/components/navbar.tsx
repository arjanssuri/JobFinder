"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Menu, X } from "lucide-react"
import { useState } from "react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
          <Link href="/auth/login">
            <Button variant="ghost" className="hover:text-cyan-400">
              Log in
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-black">Sign up</Button>
          </Link>
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
            <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start hover:text-cyan-400">
                Log in
              </Button>
            </Link>
            <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
              <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-black">Sign up</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
