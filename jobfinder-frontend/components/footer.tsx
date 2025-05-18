import Link from "next/link"
import { Search } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-cyan-400" />
            <span className="text-lg font-bold tracking-tight">JobFinder</span>
          </div>
          <div className="flex gap-6">
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-cyan-400">
              Terms
            </Link>
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-cyan-400">
              Privacy
            </Link>
            <Link href="/contact" className="text-xs text-muted-foreground hover:text-cyan-400">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
